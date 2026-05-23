import { baseApi } from "@/store/api/baseApi";
import { setCredentials } from "@/store/authSlice";
import { setSessionCookie } from "@/lib/sessionCookie";
import type {
  AuthorizationRequest,
  ChangeMobileRequest,
  ChangePasswordRequest,
  CheckMobileRequest,
  GenerateMobileOTPRequest,
  ListUsersData,
  ListUsersQuery,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
  NewPasswordRequest,
  OtpLimits,
  RefreshRequest,
  RefreshResponseData,
  RegisterRequest,
  ReadUserData,
  Resolution,
  UpdateSelfRequest,
  UpdateUserRequest,
  UserPublicData,
  UserPrivate,
  ValidateOTPRequest,
} from "@/types/auth";

async function applyAuthSuccess(
  dispatch: (a: ReturnType<typeof setCredentials>) => void,
  username: string,
  queryFulfilled: Promise<{ data: LoginResponseData | RefreshResponseData }>
) {
  const { data } = await queryFulfilled;
  const creds = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    user: { username },
  };

  dispatch(setCredentials(creds));

  // Persist immediately so other pages (and other API slices) can use it even
  // before the Providers subscription effect runs.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("yetbota.localAuth", JSON.stringify(creds));
      console.log("[auth] persisted session to localStorage", { username });
    } catch {
      // ignore
    }
    setSessionCookie();
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth", "Me"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await applyAuthSuccess(dispatch, arg.username, queryFulfilled);
        } catch {
          /* handled by caller / RTK error state */
        }
      },
    }),
    refresh: builder.mutation<RefreshResponseData, RefreshRequest>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth", "Me"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await applyAuthSuccess(dispatch, arg.username, queryFulfilled);
        } catch {
          /* caller or global handler */
        }
      },
    }),

    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    generateMobileOtp: builder.mutation<OtpLimits, GenerateMobileOTPRequest>({
      query: (body) => ({ url: "/auth/otp/mobile", method: "POST", body }),
    }),

    validateMobileOtp: builder.mutation<OtpLimits, ValidateOTPRequest>({
      query: (body) => ({ url: "/auth/otp/validate", method: "POST", body }),
    }),

    newPassword: builder.mutation<void, NewPasswordRequest>({
      query: (body) => ({ url: "/auth/password/new", method: "POST", body }),
    }),

    authorize: builder.mutation<void, AuthorizationRequest>({
      query: (body) => ({ url: "/auth/authorization", method: "POST", body }),
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/auth/password/change", method: "POST", body }),
      invalidatesTags: ["Me"],
    }),

    changeMobile: builder.mutation<void, ChangeMobileRequest>({
      query: (body) => ({ url: "/auth/mobile/change", method: "POST", body }),
      invalidatesTags: ["Me"],
    }),

    register: builder.mutation<UserPrivate, RegisterRequest>({
      query: (body) => ({ url: "/users/register", method: "POST", body }),
      invalidatesTags: ["User", "Auth", "Me"],
    }),

    getMe: builder.query<{ user: UserPrivate }, { resolution?: Resolution } | void>({
      query: (arg) => ({
        url: "/users/me",
        method: "GET",
        params:
          arg && typeof arg === "object" && arg.resolution !== undefined ? { resolution: arg.resolution } : undefined,
      }),
      providesTags: ["Me"],
    }),

    listUsers: builder.query<ListUsersData, ListUsersQuery | void>({
      query: (query) => ({ url: "/users/", method: "GET", params: query ?? undefined }),
      providesTags: ["User"],
    }),

    getUserById: builder.query<ReadUserData, { id: string; resolution?: Resolution }>({
      query: ({ id, resolution }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "GET",
        params: resolution ? { resolution } : undefined,
      }),
      providesTags: (_result, _err, arg) => [{ type: "User" as const, id: arg.id }],
    }),

    getUserPublicById: builder.query<UserPublicData, { id: string; resolution?: Resolution }>({
      query: ({ id, resolution }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "GET",
        params: resolution ? { resolution } : undefined,
      }),
    }),

    updateUserById: builder.mutation<UserPrivate, { id: string; body: UpdateUserRequest }>({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: "User" as const, id: arg.id }],
    }),

    updateSelf: builder.mutation<UserPrivate, UpdateSelfRequest>({
      query: (body) => ({ url: "/users/self", method: "PATCH", body }),
      invalidatesTags: ["User", "Me"],
    }),

    deleteUserById: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/users/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),

    deleteSelf: builder.mutation<void, void>({
      query: () => ({ url: "/users/self", method: "DELETE" }),
      invalidatesTags: ["User", "Auth", "Me"],
    }),

    checkMobile: builder.mutation<boolean, CheckMobileRequest>({
      query: (body) => ({ url: "/users/check-mobile", method: "POST", body }),
    }),

    followUser: builder.mutation<void, { followee_id: string }>({
      query: (body) => ({
        url: "/users/follow",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    unfollowUser: builder.mutation<void, { followee_id: string }>({
      query: (body) => ({
        url: "/users/unfollow",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    uploadMyProfileImage: builder.mutation<{ url: string }, { image_base64: string }>({
      query: (body) => ({
        url: "/users/profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Me"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGenerateMobileOtpMutation,
  useValidateMobileOtpMutation,
  useNewPasswordMutation,
  useAuthorizeMutation,
  useChangePasswordMutation,
  useChangeMobileMutation,
  useRegisterMutation,
  useGetMeQuery,
  useListUsersQuery,
  useLazyListUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserPublicByIdQuery,
  useLazyGetUserPublicByIdQuery,
  useUpdateUserByIdMutation,
  useUpdateSelfMutation,
  useDeleteUserByIdMutation,
  useDeleteSelfMutation,
  useCheckMobileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUploadMyProfileImageMutation,
} = authApi;
