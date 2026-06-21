from fastapi import APIRouter, Depends, HTTPException, Query, Request

from application.errors import IndexingFailed
from infrastructure.graph import Neo4jSimilarityGraph
from interfaces.http.deps import verify_internal_token

router = APIRouter(
    prefix="/v1/internal/graph",
    tags=["internal-graph"],
    dependencies=[Depends(verify_internal_token)],
)


def _similarity_graph(request: Request) -> Neo4jSimilarityGraph | None:
    return getattr(request.app.state, "similarity_graph", None)


@router.get("/similar-posts-tree")
async def similar_posts_tree(
    request: Request,
    post_id: str = Query(min_length=1),
    max_depth: int = Query(default=2, ge=1, le=10),
) -> dict:
    graph = _similarity_graph(request)
    if graph is None:
        return {"posts": []}

    try:
        rows = await graph.similar_posts_tree(post_id, max_depth)
    except IndexingFailed as exc:
        raise HTTPException(status_code=500, detail="graph query failed") from exc

    posts = [{"post_id": row["post_id"], "depth": row["depth"]} for row in rows]
    return {"posts": posts}
