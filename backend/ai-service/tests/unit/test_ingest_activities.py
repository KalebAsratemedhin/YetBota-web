from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest

from application.errors import PostNotFound
from domain.entities import IngestRequest, IngestResult, Post
from infrastructure.temporal.activities import IngestActivities


def _post() -> Post:
    return Post(
        id="11111111-1111-1111-1111-111111111111",
        title="Title",
        description="Body",
        user_id="u1",
        is_question=False,
        tags=["cafe"],
    )


def _activities(
    *,
    post: Post | None = None,
    read_error: Exception | None = None,
    ingest_result: IngestResult | None = None,
) -> tuple[IngestActivities, AsyncMock, AsyncMock]:
    post_source = AsyncMock()
    if read_error is not None:
        post_source.read_post = AsyncMock(side_effect=read_error)
    else:
        post_source.read_post = AsyncMock(return_value=post)

    ingest_use_case = AsyncMock()
    ingest_use_case.execute = AsyncMock(
        return_value=ingest_result
        or IngestResult(
            content_id="x",
            kind="post",
            verdict="unique",
            processed_at=datetime.now(UTC),
        )
    )

    return (
        IngestActivities(
            post_source=post_source,
            ingest_use_case=ingest_use_case,
        ),
        post_source,
        ingest_use_case,
    )


@pytest.mark.asyncio
async def test_fetch_post_returns_post() -> None:
    activities, post_source, _ = _activities(post=_post())
    post = await activities.fetch_post("pid")
    assert post.title == "Title"
    post_source.read_post.assert_awaited_once_with("pid")


@pytest.mark.asyncio
async def test_fetch_post_propagates_not_found() -> None:
    activities, _, _ = _activities(read_error=PostNotFound("missing"))
    with pytest.raises(PostNotFound):
        await activities.fetch_post("pid")


@pytest.mark.asyncio
async def test_run_ingest_delegates_to_use_case() -> None:
    expected = IngestResult(
        content_id="pid",
        kind="post",
        verdict="indexed",
        processed_at=datetime.now(UTC),
    )
    activities, _, ingest_use_case = _activities(ingest_result=expected)
    req = IngestRequest(
        content_id="pid", kind="post", user_id="u1", text="hi"
    )
    result = await activities.run_ingest(req)
    ingest_use_case.execute.assert_awaited_once_with(req)
    assert result == expected
