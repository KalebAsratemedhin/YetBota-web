export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Normalized auth payload from login / register / refresh */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
