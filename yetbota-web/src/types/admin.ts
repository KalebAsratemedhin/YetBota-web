// Admin dashboard domain types — overview KPIs, growth chart, activity feed,
// user stats, system health and audit log. These mirror the `data` payloads
// documented in admin-dashboard-frontend-integration.md (the `{success,data}`
// envelope is unwrapped by contentBaseApi, so these describe `data` directly).

export type TrendDirection = "up" | "down" | "flat";

/** A KPI value with an optional period-over-period change indicator. */
export interface MetricChange {
  value: number;
  // Integer percentage; omitted when not applicable ("no change indicator").
  change_pct?: number;
  direction?: TrendDirection;
}

export interface OverviewStatsData {
  total_users: MetricChange;
  total_questions: MetricChange;
  total_posts: MetricChange;
  total_locations: MetricChange;
}

/* ----------------------------------------------------------------- growth */

export type GrowthRange = "7d" | "30d" | "90d";

export interface GrowthPoint {
  label: string;
  value: number;
}

export interface OverviewGrowthQuery {
  // Only `users` is supported server-side; any other value → 400.
  metric?: "users";
  range?: GrowthRange;
}

export interface OverviewGrowthData {
  metric: "users";
  range: GrowthRange;
  total: number;
  // Pre-formatted (e.g. "+84 this week"); render as-is.
  delta_label: string;
  points: GrowthPoint[];
}

/* --------------------------------------------------------------- activity */

export type ActivityType = "NEW_POST" | "NEW_REPORT";

export interface ActivityLink {
  label: string;
  href: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  // May be empty/omitted — render conditionally.
  detail?: string;
  created_at: string;
  // Present only on NEW_REPORT items.
  link?: ActivityLink;
}

export interface OverviewActivityQuery {
  limit?: number;
}

export interface OverviewActivityData {
  items: ActivityItem[];
}

/* ------------------------------------------------------------- user stats */

export interface NewlyJoinedMetric {
  value: number;
  change_pct?: number;
}

export interface HighReputationMetric {
  value: number;
  threshold: number;
}

export interface AdminUserStatsData {
  newly_joined_today: NewlyJoinedMetric;
  high_reputation_users: HighReputationMetric;
}

/* ----------------------------------------------------------- system health */

export interface SystemServiceHealth {
  key: string;
  label: string;
  status: string;
  metric: string;
  healthy: boolean;
}

export interface SystemHealthData {
  services: SystemServiceHealth[];
}

/* --------------------------------------------------------------- audit log */

export type AuditActionType = "DELETE" | "DISMISS" | "BAN" | "UNHIDE";

export interface AuditActor {
  id: string;
  // Admin username, falling back to the admin id.
  display: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action_type: AuditActionType;
  details?: string;
}

export interface AuditLogQuery {
  action_type?: AuditActionType;
  actor?: string;
  // `YYYY-MM-DD` or RFC3339.
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export interface AuditLogData {
  entries: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
}
