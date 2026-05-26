import { contentBaseApi } from "@/store/api/contentBaseApi";
import type {
  AdminUserStatsData,
  AuditLogData,
  AuditLogQuery,
  OverviewActivityData,
  OverviewActivityQuery,
  OverviewGrowthData,
  OverviewGrowthQuery,
  OverviewStatsData,
  SystemHealthData,
} from "@/types/admin";

// Admin dashboard reads live on content-service under /v1/admin/... and require
// an ADMIN (or CSA) role. contentBaseApi already attaches the bearer token and
// unwraps the {success,data} envelope, so these return the `data` payload.
export const adminApi = contentBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Overview — top KPI cards.
    getAdminOverviewStats: builder.query<OverviewStatsData, void>({
      query: () => ({ url: "/admin/overview/stats", method: "GET" }),
      providesTags: [{ type: "AdminStats" as const, id: "OVERVIEW" }],
    }),

    // Overview — cumulative user-growth series for the sparkline.
    getAdminOverviewGrowth: builder.query<OverviewGrowthData, OverviewGrowthQuery | void>({
      query: (arg) => ({
        url: "/admin/overview/growth",
        method: "GET",
        params: { metric: "users", range: arg?.range ?? "7d" },
      }),
      providesTags: [{ type: "AdminStats" as const, id: "GROWTH" }],
    }),

    // Overview — merged newest-first feed of recent posts + pending reports.
    getAdminOverviewActivity: builder.query<OverviewActivityData, OverviewActivityQuery | void>({
      query: (arg) => ({
        url: "/admin/overview/activity",
        method: "GET",
        params: arg?.limit ? { limit: arg.limit } : {},
      }),
      providesTags: [{ type: "AdminStats" as const, id: "ACTIVITY" }],
    }),

    // User management — header stat cards.
    getAdminUserStats: builder.query<AdminUserStatsData, void>({
      query: () => ({ url: "/admin/users/stats", method: "GET" }),
      providesTags: [{ type: "AdminStats" as const, id: "USERS" }],
    }),

    // System logs — service health status cards.
    getAdminSystemHealth: builder.query<SystemHealthData, void>({
      query: () => ({ url: "/admin/system/health", method: "GET" }),
    }),

    // System logs — paginated, filterable audit trail (sourced from moderation
    // actions). Acting on a moderation case invalidates this (see below).
    getAdminAuditLog: builder.query<AuditLogData, AuditLogQuery | void>({
      query: (arg) => {
        const params: Record<string, string | number> = {};
        if (arg) {
          if (arg.action_type) params.action_type = arg.action_type;
          if (arg.actor) params.actor = arg.actor;
          if (arg.from) params.from = arg.from;
          if (arg.to) params.to = arg.to;
          if (arg.page) params.page = arg.page;
          if (arg.page_size) params.page_size = arg.page_size;
        }
        return { url: "/admin/system/audit", method: "GET", params };
      },
      providesTags: [{ type: "AdminAudit" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminOverviewStatsQuery,
  useGetAdminOverviewGrowthQuery,
  useGetAdminOverviewActivityQuery,
  useGetAdminUserStatsQuery,
  useGetAdminSystemHealthQuery,
  useGetAdminAuditLogQuery,
} = adminApi;
