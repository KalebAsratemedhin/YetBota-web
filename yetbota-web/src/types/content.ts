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
}

export interface ListPostsQuery {
  // Filters
  user_id?: string;
  tags?: string[];
  is_question?: boolean;
  search?: string;

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

// GET /v1/posts/{id}/interactions — the *current user's* own vote state for a
// post and its comments. Aggregate counts still come from the post/comment
// read endpoints; this is purely "what did I vote".
export interface PostInteractions {
  // null when the user hasn't voted on the post.
  post_vote: VoteTypePost | null;
  // commentId -> vote. Only voted-on comments appear; {} if none.
  comment_votes: Record<string, VoteTypeComment>;
  // true if the caller follows the post's author. Always false when the
  // caller is the author.
  following_author: boolean;
  // true if the caller has saved/bookmarked the post.
  saved: boolean;
}

// POST/DELETE /v1/posts/{id}/save — toggle a bookmark. Returns the new state.
export type SaveResult = { saved: boolean };

// GET /v1/posts/saved — the caller's saved posts, most-recently-saved first.
// Response shape is identical to ListPostsResponseData.
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
