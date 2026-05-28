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

// Same-origin reverse-proxy prefix; next.config.ts rewrites /proxy/main/* to
// the real main backend (server-to-server). Hardcoded — not read from env —
// so a misconfigured build can't point the browser straight at a raw backend
// IP (mixed-content / TLS / ERR_NETWORK_CHANGED failures). To retarget the
// backend, change BACKEND_MAIN_ORIGIN in next.config.ts, not this value.
const baseUrl = "/proxy/main/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthAwareRoot).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    return headers;
  },
});

// Unwraps the success/data envelope into either `{ data }` or
// `{ error: { status, data } }`. Auth-bad detection and refresh both live in
// `withReauth` one layer up — this stays a pure envelope-parsing concern.
const baseQueryUnwrappingEnvelope: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) return result;

  const unwrapped = unwrapEnvelope<unknown>(result.data);
  if (unwrapped.error) {
    return { error: unwrapped.error as FetchBaseQueryError };
  }

  return { data: unwrapped.data };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: withReauth(baseQueryUnwrappingEnvelope),
  tagTypes: ["User", "Auth", "Me"],
  endpoints: () => ({}),
});

// Register so that `clearAuthEverywhere` resets this API's RTK Query cache on
// logout, alongside the other base APIs.
registerApiReset(baseApi.util.resetApiState);
