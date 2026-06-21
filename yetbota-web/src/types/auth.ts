export type Resolution = "MOBILE" | "WEB" | "ORIGINAL";

export interface LoginRequest {
  username: string;
  password: string;
  site?: string;
}

export interface RefreshRequest {
  refresh_token: string;
  username: string;
}

export interface LogoutRequest {
  refresh_token: string;
  username: string;
}

export interface AuthorizationRequest {
  resource: string;
  action: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface LoginResponseData {
  access_token: string;
  access_token_ttl: number;
  refresh_token: string;
  refresh_token_ttl: number;
}

export type RefreshResponseData = LoginResponseData;

export interface UserPrivate {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  mobile: string;
  rating: number;
  badges?: string[];
  contributions: number;
  followers: number;
  following: number;
  status: string;
  role: string;
  profile_url: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  limit: number;
  current_page: number;
}

export interface ListUsersQuery {
  limit?: number;
  page?: number;
  sort_field?: string;
  sort_direction?: "ASC" | "DESC";
  first_name?: string;
  surname?: string;
  username?: string;
  mobile?: string;
  status?: string;
  role?: string;
  resolution?: Resolution;
  q?: string;
  min_rating?: number;
  max_rating?: number;
  created_from?: string;
  created_to?: string;
}

export interface ListUsersData {
  users: UserPrivate[];
  pagination: Pagination;
}

export interface ReadUserData {
  user: UserPrivate;
  profile_url: string;
}

export interface UserPublicData {
  id: string;
  username: string;
  mobile_verified: boolean;
  rating: number;
  badges?: string[];
  contributions: number;
  followers: number;
  following: number;
  profile_url: string;
  created_at: string;
}

export interface UpdateUserRequest {
  status?: string;
  role?: string;
}

export interface UpdateSelfRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  mobile: string;
  password: string;
}

export interface CheckMobileRequest {
  mobile: string;
}
