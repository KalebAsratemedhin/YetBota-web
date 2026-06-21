from temporalio.client import Client
from temporalio.worker import Worker

from infrastructure.config.settings import TemporalSettings
from infrastructure.observability import get_logger
from infrastructure.temporal.activities import IngestActivities
from infrastructure.temporal.queues import POST_EMBEDDING_QUEUE
from infrastructure.temporal.workflows import AnswerEmbeddingWorkflow, PostEmbeddingWorkflow

logger = get_logger(__name__)


class TemporalWorker:
    def __init__(
        self,
        *,
        client: Client,
        settings: TemporalSettings,
        ingest_activities: IngestActivities,
    ) -> None:
        self._worker = Worker(
            client,
            task_queue=POST_EMBEDDING_QUEUE,
            workflows=[PostEmbeddingWorkflow, AnswerEmbeddingWorkflow],
            activities=[
                ingest_activities.fetch_post,
                ingest_activities.fetch_comment,
                ingest_activities.run_ingest,
            ],
            max_concurrent_activities=settings.max_concurrent_activities,
            max_concurrent_workflow_tasks=settings.max_concurrent_workflow_tasks,
        )

    async def run(self) -> None:
        logger.info("temporal_worker.started", task_queue=POST_EMBEDDING_QUEUE)
        try:
            await self._worker.run()
        finally:
            logger.info("temporal_worker.stopped", task_queue=POST_EMBEDDING_QUEUE)

    async def shutdown(self) -> None:
        await self._worker.shutdown()
