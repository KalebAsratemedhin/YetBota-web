from temporalio import activity

from application.ingest_content import IngestContent
from domain.entities import Comment, IngestRequest, IngestResult, Post
from domain.ports import CommentSource, PostSource


class IngestActivities:
    def __init__(
        self,
        *,
        post_source: PostSource,
        comment_source: CommentSource,
        ingest_use_case: IngestContent,
    ) -> None:
        self._post_source = post_source
        self._comment_source = comment_source
        self._ingest_use_case = ingest_use_case

    @activity.defn(name="ingest_fetch_post")
    async def fetch_post(self, post_id: str) -> Post:
        post = await self._post_source.read_post(post_id)
        assert post is not None
        return post

    @activity.defn(name="ingest_fetch_comment")
    async def fetch_comment(self, comment_id: str) -> Comment:
        comment = await self._comment_source.read_comment(comment_id)
        assert comment is not None
        return comment

    @activity.defn(name="ingest_run")
    async def run_ingest(self, req: IngestRequest) -> IngestResult:
        return await self._ingest_use_case.execute(req)
