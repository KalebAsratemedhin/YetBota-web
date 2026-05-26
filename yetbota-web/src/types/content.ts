export type Resolution = "ORIGINAL" | "MOBILE" | "WEB";

export type VoteTypePost = "like" | "dislike";
export type VoteTypeComment = "upvote" | "downvote";

export type SortBy = "created_at" | "likes" | "dislikes" | "comments";
export type SortDir = "asc" | "desc";

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface PostPhoto {
  id: string;
  photo_url: string;
  position: number;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  likes: number;
  dislikes: number;
  comments: number;
  user_id: string;
  tags: string[];
  is_question: boolean;
  // Present only when this question references another post; omitted otherwise.
  attached_post_id?: string;
  // photos, location and address are omitted from the response when empty.
  photos?: PostPhoto[];
  location?: GeoLocation;
  address?: string;
  created_at: string;
  updated_at: string;

  // Viewer-specific state, populated only on authenticated reads (post details
  // and list); absent on anonymous calls. Replaces the removed
  // GET /posts/{id}/interactions endpoint. The post vote is serialized as
  // `interaction` (omitted when the caller hasn't voted); comment votes come
  // from the comments list API (see Comment.user_vote), not the post.
  interaction?: VoteTypePost;
  saved?: boolean;
  following_author?: boolean;
}

export interface ListPostsQuery {
  // Filters
  user_id?: string;
  tags?: string[];
  is_question?: boolean;
  search?: string;
  // Caller's saved posts only (requires a token). Replaces GET /posts/saved.
  saved?: boolean;
  // Questions attached to this post. Combine with is_question=true to replace
  // the removed GET /posts/{id}/questions.
  attached_post_id?: string;

  // Geo-radius (all three required together if any one is provided)
  near_lat?: number;
  near_lon?: number;
  radius_km?: number;

  // Sorting
  sort_by?: SortBy;
  sort_dir?: SortDir;

  // Pagination
  page?: number;
  page_size?: number;

  // Photos
  resolution?: Resolution;
}

export interface ListPostsResponseData {
  posts: Post[];
  total: number;
  page: number;
  page_size: number;
}

// Feed APIs (/v1/feed) — personalized, ranked, cursor-paginated, auth-only.
export interface FeedQuery {
  // Required, must be between 1 and 100.
  page_size: number;
  // Omit/empty for the first page. For later pages pass the previous
  // response's `next_cursor` verbatim (format `cursor:<number>`).
  cursor?: string;
}

export interface FeedResponseData {
  posts: Post[];
  // Empty/absent when the end of the feed is reached.
  next_cursor?: string;
}

export interface MarkFeedViewedRequest {
  post_ids: string[];
}

// POST/DELETE /v1/posts/{id}/save — toggle a bookmark. Returns the new state.
export type SaveResult = { saved: boolean };

// The caller's saved posts. Fetched via GET /posts/?saved=true (the dedicated
// GET /posts/saved endpoint was removed); response shape is ListPostsResponseData.
export interface SavedPostsQuery {
  page?: number;
  page_size?: number;
  resolution?: Resolution;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  tags?: string[];
  is_question?: boolean;
  address?: string;
  // Only valid when is_question is true — the post this question is about.
  attached_post_id?: string;
  photos?: Array<{ photo_base64: string; position: number }>;
  location?: GeoLocation;
}

export type CreatePostResponseData = { post: Post };

export interface UpdatePostRequest {
  title: string;
  description: string;
  tags?: string[];
  address?: string;
  // Presence-aware: omit to leave unchanged, "" to clear, a uuid to set.
  attached_post_id?: string;
  upsert_photos?: Array<{ photo_base64: string; position: number }>;
  location?: GeoLocation;
}

export type VotePostRequest = { vote_type: VoteTypePost };
export type VotePostResponseData = { likes: number; dislikes: number };

export interface Comment {
  id: string;
  comment: string;
  upvote: number;
  downvote: number;
  user_id: string;
  post_id: string;
  is_answer: boolean;
  comment_id?: string;
  created_at: string;
  updated_at: string;
  // The caller's vote on this comment (authenticated reads only); omitted/null
  // if they haven't voted. Replaces the per-comment entry of the removed
  // interactions endpoint's comment_votes map.
  user_vote?: VoteTypeComment | null;
}

export interface CreateCommentRequest {
  post_id: string;
  comment: string;
  is_answer: boolean;
  comment_id?: string;
}

export type CreateCommentResponseData = { comment: Comment };

export interface ListCommentsQuery {
  post_id?: string;
  comment_id?: string;
}

export type ListCommentsResponseData = { comments: Comment[] };

export type VoteCommentRequest = { vote_type: VoteTypeComment };
export type VoteCommentResponseData = { upvote: number; downvote: number };
