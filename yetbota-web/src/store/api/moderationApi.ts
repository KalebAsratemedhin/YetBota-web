import { contentBaseApi } from "@/store/api/contentBaseApi";
import type {
  CaseActionData,
  CaseActionRequest,
  CaseDetailData,
  CreateReportData,
  CreateReportRequest,
  ListCasesData,
  ListCasesQuery,
} from "@/types/moderation";

const LIST_ID = "LIST" as const;

export const moderationApi = contentBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin — review the moderation queue. Defaults to PENDING server-side.
    listModerationCases: builder.query<ListCasesData, ListCasesQuery | void>({
      query: (arg) => {
        const params: Record<string, string | number> = {};
        if (arg) {
          if (arg.status) params.status = arg.status;
          if (arg.reason) params.reason = arg.reason;
          if (arg.content_type) params.content_type = arg.content_type;
          if (arg.page) params.page = arg.page;
          if (arg.page_size) params.page_size = arg.page_size;
        }
        return { url: "/admin/moderation/cases", method: "GET", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.cases.map((c) => ({ type: "ModerationCase" as const, id: c.case.id })),
              { type: "ModerationCase" as const, id: LIST_ID },
            ]
          : [{ type: "ModerationCase" as const, id: LIST_ID }],
    }),

    // Admin — full case detail (case + reports + content).
    getModerationCase: builder.query<CaseDetailData, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/moderation/cases/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, arg) => [{ type: "ModerationCase" as const, id: arg.id }],
    }),

    // Admin — act on a case (DELETE / DISMISS / BAN). `version` drives optimistic
    // concurrency: a stale version comes back as HTTP 409.
    actOnModerationCase: builder.mutation<CaseActionData, { id: string; body: CaseActionRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/moderation/cases/${encodeURIComponent(id)}/actions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "ModerationCase" as const, id: arg.id },
        { type: "ModerationCase" as const, id: LIST_ID },
        // A moderation action writes the audit trail and shifts overview/report
        // counts, so refresh those admin dashboard reads too.
        { type: "AdminAudit" as const, id: LIST_ID },
        { type: "AdminStats" as const, id: "ACTIVITY" },
        { type: "AdminStats" as const, id: "OVERVIEW" },
      ],
    }),

    // End-user — report a post/comment. Wired into content screens via
    // ReportDialog (post action menu + answer cards).
    createReport: builder.mutation<CreateReportData, CreateReportRequest>({
      query: (body) => ({ url: "/reports", method: "POST", body }),
      invalidatesTags: [{ type: "ModerationCase", id: LIST_ID }],
    }),
  }),
});

export const {
  useListModerationCasesQuery,
  useGetModerationCaseQuery,
  useActOnModerationCaseMutation,
  useCreateReportMutation,
} = moderationApi;
