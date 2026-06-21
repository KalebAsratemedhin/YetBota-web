from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from domain.entities import ChatQuery, ChatResponse, RagAnswerInput
    from infrastructure.temporal.activities import RagActivities
    from infrastructure.temporal.queues import RAG_CHAT_WORKFLOW

_NO_INFO_ANSWER = "I do not have verified information on that topic in YetBota."

_EMBED_TIMEOUT = timedelta(seconds=30)
_SEARCH_TIMEOUT = timedelta(seconds=30)
_GENERATE_TIMEOUT = timedelta(seconds=60)

_EMBED_RETRY = RetryPolicy(maximum_attempts=3, initial_interval=timedelta(seconds=1))
_SEARCH_RETRY = RetryPolicy(maximum_attempts=3, initial_interval=timedelta(seconds=1))
_GENERATE_RETRY = RetryPolicy(maximum_attempts=2, initial_interval=timedelta(seconds=2))


@workflow.defn(name=RAG_CHAT_WORKFLOW)
class RagChatWorkflow:
    @workflow.run
    async def run(self, query: ChatQuery) -> ChatResponse:
        query_vec = await workflow.execute_activity_method(
            RagActivities.embed_query,
            query.text,
            start_to_close_timeout=_EMBED_TIMEOUT,
            retry_policy=_EMBED_RETRY,
        )

        hits = await workflow.execute_activity_method(
            RagActivities.search_chunks,
            query_vec,
            start_to_close_timeout=_SEARCH_TIMEOUT,
            retry_policy=_SEARCH_RETRY,
        )

        if not hits:
            return ChatResponse(answer=_NO_INFO_ANSWER, citations=[])

        return await workflow.execute_activity_method(
            RagActivities.generate_answer,
            RagAnswerInput(query=query.text, hits=hits),
            start_to_close_timeout=_GENERATE_TIMEOUT,
            retry_policy=_GENERATE_RETRY,
        )
