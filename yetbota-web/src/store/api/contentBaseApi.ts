import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "@/store/authSlice";
import type { AuthState } from "@/store/authSlice";
import { unwrapEnvelope } from "@/store/api/apiEnvelope";

type AuthAwareRoot = { auth: AuthState };

const contentHost = (process.env.NEXT_PUBLIC_CONTENT_API_BASE_URL ?? "").replace(/\/$/, "");
const baseUrl = contentHost ? `${contentHost}/v1` : "/v1";

function isInvalidTokenPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const maybeMsg = (data as Record<string, unknown>).message;
  return typeof maybeMsg === "string" && maybeMsg.trim().toLowerCase() === "invalid token";
}

function clearAuthEverywhere(api: { dispatch: (a: unknown) => void }) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[contentApi] clearing auth due to invalid token");
  }
  api.dispatch(logout());
  api.dispatch(contentBaseApi.util.resetApiState());
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("yetbota.localAuth");
    } catch {}
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const stateToken = (getState() as AuthAwareRoot).auth.accessToken;
    let token = stateToken;
    let tokenSource: "redux" | "localStorage" | "none" = stateToken ? "redux" : "none";

    // Fallback: if Redux isn't hydrated for some reason, try localStorage.
    if (!token && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("yetbota.localAuth");
        if (raw) {
          const parsed = JSON.parse(raw) as { accessToken?: unknown };
          if (typeof parsed.accessToken === "string") {
            token = parsed.accessToken;
            tokenSource = "localStorage";
          }
        }
      } catch {
        // ignore
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[contentApi] prepareHeaders", {
        baseUrl,
        hasStateToken: Boolean(stateToken),
        hasTokenUsed: Boolean(token),
        tokenSource,
      });
    }

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
    if (process.env.NODE_ENV !== "production") {
      const url = typeof args === "string" ? args : args.url;
      console.warn("[contentApi] request error", {
        url,
        status: (result.error as FetchBaseQueryError).status,
        data: errData,
      });
    }
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

export const contentBaseApi = createApi({
  reducerPath: "contentApi",
  baseQuery: baseQueryUnwrappingEnvelope,
  tagTypes: ["Content", "ModerationCase", "AdminStats", "AdminAudit"],
  endpoints: () => ({}),
});

