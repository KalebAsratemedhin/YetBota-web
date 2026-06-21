import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from temporalio.client import Client
from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from domain.entities import ChatQuery, ChatResponse, Chunk, ScoredChunk
from infrastructure.temporal.activities import RagActivities
from infrastructure.temporal.queues import RAG_CHAT_QUEUE, RAG_CHAT_WORKFLOW
from infrastructure.temporal.workflows import RagChatWorkflow


def _activities(
    *,
    embed_value: list[float],
    search_results: list[ScoredChunk],
    llm_output: str = "the answer",
    min_similarity: float = 0.5,
) -> RagActivities:
    embedder = AsyncMock()
    embedder.embed = AsyncMock(return_value=embed_value)
    vector_store = AsyncMock()
    vector_store.search = AsyncMock(return_value=search_results)
    llm = AsyncMock()
    llm.generate = AsyncMock(return_value=llm_output)
    prompt_builder = MagicMock(return_value="<prompt>")
    return RagActivities(
        embedder=embedder,
        vector_store=vector_store,
        llm=llm,
        prompt_builder=prompt_builder,
        top_k=5,
        min_similarity=min_similarity,
        max_tokens=100,
        temperature=0.2,
    )


def _hit(source_id: str, score: float) -> ScoredChunk:
    return ScoredChunk(
        chunk=Chunk(source_id=source_id, kind="post", text="t", segment_idx=0),
        score=score,
    )


async def _run(activities: RagActivities, query: ChatQuery) -> ChatResponse:
    async with await WorkflowEnvironment.start_time_skipping(
        data_converter=pydantic_data_converter,
    ) as env:
        client: Client = env.client
        worker = Worker(
            client,
            task_queue=RAG_CHAT_QUEUE,
            workflows=[RagChatWorkflow],
            activities=[
                activities.embed_query,
                activities.search_chunks,
                activities.generate_answer,
            ],
        )
        async with worker:
            return await client.execute_workflow(
                RAG_CHAT_WORKFLOW,
                query,
                id=f"rag-chat-test-{uuid.uuid4()}",
                task_queue=RAG_CHAT_QUEUE,
                result_type=ChatResponse,
            )


@pytest.mark.asyncio
async def test_workflow_returns_answer_when_hits_pass_threshold() -> None:
    activities = _activities(
        embed_value=[0.1, 0.2],
        search_results=[_hit("p1", 0.9)],
        llm_output="  generated answer  ",
        min_similarity=0.5,
    )
    result = await _run(activities, ChatQuery(text="why?"))
    assert result.answer == "generated answer"
    assert len(result.citations) == 1
    assert result.citations[0].source_id == "p1"


@pytest.mark.asyncio
async def test_workflow_returns_fallback_when_no_hits() -> None:
    activities = _activities(
        embed_value=[0.1, 0.2],
        search_results=[],
    )
    result = await _run(activities, ChatQuery(text="why?"))
    assert "do not have verified information" in result.answer
    assert result.citations == []


@pytest.mark.asyncio
async def test_workflow_returns_fallback_when_below_min_similarity() -> None:
    activities = _activities(
        embed_value=[0.1, 0.2],
        search_results=[_hit("p1", 0.2)],
        min_similarity=0.8,
    )
    result = await _run(activities, ChatQuery(text="why?"))
    assert "do not have verified information" in result.answer
    assert result.citations == []
