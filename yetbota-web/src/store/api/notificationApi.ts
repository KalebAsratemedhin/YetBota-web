import { contentBaseApi } from "@/store/api/contentBaseApi";
import type {
  ListNotificationsData,
  ListNotificationsQuery,
  MarkNotificationsReadData,
  MarkNotificationsReadRequest,
} from "@/types/notification";

// In-app notification center — content-service /v1/notifications.
// See notifications-frontend-integration.md, Part 2.
export const notificationApi = contentBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query<ListNotificationsData, ListNotificationsQuery | void>({
      query: (arg) => ({
        url: "/notifications/",
        method: "GET",
        params: arg ?? undefined,
      }),
      providesTags: ["Notification"],
    }),

    markNotificationsRead: builder.mutation<MarkNotificationsReadData, MarkNotificationsReadRequest>({
      query: (body) => ({ url: "/notifications/mark-read", method: "POST", body }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListNotificationsQuery,
  useMarkNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
