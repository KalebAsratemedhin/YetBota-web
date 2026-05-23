import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "@/store/authSlice";
import type { AuthState } from "@/store/authSlice";
import type { RefreshResponseData } from "@/types/auth";
import { unwrapEnvelope } from "@/store/api/apiEnvelope";
import { clearSessionCookie } from "@/lib/sessionCookie";

type AuthAwareRoot = { auth: AuthState };

const apiHost = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const baseUrl = `${apiHost}/v1`;

function isAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return ["/auth/login", "/auth/refresh"].some((p) => url.includes(p));
}

function isInvalidTokenPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const maybeMsg = (data as Record<string, unknown>).message;
  return typeof maybeMsg === "string" && maybeMsg.trim().toLowerCase() === "invalid token";
}

function clearAuthEverywhere(api: { dispatch: (a: unknown) => void }) {
  api.dispatch(logout());
  api.dispatch(baseApi.util.resetApiState());
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("yetbota.localAuth");
    } catch {}
    clearSessionCookie();
  }
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

const baseQueryUnwrappingEnvelope: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    const errData = (result.error as FetchBaseQueryError).data as unknown;
    if (isInvalidTokenPayload(errData)) {
      clearAuthEverywhere(api);
    }
    return result;
  }

  const unwrapped = unwrapEnvelope<unknown>(result.data);
  if (unwrapped.error) {
    if (isInvalidTokenPayload(unwrapped.error.data as unknown)) {
      clearAuthEverywhere(api);
    }
    return { error: unwrapped.error as FetchBaseQueryError };
  }

  return { data: unwrapped.data };
};

let refreshLock: Promise<void> | null = null;

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const url = typeof args === "string" ? args : args.url;

  let result = await baseQueryUnwrappingEnvelope(args, api, extraOptions);

  if (result.error?.status !== 401 || isAuthPath(url)) {
    return result;
  }

  const refreshToken = (api.getState() as AuthAwareRoot).auth.refreshToken;
  if (!refreshToken) {
    clearAuthEverywhere(api);
    return result;
  }

  if (!refreshLock) {
    refreshLock = (async () => {
      const username = (api.getState() as AuthAwareRoot).auth.user?.username;
      if (!username) {
        clearAuthEverywhere(api);
        return;
      }

      const refreshResult = await baseQueryUnwrappingEnvelope(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refresh_token: refreshToken, username },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as RefreshResponseData;
        const creds = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? refreshToken,
        };
        api.dispatch(setCredentials(creds));
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem("yetbota.localAuth");
            const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
            window.localStorage.setItem(
              "yetbota.localAuth",
              JSON.stringify({ ...prev, ...creds })
            );
          } catch {
            // ignore
          }
        }
      } else {
        clearAuthEverywhere(api);
      }
    })().finally(() => {
      refreshLock = null;
    });
  }

  await refreshLock;

  if ((api.getState() as AuthAwareRoot).auth.accessToken) {
    result = await baseQueryUnwrappingEnvelope(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth", "Me"],
  endpoints: () => ({}),
});
