import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthState } from "@/store/authSlice";

type AuthAwareRoot = { auth: AuthState };

const aiHost = (process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? process.env.NEXT_PUBLIC_AI_API_BASE ?? "").replace(/\/$/, "");
const baseUrl = aiHost ? `${aiHost}/v1` : "/v1";

export const aiBaseApi = createApi({
  reducerPath: "aiApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
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
  }),
  tagTypes: ["AI"],
  endpoints: () => ({}),
});
