import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthState } from "@/store/authSlice";
import { AI_API_BASE } from "@/lib/apiConfig";
import { registerApiReset, withReauth } from "@/store/api/reauth";
import { withErrorWindow } from "@/store/api/errorWindow";

type AuthAwareRoot = { auth: AuthState };

const baseUrl = AI_API_BASE;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
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
