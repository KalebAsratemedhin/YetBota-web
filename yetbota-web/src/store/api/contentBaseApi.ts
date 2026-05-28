import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { AuthState } from "@/store/authSlice";
import { unwrapEnvelope } from "@/store/api/apiEnvelope";
import { registerApiReset, withReauth } from "@/store/api/reauth";

type AuthAwareRoot = { auth: AuthState };

// Same-origin reverse-proxy prefix; next.config.ts rewrites /proxy/content/* to
// the real content backend (server-to-server). Hardcoded — not read from env —
// so a misconfigured build can't point the browser straight at a raw backend IP
// (mixed-content / TLS / ERR_NETWORK_CHANGED failures). To retarget the backend,
// change BACKEND_CONTENT_ORIGIN in next.config.ts, not this value.
const baseUrl = "/proxy/content/v1";

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

// Unwraps the success/data envelope into either `{ data }` or
// `{ error: { status, data } }`. Auth-bad detection and refresh both live in
// `withReauth` one layer up; this stays a pure envelope-parsing concern so
// that an "invalid token" envelope no longer triggers an eager logout —
// withReauth will refresh first and only clear auth if the refresh fails.
const baseQueryUnwrappingEnvelope: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    if (process.env.NODE_ENV !== "production") {
      const url = typeof args === "string" ? args : args.url;
      console.warn("[contentApi] request error", {
        url,
        status: (result.error as FetchBaseQueryError).status,
        data: (result.error as FetchBaseQueryError).data,
      });
    }
    return result;
  }

  const unwrapped = unwrapEnvelope<unknown>(result.data);
  if (unwrapped.error) {
    return { error: unwrapped.error as FetchBaseQueryError };
  }

  return { data: unwrapped.data };
};

export const contentBaseApi = createApi({
  reducerPath: "contentApi",
  baseQuery: withReauth(baseQueryUnwrappingEnvelope),
  tagTypes: ["Content", "ModerationCase", "AdminStats", "AdminAudit", "Notification"],
  endpoints: () => ({}),
});

registerApiReset(contentBaseApi.util.resetApiState);
