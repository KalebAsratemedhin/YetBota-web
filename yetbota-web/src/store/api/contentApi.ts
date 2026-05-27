import { contentBaseApi } from "@/store/api/contentBaseApi";
import type {
  Comment,
  CreateCommentRequest,
  CreateCommentResponseData,
  CreatePostRequest,
  CreatePostResponseData,
  FeedQuery,
  FeedResponseData,
  ListCommentsQuery,
  ListCommentsResponseData,
  ListPostsQuery,
  ListPostsResponseData,
  MarkFeedViewedRequest,
  Post,
  Resolution,
  SavedPostsQuery,
  UpdatePostRequest,
  VoteCommentRequest,
  VoteCommentResponseData,
  VotePostRequest,
  VotePostResponseData,
} from "@/types/content";

// `tags` is the only repeatable list param; everything else is a scalar so
// fetchBaseQuery's default URLSearchParams serializer would coerce arrays into
// "a,b" strings. Build the query string ourselves so `?tags=a&tags=b` is sent.
function buildListPostsParams(query: ListPostsQuery | void | undefined): string | undefined {
  if (!query) return undefined;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null) params.append(key, String(v));
      }
      continue;
    }
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs.length > 0 ? qs : undefined;
}

export const contentApi = contentBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponseData, CreatePostRequest>({
      query: (body) => ({ url: "/posts/", method: "POST", body }),
      invalidatesTags: ["Content"],
    }),
    listPosts: builder.query<ListPostsResponseData, ListPostsQuery | void>({
      query: (arg) => {
        const qs = buildListPostsParams(arg);
        return { url: qs ? `/posts/?${qs}` : "/posts/", method: "GET" };
      },
      providesTags: ["Content"],
    }),
    getFeed: builder.query<FeedResponseData, FeedQuery>({
      query: ({ page_size, cursor }) => {
        const params = new URLSearchParams();
        params.set("page_size", String(page_size));
        // Send the server-issued cursor verbatim; URLSearchParams encodes it.
        if (cursor) params.set("cursor", cursor);
        return { url: `/feed/?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Content"],
    }),
    markFeedViewed: builder.mutation<void, MarkFeedViewedRequest>({
      query: (body) => ({ url: "/feed/viewed", method: "POST", body }),
    }),
    getPostById: builder.query<CreatePostResponseData, { id: string; resolution?: Resolution }>({
      query: ({ id, resolution }) => ({
        url: `/posts/${encodeURIComponent(id)}`,
        method: "GET",
        params: resolution ? { resolution } : undefined,
      }),
    }),
    getPostsByIds: builder.query<{ posts: Post[] }, { ids: string[]; resolution?: Resolution }>({
      async queryFn(arg, api, extraOptions, fetchWithBQ) {
        const ids = Array.from(new Set(arg.ids)).filter(Boolean);
        if (ids.length === 0) return { data: { posts: [] } };

        const posts: Post[] = [];
        for (const id of ids) {
          const r = await fetchWithBQ({
            url: `/posts/${encodeURIComponent(id)}`,
            method: "GET",
            params: arg.resolution ? { resolution: arg.resolution } : undefined,
          });
          if (r.error) {
            // If any request fails, keep going so we can at least show others.
            continue;
          }
          const data = r.data as CreatePostResponseData | undefined;
          if (data?.post) posts.push(data.post);
        }

        return { data: { posts } };
      },
    }),
    updatePostById: builder.mutation<CreatePostResponseData, { id: string; body: UpdatePostRequest }>({
      query: ({ id, body }) => ({
        url: `/posts/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
    }),
    votePost: builder.mutation<VotePostResponseData, { id: string; body: VotePostRequest }>({
      query: ({ id, body }) => ({
        url: `/posts/${encodeURIComponent(id)}/vote`,
        method: "POST",
        body,
      }),
    }),
    // Both reply with an empty { success: true } envelope (no `data`), so there's
    // nothing to read back — callers keep their own optimistic saved state.
    savePost: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/posts/${encodeURIComponent(id)}/save`, method: "POST" }),
      invalidatesTags: ["Content"],
    }),
    unsavePost: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/posts/${encodeURIComponent(id)}/save`, method: "DELETE" }),
      invalidatesTags: ["Content"],
    }),
    // GET /posts/saved was removed; the saved list is now the post list filtered
    // to the caller's bookmarks. Requires a token for saved=true to resolve.
    listSavedPosts: builder.query<ListPostsResponseData, SavedPostsQuery | void>({
      query: (arg) => {
        const qs = buildListPostsParams({ ...(arg ?? {}), saved: true });
        return { url: `/posts/?${qs}`, method: "GET" };
      },
      providesTags: ["Content"],
    }),

    createComment: builder.mutation<CreateCommentResponseData, CreateCommentRequest>({
      query: (body) => ({ url: "/comments/", method: "POST", body }),
      invalidatesTags: ["Content"],
    }),
    listComments: builder.query<ListCommentsResponseData, ListCommentsQuery>({
      query: (query) => ({ url: "/comments/", method: "GET", params: query }),
    }),
    getCommentById: builder.query<{ comment: Comment }, { id: string }>({
      query: ({ id }) => ({ url: `/comments/${encodeURIComponent(id)}`, method: "GET" }),
    }),
    deleteCommentById: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/comments/${encodeURIComponent(id)}`, method: "DELETE" }),
    }),
    voteComment: builder.mutation<VoteCommentResponseData, { id: string; body: VoteCommentRequest }>({
      query: ({ id, body }) => ({
        url: `/comments/${encodeURIComponent(id)}/vote`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useListPostsQuery,
  useLazyListPostsQuery,
  useGetFeedQuery,
  useLazyGetFeedQuery,
  useMarkFeedViewedMutation,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery,
  useGetPostsByIdsQuery,
  useLazyGetPostsByIdsQuery,
  useUpdatePostByIdMutation,
  useVotePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useListSavedPostsQuery,
  useLazyListSavedPostsQuery,
  useCreateCommentMutation,
  useListCommentsQuery,
  useLazyListCommentsQuery,
  useGetCommentByIdQuery,
  useLazyGetCommentByIdQuery,
  useDeleteCommentByIdMutation,
  useVoteCommentMutation,
} = contentApi;
