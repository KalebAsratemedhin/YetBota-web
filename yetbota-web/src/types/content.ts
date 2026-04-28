export type Resolution = "ORIGINAL" | "MOBILE" | "WEB";

export type VoteTypePost = "like" | "dislike";
export type VoteTypeComment = "upvote" | "downvote";

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
  photos: PostPhoto[];
  location: GeoLocation;
  created_at: string;
  updated_at: string;
}

export type ListMyPostsQuery = {
  limit?: number;
  page?: number;
  resolution?: Resolution;
};

export type ListMyPostsResponseData = {
  posts: Post[];
  page: number;
  limit: number;
  total?: number;
};

export type ListPostsQuery = {
  limit?: number;
  page?: number;
  resolution?: Resolution;
};

export type ListPostsResponseData = {
  posts: Post[];
  page: number;
  limit: number;
  total?: number;
};

export interface CreatePostRequest {
  title: string;
  description: string;
  tags: string[];
  is_question: boolean;
  photos: Array<{ photo_base64: string; position: number }>;
  location: GeoLocation;
}

export type CreatePostResponseData = { post: Post };

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  tags?: string[];
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

export type Resolution = "ORIGINAL" | "MOBILE" | "WEB";

export type VoteTypePost = "like" | "dislike";
export type VoteTypeComment = "upvote" | "downvote";

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
  photos: PostPhoto[];
  location: GeoLocation;
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  tags: string[];
  is_question: boolean;
  photos: Array<{ photo_base64: string; position: number }>;
  location: GeoLocation;
}

export type CreatePostResponseData = { post: Post };

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  tags?: string[];
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

