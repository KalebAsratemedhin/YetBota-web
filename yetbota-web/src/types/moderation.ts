// Moderation & reporting — see moderation-frontend-integration.md.
// Admin dashboard talks to the content-service REST routes under
// /v1/admin/moderation/* (envelope-unwrapped by contentBaseApi).

export type ModContentType = "POST" | "COMMENT";
export type ReportReason = "SPAM" | "OFFENSIVE" | "INCORRECT" | "OTHER";
export type CaseStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type ModerationStatus = "VISIBLE" | "HIDDEN" | "REMOVED";
export type AdminAction = "DELETE" | "DISMISS" | "BAN";
export type CaseResolution = "DELETED" | "DISMISSED";

export interface ModerationCase {
  id: string;
  content_type: ModContentType;
  content_id: string;
  report_count: number;
  status: CaseStatus;
  // Currently equals report_count — use for sort/priority.
  severity: number;
  auto_hidden: boolean;
  first_reported_at: string;
  last_reported_at: string;
  // Optimistic-concurrency token; echo it back when acting on the case.
  version: number;
  // Present once the case is resolved/rejected.
  resolved_by?: string;
  resolved_at?: string;
  resolution?: CaseResolution;
}

export interface CasePreview {
  content_type: ModContentType;
  content_id: string;
  author_id: string;
  title?: string;
  snippet: string;
  moderation_status: ModerationStatus;
  // true when the underlying content row is gone — render a placeholder.
  missing: boolean;
}

export interface ModerationCaseListItem {
  case: ModerationCase;
  preview: CasePreview;
}

export interface ListCasesQuery {
  status?: CaseStatus;
  reason?: ReportReason;
  content_type?: ModContentType;
  page?: number;
  page_size?: number;
}

export interface ListCasesData {
  cases: ModerationCaseListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string;
  created_at: string;
}

export interface ModerationContent {
  id: string;
  content_type: ModContentType;
  author_id: string;
  title?: string;
  body: string;
  is_question?: boolean;
  is_answer?: boolean;
  moderation_status: ModerationStatus;
  created_at: string;
}

export interface CaseDetailData {
  case: ModerationCase;
  reports: ModerationReport[];
  // Omitted when the underlying post/comment no longer exists.
  content?: ModerationContent;
}

export interface CaseActionRequest {
  action: AdminAction;
  note?: string;
  ban_reason?: string;
  version: number;
}

export interface CaseActionData {
  case_id: string;
  status: CaseStatus;
  resolution: CaseResolution;
}

// End-user reporting (REST). Exposed for completeness; admin UI doesn't use it.
export interface CreateReportRequest {
  content_type: ModContentType;
  content_id: string;
  reason: ReportReason;
  details?: string;
}

export interface CreateReportData {
  case_id: string;
  report_count: number;
  status: CaseStatus;
  auto_hidden: boolean;
}
