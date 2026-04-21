import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "@/store/authSlice";
import type { AuthState } from "@/store/authSlice";
import type { AuthResponse } from "@/types/auth";

type AuthAwareRoot = { auth: AuthState };

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

function isAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return ["/auth/login", "/auth/register", "/auth/refresh"].some((p) => url.includes(p));
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthAwareRoot).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    return headers;
  },
});

let refreshLock: Promise<void> | null = null;

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const url = typeof args === "string" ? args : args.url;

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || isAuthPath(url)) {
    return result;
  }

  const refreshToken = (api.getState() as AuthAwareRoot).auth.refreshToken;
  if (!refreshToken) {
    return result;
  }

  if (!refreshLock) {
    refreshLock = (async () => {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as AuthResponse;
        api.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? refreshToken,
            user: data.user,
          })
        );
      } else {
        api.dispatch(logout());
      }
    })().finally(() => {
      refreshLock = null;
    });
  }

  await refreshLock;

  if ((api.getState() as AuthAwareRoot).auth.accessToken) {
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth"],
  endpoints: () => ({}),
});
