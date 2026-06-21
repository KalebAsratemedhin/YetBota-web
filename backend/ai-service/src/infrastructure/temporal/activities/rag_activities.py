from collections.abc import Callable

from temporalio import activity

from domain.entities import (
    ChatResponse,
    Citation,
    Embedding,
    RagAnswerInput,
    ScoredChunk,
)
from domain.ports import LLM, Embedder, VectorStore

PromptBuilder = Callable[[list[ScoredChunk], str], str]


def _citations(hits: list[ScoredChunk]) -> list[Citation]:
    return [
        Citation(
            source_id=h.chunk.source_id,
            kind=h.chunk.kind,
            text=h.chunk.text,
            score=h.score,
        )
        for h in hits
    ]


class RagActivities:
    def __init__(
        self,
        *,
        embedder: Embedder,
        vector_store: VectorStore,
        llm: LLM,
        prompt_builder: PromptBuilder,
        top_k: int,
        min_similarity: float,
        max_tokens: int,
        temperature: float,
    ) -> None:
        self._embedder = embedder
        self._vector_store = vector_store
        self._llm = llm
        self._prompt_builder = prompt_builder
        self._top_k = top_k
        self._min_similarity = min_similarity
        self._max_tokens = max_tokens
        self._temperature = temperature

    @activity.defn(name="rag_embed_query")
    async def embed_query(self, text: str) -> Embedding:
        return await self._embedder.embed(text, task_type="RETRIEVAL_QUERY")

    @activity.defn(name="rag_search_chunks")
    async def search_chunks(self, query_vec: Embedding) -> list[ScoredChunk]:
        hits = await self._vector_store.search(query_vec, limit=self._top_k, kinds=None)
        if not hits or max(h.score for h in hits) < self._min_similarity:
            return []
        return hits

    @activity.defn(name="rag_generate_answer")
    async def generate_answer(self, payload: RagAnswerInput) -> ChatResponse:
        prompt = self._prompt_builder(payload.hits, payload.query)
        text = await self._llm.generate(
            prompt,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
        )
        return ChatResponse(answer=text.strip(), citations=_citations(payload.hits))
