import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials, type AuthState } from "@/store/authSlice";
import { IDENTITY_API_BASE } from "@/lib/apiConfig";
import { clearSessionCookie } from "@/lib/sessionCookie";

type AuthAwareRoot = { auth: AuthState };

type ResetActionCreator = () => unknown;
const resetActionCreators: ResetActionCreator[] = [];

export function registerApiReset(reset: ResetActionCreator): void {
  if (!resetActionCreators.includes(reset)) {
    resetActionCreators.push(reset);
  }
}

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

async function performRefresh(
  refreshToken: string,
  username: string
): Promise<{ accessToken: string; refreshToken: string | null } | null> {
  try {
    const res = await fetch(`${IDENTITY_API_BASE}/auth/refresh`, {
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

let refreshLock: Promise<void> | null = null;

export function withReauth(
  underlying: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  return async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;

    let result = await underlying(args, api, extraOptions);

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

    if ((api.getState() as AuthAwareRoot).auth.accessToken) {
      result = await underlying(args, api, extraOptions);
    }

    return result;
  };
}
