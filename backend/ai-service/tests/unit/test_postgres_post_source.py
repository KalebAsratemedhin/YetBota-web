from unittest.mock import AsyncMock, MagicMock

import pytest

from application.errors import PostNotFound, PostSourceUnavailable
from infrastructure.config.settings import PostgresSettings
from infrastructure.postgres import PostgresPostSource

_ROW = {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Best coffee",
    "description": "Where to find it",
    "user_id": "22222222-2222-2222-2222-222222222222",
    "is_question": False,
    "tags": ["cafe", "espresso"],
}


def _source_with_row(row: dict | None) -> PostgresPostSource:
    source = PostgresPostSource(PostgresSettings())
    pool = MagicMock()
    pool.fetchrow = AsyncMock(return_value=row)
    source._pool = pool
    return source


@pytest.mark.asyncio
async def test_read_post_returns_post() -> None:
    source = _source_with_row(_ROW)
    post = await source.read_post("11111111-1111-1111-1111-111111111111")
    assert post is not None
    assert post.id == _ROW["id"]
    assert post.title == "Best coffee"
    assert post.description == "Where to find it"
    assert post.user_id == _ROW["user_id"]
    assert post.is_question is False
    assert post.tags == ["cafe", "espresso"]


@pytest.mark.asyncio
async def test_read_post_question_kind() -> None:
    row = {**_ROW, "is_question": True}
    source = _source_with_row(row)
    post = await source.read_post(_ROW["id"])
    assert post is not None
    assert post.is_question is True


@pytest.mark.asyncio
async def test_read_post_missing_raises_not_found() -> None:
    source = _source_with_row(None)
    with pytest.raises(PostNotFound):
        await source.read_post("00000000-0000-0000-0000-000000000000")


@pytest.mark.asyncio
async def test_read_post_handles_null_text_fields() -> None:
    row = {**_ROW, "title": None, "description": None, "tags": None}
    source = _source_with_row(row)
    post = await source.read_post(_ROW["id"])
    assert post is not None
    assert post.title == ""
    assert post.description == ""
    assert post.tags == []


@pytest.mark.asyncio
async def test_read_post_wraps_postgres_errors() -> None:
    import asyncpg

    source = PostgresPostSource(PostgresSettings())
    pool = MagicMock()
    pool.fetchrow = AsyncMock(side_effect=asyncpg.PostgresError("boom"))
    source._pool = pool

    with pytest.raises(PostSourceUnavailable):
        await source.read_post(_ROW["id"])
