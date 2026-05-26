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

export interface ChangeMobileRequest {
  new_mobile: string;
  random: string;
}

export interface GenerateMobileOTPRequest {
  mobile: string;
  random: string;
}

export interface ValidateOTPRequest {
  otp: string;
  mobile: string;
  random: string;
}

export interface NewPasswordRequest {
  password: string;
  random: string;
  mobile: string;
}

export interface OtpLimits {
  otp_req_count: number;
  max_otp_req: number;
  otp_err_count: number;
  max_otp_err: number;
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
  // omitempty on the wire — absent when the user has earned no badges.
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
  // Extended admin filters. `q` is a substring search across username + first/
  // last name (no email column exists). `min/max_rating` filter on `score`.
  q?: string;
  min_rating?: number;
  max_rating?: number;
  // `YYYY-MM-DD` or RFC3339.
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
  random: string;
}

export interface CheckMobileRequest {
  mobile: string;
}
