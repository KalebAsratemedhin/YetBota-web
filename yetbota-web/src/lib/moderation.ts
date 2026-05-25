// Presentation helpers for the moderation admin UI — map API enums to labels,
// tones (see AdminUI's tone system), and human-readable timestamps.
import type { Tone } from "@/components/admin/AdminUI";
import type {
  CaseStatus,
  ModerationStatus,
  ReportReason,
} from "@/types/moderation";

export const REASON_META: Record<ReportReason, { label: string; tone: Tone }> = {
  SPAM: { label: "Spam", tone: "red" },
  OFFENSIVE: { label: "Offensive", tone: "orange" },
  INCORRECT: { label: "Incorrect", tone: "blue" },
  OTHER: { label: "Other", tone: "slate" },
};

export const MODERATION_STATUS_META: Record<ModerationStatus, { label: string; tone: Tone }> = {
  VISIBLE: { label: "Visible", tone: "brand" },
  HIDDEN: { label: "Hidden", tone: "orange" },
  REMOVED: { label: "Removed", tone: "red" },
};

export const CASE_STATUS_META: Record<CaseStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "orange" },
  RESOLVED: { label: "Resolved", tone: "brand" },
  REJECTED: { label: "Dismissed", tone: "slate" },
};

// `severity` currently equals the report count. Bucket it into a priority.
export function severityPriority(severity: number): { label: string; tone: Tone } {
  if (severity >= 6) return { label: "Critical", tone: "red" };
  if (severity >= 3) return { label: "High", tone: "orange" };
  return { label: "Low", tone: "slate" };
}

export function shortCaseId(id: string): string {
  // UUIDs are long; show the first segment for a compact, stable label.
  const head = id.split("-")[0] ?? id;
  return head.slice(0, 8).toUpperCase();
}

export function formatModerationDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
