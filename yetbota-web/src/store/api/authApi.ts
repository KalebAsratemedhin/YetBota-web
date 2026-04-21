import { baseApi } from "@/store/api/baseApi";
import { setCredentials } from "@/store/authSlice";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";

async function applyAuthSuccess(
  dispatch: (a: ReturnType<typeof setCredentials>) => void,
  queryFulfilled: Promise<{ data: AuthResponse }>
) {
  const { data } = await queryFulfilled;
  dispatch(
    setCredentials({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      user: data.user,
    })
  );
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyAuthSuccess(dispatch, queryFulfilled);
        } catch {
          /* handled by caller / RTK error state */
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyAuthSuccess(dispatch, queryFulfilled);
        } catch {
          /* handled by caller */
        }
      },
    }),
    refresh: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyAuthSuccess(dispatch, queryFulfilled);
        } catch {
          /* caller or global handler */
        }
      },
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: "/users/me", method: "GET" }),
      providesTags: (result) => (result ? [{ type: "User" as const, id: result.id }] : ["User"]),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useGetMeQuery, useLazyGetMeQuery } =
  authApi;
