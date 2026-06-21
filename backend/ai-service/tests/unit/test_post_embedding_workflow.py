import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from temporalio.client import Client
from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from application.errors import PostNotFound
from domain.entities import IngestRequest, IngestResult, Post
from infrastructure.temporal.activities import IngestActivities
from infrastructure.temporal.queues import (
    POST_EMBEDDING_QUEUE,
    POST_EMBEDDING_WORKFLOW,
)
from infrastructure.temporal.workflows import (
    PostEmbeddingInput,
    PostEmbeddingWorkflow,
)


def _activities(
    *,
    post: Post | None = None,
    read_error: Exception | None = None,
) -> tuple[IngestActivities, AsyncMock]:
    post_source = AsyncMock()
    if read_error is not None:
        post_source.read_post = AsyncMock(side_effect=read_error)
    else:
        post_source.read_post = AsyncMock(return_value=post)

    ingest_use_case = AsyncMock()
    ingest_use_case.execute = AsyncMock(
        return_value=IngestResult(
            content_id=post.id if post else "x",
            kind="post",
            verdict="unique",
            processed_at=datetime.now(UTC),
        )
    )
    activities = IngestActivities(
        post_source=post_source,
        ingest_use_case=ingest_use_case,
    )
    return activities, ingest_use_case


async def _run(
    activities: IngestActivities, input: PostEmbeddingInput | dict
) -> None:
    async with await WorkflowEnvironment.start_time_skipping(
        data_converter=pydantic_data_converter,
    ) as env:
        client: Client = env.client
        worker = Worker(
            client,
            task_queue=POST_EMBEDDING_QUEUE,
            workflows=[PostEmbeddingWorkflow],
            activities=[
                activities.fetch_post,
                activities.run_ingest,
            ],
        )
        async with worker:
            await client.execute_workflow(
                POST_EMBEDDING_WORKFLOW,
                input,
                id=f"post-embedding-test-{uuid.uuid4()}",
                task_queue=POST_EMBEDDING_QUEUE,
            )


@pytest.mark.asyncio
async def test_workflow_builds_post_request_from_db_row() -> None:
    post = Post(
        id="p1",
        title="Best coffee",
        description="Where to find it",
        user_id="u1",
        is_question=False,
        tags=["cafe", "espresso"],
    )
    activities, ingest_use_case = _activities(post=post)
    await _run(activities, PostEmbeddingInput(post_id="p1"))

    req: IngestRequest = ingest_use_case.execute.call_args.args[0]
    assert req.content_id == "p1"
    assert req.kind == "post"
    assert req.user_id == "u1"
    assert req.text == "Best coffee\n\nWhere to find it"
    assert req.tags == ["cafe", "espresso"]


@pytest.mark.asyncio
async def test_workflow_classifies_questions() -> None:
    post = Post(
        id="q1",
        title="Where can I find coffee?",
        description="",
        user_id="u1",
        is_question=True,
        tags=[],
    )
    activities, ingest_use_case = _activities(post=post)
    await _run(activities, PostEmbeddingInput(post_id="q1"))

    req: IngestRequest = ingest_use_case.execute.call_args.args[0]
    assert req.kind == "question"
    assert req.text == "Where can I find coffee?"


@pytest.mark.asyncio
async def test_workflow_accepts_go_style_input_payload() -> None:
    post = Post(
        id="p1", title="T", description="D", user_id="u1", is_question=False, tags=[]
    )
    activities, ingest_use_case = _activities(post=post)
    await _run(activities, {"PostID": "p1"})  # type: ignore[arg-type]
    assert ingest_use_case.execute.await_count == 1
