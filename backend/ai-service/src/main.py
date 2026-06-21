import asyncio
import os
import signal
from contextlib import AsyncExitStack
from typing import Any

import uvicorn

from application.consult_assistant import ConsultAssistant
from application.ingest_content import IngestContent
from application.manage_conversation import ManageConversation
from application.screen_text import ScreenText
from infrastructure.chunking import RuneWindowChunker
from infrastructure.config import Settings, get_settings
from infrastructure.embedding import GeminiEmbedder
from infrastructure.graph import Neo4jSimilarityGraph
from infrastructure.llm import (
    SCREENING_RESPONSE_SCHEMA,
    AssistantPromptBuilder,
    GeminiLLM,
    ScreeningPromptBuilder,
)
from infrastructure.messaging import RabbitMQConnection, RabbitMQConsumer, RabbitMQPublisher
from infrastructure.observability import configure_logging, get_logger
from infrastructure.postgres import (
    PostgresCommentSource,
    PostgresConversationRepository,
    PostgresPostSource,
)
from infrastructure.vector import WeaviateVectorStore
from interfaces.http import create_app
from interfaces.workers.ingest_worker import IngestWorker


async def _serve(settings: Settings) -> None:
    log = get_logger(__name__)
    log.info("service.starting", version=settings.app.version)

    async with AsyncExitStack() as stack:
        embedder = GeminiEmbedder(settings.gemini)
        llm = GeminiLLM(settings.gemini)

        vector_store = WeaviateVectorStore(settings.weaviate)
        await vector_store.connect()
        stack.push_async_callback(vector_store.close)

        similarity_graph: Neo4jSimilarityGraph | None = None
        if settings.similarity.enabled:
            similarity_graph = Neo4jSimilarityGraph(settings.neo4j)
            await similarity_graph.connect()
            stack.push_async_callback(similarity_graph.close)

        post_source = PostgresPostSource(settings.postgres)
        await post_source.connect()
        stack.push_async_callback(post_source.close)

        comment_source = PostgresCommentSource(settings.postgres)
        await comment_source.connect()
        stack.push_async_callback(comment_source.close)

        conversation_repo = PostgresConversationRepository(settings.postgres)
        await conversation_repo.connect()
        stack.push_async_callback(conversation_repo.close)

        rabbitmq_connection = RabbitMQConnection(settings.rabbitmq)
        await rabbitmq_connection.connect()
        stack.push_async_callback(rabbitmq_connection.close)

        chunker = RuneWindowChunker(settings.chunker)
        ingest_use_case = IngestContent(
            chunker=chunker,
            embedder=embedder,
            vector_store=vector_store,
            distance_threshold=settings.dedup.distance_threshold,
            spatial_radius_m=settings.dedup.spatial_radius_m,
            similarity_graph=similarity_graph,
            similarity_top_n=settings.similarity.top_n,
            similarity_oversample=settings.similarity.candidate_oversample,
            logger=log,
        )

        rabbitmq_consumer = RabbitMQConsumer(rabbitmq_connection, settings.rabbitmq)
        rabbitmq_publisher = RabbitMQPublisher(rabbitmq_connection)
        ingest_worker = IngestWorker(
            consumer=rabbitmq_consumer,
            publisher=rabbitmq_publisher,
            use_case=ingest_use_case,
            settings=settings.rabbitmq,
        )

        assistant_use_case = ConsultAssistant(
            embedder=embedder,
            vector_store=vector_store,
            llm=llm,
            prompt_builder=AssistantPromptBuilder(),
            top_k=settings.rag.top_k,
            min_similarity=settings.rag.min_similarity,
            max_tokens=settings.gemini.max_tokens,
            temperature=settings.gemini.temperature,
        )

        conversation_use_case = ManageConversation(
            repository=conversation_repo,
            assistant=assistant_use_case,
        )

        screening_use_case = ScreenText(
            llm=llm,
            prompt_builder=ScreeningPromptBuilder(),
            response_schema=SCREENING_RESPONSE_SCHEMA,
            block_threshold=settings.screening.block_threshold,
            timeout_s=settings.screening.timeout_s,
            cache_size=settings.screening.cache_size,
            cache_ttl_s=settings.screening.cache_ttl_s,
        )

        app = create_app(settings)
        app.state.settings = settings
        app.state.assistant = assistant_use_case
        app.state.conversations = conversation_use_case
        app.state.screening = screening_use_case
        app.state.similarity_graph = similarity_graph

        uv_config = uvicorn.Config(
            app,
            host=settings.http.host,
            port=settings.http.port,
            log_config=None,
            access_log=False,
            lifespan="on",
            ws="none",
        )
        uv_server = uvicorn.Server(uv_config)

        stop_event = asyncio.Event()

        def _request_shutdown(*_: Any) -> None:
            if not stop_event.is_set():
                log.info("service.shutdown_requested")
                stop_event.set()

        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, _request_shutdown)
            except NotImplementedError:
                signal.signal(sig, _request_shutdown)

        async def _watch_stop() -> None:
            await stop_event.wait()
            uv_server.should_exit = True

        log.info("service.started", http_port=settings.http.port)

        try:
            await asyncio.gather(
                uv_server.serve(),
                ingest_worker.run(stop_event),
                _watch_stop(),
                return_exceptions=False,
            )
        except asyncio.CancelledError:
            pass
        finally:
            log.info("service.stopped")


def run() -> None:
    settings = get_settings()
    if port := os.getenv("PORT"):
        settings = settings.model_copy(
            update={"http": settings.http.model_copy(update={"port": int(port)})}
        )
    configure_logging(settings.logging)
    asyncio.run(_serve(settings))


if __name__ == "__main__":
    run()
