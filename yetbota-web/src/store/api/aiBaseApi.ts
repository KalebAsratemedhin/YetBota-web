import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthState } from "@/store/authSlice";
import { registerApiReset, withReauth } from "@/store/api/reauth";
import { withErrorWindow } from "@/store/api/errorWindow";

type AuthAwareRoot = { auth: AuthState };

// Same-origin reverse-proxy prefix; next.config.ts rewrites /proxy/ai/* to the
// real ai-service (server-to-server). Hardcoded — not read from env — so a
// misconfigured build can't point the browser straight at a raw backend IP
// (mixed-content / TLS / ERR_NETWORK_CHANGED failures). To retarget the backend,
// change BACKEND_AI_ORIGIN in next.config.ts, not this value.
const baseUrl = "/proxy/ai/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  // Hard ceiling so a hung backend can't leave the UI stuck "loading" — the
  // resulting TIMEOUT_ERROR is what withErrorWindow uses to cool down further
  // requests to the same URL.
  timeout: 15_000,
  prepareHeaders: (headers, { getState }) => {
    const stateToken = (getState() as AuthAwareRoot).auth.accessToken;
    let token = stateToken;

    if (!token && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("yetbota.localAuth");
        if (raw) {
          const parsed = JSON.parse(raw) as { accessToken?: unknown };
          if (typeof parsed.accessToken === "string") token = parsed.accessToken;
        }
      } catch {
        // ignore
      }
    }

    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const aiBaseApi = createApi({
  reducerPath: "aiApi",
  baseQuery: withReauth(withErrorWindow(rawBaseQuery)),
  tagTypes: ["AI", "AIChats", "AIMessages"],
  endpoints: () => ({}),
});

registerApiReset(aiBaseApi.util.resetApiState);
