from unittest.mock import AsyncMock, MagicMock

import pytest

from domain.entities import Chunk, RagAnswerInput, ScoredChunk
from infrastructure.temporal.activities import RagActivities


def _activities(
    *,
    embed_value: list[float] | None = None,
    search_results: list[ScoredChunk] | None = None,
    llm_output: str = "hello",
    top_k: int = 5,
    min_similarity: float = 0.5,
) -> tuple[RagActivities, AsyncMock, AsyncMock, AsyncMock, MagicMock]:
    embedder = AsyncMock()
    embedder.embed = AsyncMock(return_value=embed_value or [0.1, 0.2])

    vector_store = AsyncMock()
    vector_store.search = AsyncMock(return_value=search_results or [])

    llm = AsyncMock()
    llm.generate = AsyncMock(return_value=llm_output)

    prompt_builder = MagicMock(return_value="<prompt>")

    activities = RagActivities(
        embedder=embedder,
        vector_store=vector_store,
        llm=llm,
        prompt_builder=prompt_builder,
        top_k=top_k,
        min_similarity=min_similarity,
        max_tokens=100,
        temperature=0.2,
    )
    return activities, embedder, vector_store, llm, prompt_builder


def _hit(source_id: str, score: float, kind: str = "post") -> ScoredChunk:
    return ScoredChunk(
        chunk=Chunk(source_id=source_id, kind=kind, text="t", segment_idx=0),
        score=score,
    )


@pytest.mark.asyncio
async def test_embed_query_calls_embedder_with_retrieval_query_task() -> None:
    activities, embedder, _, _, _ = _activities()
    result = await activities.embed_query("hello world")
    assert result == [0.1, 0.2]
    embedder.embed.assert_awaited_once_with("hello world", task_type="RETRIEVAL_QUERY")


@pytest.mark.asyncio
async def test_search_chunks_returns_hits_above_threshold() -> None:
    hits = [_hit("p1", 0.9), _hit("p2", 0.7)]
    activities, _, vector_store, _, _ = _activities(
        search_results=hits, min_similarity=0.6
    )
    result = await activities.search_chunks([0.0])
    assert result == hits
    vector_store.search.assert_awaited_once_with([0.0], limit=5, kinds=None)


@pytest.mark.asyncio
async def test_search_chunks_returns_empty_when_max_below_threshold() -> None:
    activities, _, _, _, _ = _activities(
        search_results=[_hit("p1", 0.3)], min_similarity=0.6
    )
    result = await activities.search_chunks([0.0])
    assert result == []


@pytest.mark.asyncio
async def test_search_chunks_returns_empty_when_no_hits() -> None:
    activities, _, _, _, _ = _activities(search_results=[])
    result = await activities.search_chunks([0.0])
    assert result == []


@pytest.mark.asyncio
async def test_generate_answer_builds_prompt_and_returns_response() -> None:
    hit = _hit("p1", 0.9)
    activities, _, _, llm, prompt_builder = _activities(llm_output="  the answer  ")
    payload = RagAnswerInput(query="why?", hits=[hit])
    result = await activities.generate_answer(payload)
    prompt_builder.assert_called_once_with([hit], "why?")
    llm.generate.assert_awaited_once_with("<prompt>", max_tokens=100, temperature=0.2)
    assert result.answer == "the answer"
    assert len(result.citations) == 1
    citation = result.citations[0]
    assert citation.source_id == "p1"
    assert citation.score == 0.9
