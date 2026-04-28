import { contentBaseApi } from "@/store/api/contentBaseApi";
import type {
  Comment,
  CreateCommentRequest,
  CreateCommentResponseData,
  CreatePostRequest,
  CreatePostResponseData,
  ListCommentsQuery,
  ListCommentsResponseData,
  ListMyPostsQuery,
  ListMyPostsResponseData,
  ListPostsQuery,
  ListPostsResponseData,
  Post,
  Resolution,
  UpdatePostRequest,
  VoteCommentRequest,
  VoteCommentResponseData,
  VotePostRequest,
  VotePostResponseData,
} from "@/types/content";

export const contentApi = contentBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponseData, CreatePostRequest>({
      query: (body) => ({ url: "/posts/", method: "POST", body }),
      invalidatesTags: ["Content"],
    }),
    listMyPosts: builder.query<ListMyPostsResponseData, ListMyPostsQuery | void>({
      query: (arg) => ({
        url: "/posts/mine",
        method: "GET",
        params: arg ?? undefined,
      }),
      providesTags: ["Content"],
    }),
    listPosts: builder.query<ListPostsResponseData, ListPostsQuery | void>({
      query: (arg) => ({
        url: "/posts/",
        method: "GET",
        params: arg ?? undefined,
      }),
      providesTags: ["Content"],
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
  useListMyPostsQuery,
  useLazyListMyPostsQuery,
  useListPostsQuery,
  useLazyListPostsQuery,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery,
  useGetPostsByIdsQuery,
  useLazyGetPostsByIdsQuery,
  useUpdatePostByIdMutation,
  useVotePostMutation,
  useCreateCommentMutation,
  useListCommentsQuery,
  useLazyListCommentsQuery,
  useGetCommentByIdQuery,
  useLazyGetCommentByIdQuery,
  useDeleteCommentByIdMutation,
  useVoteCommentMutation,
} = contentApi;

