"use client";

import { useListPostsQuery } from "@/store/api/contentApi";
import type { Post } from "@/types/content";

// Top posts (places) or questions sorted by likes, for the "Trending" aside
// lists. Uses the public GET /v1/posts list filter (content service), so it
// works for anonymous viewers.
export function useTrendingPosts({ isQuestion, limit = 4 }: { isQuestion: boolean; limit?: number }) {
  const { data, isLoading, isError } = useListPostsQuery({
    is_question: isQuestion,
    sort_by: "likes",
    sort_dir: "desc",
    page: 1,
    page_size: limit,
    resolution: "WEB",
  });

  const posts: Post[] = data?.posts ?? [];
  return { posts, isLoading, isError };
}
