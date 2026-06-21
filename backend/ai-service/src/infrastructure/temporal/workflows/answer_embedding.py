from datetime import timedelta

from pydantic import BaseModel, ConfigDict, Field
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from domain.entities import IngestRequest, IngestResult
    from infrastructure.temporal.activities import IngestActivities
    from infrastructure.temporal.queues import ANSWER_EMBEDDING_WORKFLOW

_FETCH_TIMEOUT = timedelta(seconds=30)
_INGEST_TIMEOUT = timedelta(minutes=5)

_FETCH_RETRY = RetryPolicy(
    maximum_attempts=5,
    initial_interval=timedelta(seconds=1),
    non_retryable_error_types=["PostNotFound", "CommentNotFound"],
)
_INGEST_RETRY = RetryPolicy(
    maximum_attempts=3,
    initial_interval=timedelta(seconds=2),
    non_retryable_error_types=["MetadataError"],
)


class AnswerEmbeddingInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True, frozen=True)

    comment_id: str = Field(alias="CommentID")


@workflow.defn(name=ANSWER_EMBEDDING_WORKFLOW)
class AnswerEmbeddingWorkflow:
    @workflow.run
    async def run(self, input: AnswerEmbeddingInput) -> IngestResult:
        comment = await workflow.execute_activity_method(
            IngestActivities.fetch_comment,
            input.comment_id,
            start_to_close_timeout=_FETCH_TIMEOUT,
            retry_policy=_FETCH_RETRY,
        )

        question = await workflow.execute_activity_method(
            IngestActivities.fetch_post,
            comment.post_id,
            start_to_close_timeout=_FETCH_TIMEOUT,
            retry_policy=_FETCH_RETRY,
        )

        context = question.title.strip()
        if question.description.strip():
            context = f"{context}\n\n{question.description}".strip()

        req = IngestRequest(
            content_id=comment.id,
            kind="answer",
            user_id=comment.user_id,
            text=comment.body,
            parent_id=comment.post_id,
            context=context,
        )

        return await workflow.execute_activity_method(
            IngestActivities.run_ingest,
            req,
            start_to_close_timeout=_INGEST_TIMEOUT,
            retry_policy=_INGEST_RETRY,
        )
