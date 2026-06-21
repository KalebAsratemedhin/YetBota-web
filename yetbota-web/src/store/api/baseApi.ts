import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { AuthState } from "@/store/authSlice";
import { IDENTITY_API_BASE } from "@/lib/apiConfig";
import { unwrapEnvelope } from "@/store/api/apiEnvelope";
import { registerApiReset, withReauth } from "@/store/api/reauth";
import { withErrorWindow } from "@/store/api/errorWindow";

type AuthAwareRoot = { auth: AuthState };

const baseUrl = IDENTITY_API_BASE;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  timeout: 15_000,
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
  if (result.error) return result;

  const unwrapped = unwrapEnvelope<unknown>(result.data);
  if (unwrapped.error) {
    return { error: unwrapped.error as FetchBaseQueryError };
  }

  return { data: unwrapped.data };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: withReauth(withErrorWindow(baseQueryUnwrappingEnvelope)),
  tagTypes: ["User", "Auth", "Me"],
  endpoints: () => ({}),
});

registerApiReset(baseApi.util.resetApiState);
