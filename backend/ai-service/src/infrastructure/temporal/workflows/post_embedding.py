from datetime import timedelta

from pydantic import BaseModel, ConfigDict, Field
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from domain.entities import IngestRequest, IngestResult
    from infrastructure.temporal.activities import IngestActivities
    from infrastructure.temporal.queues import POST_EMBEDDING_WORKFLOW

_FETCH_TIMEOUT = timedelta(seconds=30)
_INGEST_TIMEOUT = timedelta(minutes=5)

_FETCH_RETRY = RetryPolicy(
    maximum_attempts=5,
    initial_interval=timedelta(seconds=1),
    non_retryable_error_types=["PostNotFound"],
)
_INGEST_RETRY = RetryPolicy(
    maximum_attempts=3,
    initial_interval=timedelta(seconds=2),
    non_retryable_error_types=["MetadataError"],
)


class PostEmbeddingInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True, frozen=True)

    post_id: str = Field(alias="PostID")


@workflow.defn(name=POST_EMBEDDING_WORKFLOW)
class PostEmbeddingWorkflow:
    @workflow.run
    async def run(self, input: PostEmbeddingInput) -> IngestResult:
        post = await workflow.execute_activity_method(
            IngestActivities.fetch_post,
            input.post_id,
            start_to_close_timeout=_FETCH_TIMEOUT,
            retry_policy=_FETCH_RETRY,
        )

        kind = "question" if post.is_question else "post"
        text = post.title.strip()
        if post.description.strip():
            text = f"{text}\n\n{post.description}".strip()

        req = IngestRequest(
            content_id=post.id,
            kind=kind,
            user_id=post.user_id,
            text=text,
            tags=post.tags,
            latitude=post.latitude,
            longitude=post.longitude,
        )

        return await workflow.execute_activity_method(
            IngestActivities.run_ingest,
            req,
            start_to_close_timeout=_INGEST_TIMEOUT,
            retry_policy=_INGEST_RETRY,
        )
