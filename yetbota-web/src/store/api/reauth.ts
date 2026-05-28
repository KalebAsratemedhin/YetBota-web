import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials, type AuthState } from "@/store/authSlice";
import { clearSessionCookie } from "@/lib/sessionCookie";

// Centralized access-token refresh shared by every base API in the app.
//
// Every authed surface (identity, content, AI) wraps its base query with
// `withReauth(...)`. On an auth-bad response — HTTP 401, or an envelope-style
// "invalid token" payload — the wrapper calls POST /v1/auth/refresh against
// identity-service, swaps the new tokens into Redux, and retries the original
// request. Concurrent failed requests across all three surfaces serialize
// against a single module-level lock so we never spawn parallel refreshes.
//
// The refresh call is a dedicated fetch — not routed through the wrapped base
// query — because content/AI surfaces have different base URLs and don't
// expose /auth/refresh. The same reason applies to envelope unwrapping: we
// parse the refresh response inline here.

type AuthAwareRoot = { auth: AuthState };

// All base APIs register their `resetApiState` action creator here so that a
// failed refresh / logout fans out and clears every API's RTK Query cache.
type ResetActionCreator = () => unknown;
const resetActionCreators: ResetActionCreator[] = [];

export function registerApiReset(reset: ResetActionCreator): void {
  if (!resetActionCreators.includes(reset)) {
    resetActionCreators.push(reset);
  }
}

// Identity-service prefix — hardcoded for the same reason as the per-API
// base URLs (no env var, so a misconfigured build can't leak the raw backend
// host into the browser). To retarget, edit BACKEND_MAIN_ORIGIN in
// next.config.ts.
const IDENTITY_BASE_URL = "/proxy/main/v1";

const AUTH_BYPASS_PATHS = ["/auth/login", "/auth/refresh"];

function isAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((p) => url.includes(p));
}

function isInvalidTokenPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const msg = (data as Record<string, unknown>).message;
  return typeof msg === "string" && msg.trim().toLowerCase() === "invalid token";
}

// "Auth-bad" covers two cases:
//  1. Real HTTP 401 — what identity-service returns most of the time.
//  2. An envelope `{ success: false, message: "invalid token" }`. Whether it
//     reaches us as `result.error.data` (after envelope unwrap turned it into
//     an error) or as `result.data` (no unwrap, raw envelope body), we treat
//     it the same: refresh and retry.
function isAuthBad(result: { error?: FetchBaseQueryError; data?: unknown }): boolean {
  if (result.error) {
    if (result.error.status === 401) return true;
    if (isInvalidTokenPayload((result.error as FetchBaseQueryError).data as unknown)) return true;
  }
  if (
    result.data &&
    typeof result.data === "object" &&
    (result.data as Record<string, unknown>).success === false &&
    isInvalidTokenPayload(result.data)
  ) {
    return true;
  }
  return false;
}

export function clearAuthEverywhere(dispatch: (action: unknown) => void): void {
  dispatch(logout());
  for (const reset of resetActionCreators) {
    dispatch(reset());
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("yetbota.localAuth");
    } catch {
      // ignore
    }
    clearSessionCookie();
  }
}

// Performs the refresh as a one-off fetch against identity-service. Returns
// the new token pair, or null if the refresh failed for any reason — caller
// then logs the user out.
async function performRefresh(
  refreshToken: string,
  username: string
): Promise<{ accessToken: string; refreshToken: string | null } | null> {
  try {
    const res = await fetch(`${IDENTITY_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken, username }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    if (
      !body ||
      typeof body !== "object" ||
      (body as Record<string, unknown>).success !== true
    ) {
      return null;
    }
    const data = (body as { data?: unknown }).data;
    if (!data || typeof data !== "object") return null;
    const accessToken = (data as Record<string, unknown>).access_token;
    const newRefresh = (data as Record<string, unknown>).refresh_token;
    if (typeof accessToken !== "string") return null;
    return {
      accessToken,
      refreshToken: typeof newRefresh === "string" ? newRefresh : null,
    };
  } catch {
    return null;
  }
}

// Module-level lock: all callers (across base APIs and concurrent requests)
// await the same in-flight refresh promise.
let refreshLock: Promise<void> | null = null;

export function withReauth(
  underlying: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  return async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;

    let result = await underlying(args, api, extraOptions);

    // Auth-bad on the auth endpoints themselves means "login failed" or
    // "refresh failed" — never retry those, that's an infinite loop.
    if (!isAuthBad(result) || isAuthPath(url)) {
      return result;
    }

    const state = api.getState() as AuthAwareRoot;
    const refreshToken = state.auth.refreshToken;
    const username = state.auth.user?.username;

    if (!refreshToken || !username) {
      clearAuthEverywhere(api.dispatch);
      return result;
    }

    if (!refreshLock) {
      refreshLock = (async () => {
        const refreshed = await performRefresh(refreshToken, username);
        if (refreshed) {
          api.dispatch(
            setCredentials({
              accessToken: refreshed.accessToken,
              // Fall back to the existing refresh token if the backend didn't
              // rotate it on this call.
              refreshToken: refreshed.refreshToken ?? refreshToken,
            })
          );
        } else {
          clearAuthEverywhere(api.dispatch);
        }
      })().finally(() => {
        refreshLock = null;
      });
    }

    await refreshLock;

    // setCredentials is a synchronous reducer, so by the time refreshLock
    // resolves the store reflects the new token (if refresh succeeded). The
    // retry's prepareHeaders re-reads getState() and picks it up.
    if ((api.getState() as AuthAwareRoot).auth.accessToken) {
      result = await underlying(args, api, extraOptions);
    }

    return result;
  };
}
