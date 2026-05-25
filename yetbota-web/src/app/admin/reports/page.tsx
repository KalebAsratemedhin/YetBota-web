"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hourglass,
  CircleCheck,
  XCircle,
  Layers,
  Eye,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  SectionCard,
  TonePill,
  AdminPagination,
  TONE_DOT,
} from "@/components/admin/AdminUI";
import { useListModerationCasesQuery } from "@/store/api/moderationApi";
import {
  MODERATION_STATUS_META,
  severityPriority,
  shortCaseId,
} from "@/lib/moderation";
import type { CaseStatus, ModContentType, ReportReason } from "@/types/moderation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_TABS: { label: string; value: CaseStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Dismissed", value: "REJECTED" },
];

const REASON_OPTIONS: { label: string; value: "" | ReportReason }[] = [
  { label: "Reason: All", value: "" },
  { label: "Spam", value: "SPAM" },
  { label: "Offensive", value: "OFFENSIVE" },
  { label: "Incorrect", value: "INCORRECT" },
  { label: "Other", value: "OTHER" },
];

const TYPE_OPTIONS: { label: string; value: "" | ModContentType }[] = [
  { label: "Type: All", value: "" },
  { label: "Posts", value: "POST" },
  { label: "Comments", value: "COMMENT" },
];

function useStatusCount(status: CaseStatus): number | null {
  // Lightweight per-status count for the stat cards.
  const { data } = useListModerationCasesQuery({ status, page_size: 1 });
  return data ? data.total : null;
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState<CaseStatus>("PENDING");
  const [reason, setReason] = useState<"" | ReportReason>("");
  const [contentType, setContentType] = useState<"" | ModContentType>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useListModerationCasesQuery({
    status,
    reason: reason || undefined,
    content_type: contentType || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const pending = useStatusCount("PENDING");
  const resolved = useStatusCount("RESOLVED");
  const rejected = useStatusCount("REJECTED");
  const total =
    pending !== null && resolved !== null && rejected !== null
      ? pending + resolved + rejected
      : null;

  const cases = data?.cases ?? [];
  const grandTotal = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(grandTotal / PAGE_SIZE));
  const rangeStart = grandTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, grandTotal);

  const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString());

  function changeStatus(next: CaseStatus) {
    setStatus(next);
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" subtitle="Prioritized moderation queue" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Cases" value={fmt(pending)} icon={Hourglass} iconTone="orange" />
        <StatCard label="Resolved" value={fmt(resolved)} icon={CircleCheck} iconTone="brand" />
        <StatCard label="Dismissed" value={fmt(rejected)} icon={XCircle} iconTone="slate" />
        <StatCard label="Total Cases" value={fmt(total)} icon={Layers} iconTone="blue" />
      </div>

      <SectionCard
        title="Flagged Content"
        subtitle="Manual content moderation review"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-2 p-1">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => changeStatus(t.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    status === t.value ? "bg-brand text-white" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value as "" | ReportReason);
                setPage(1);
              }}
              className="rounded-xl border border-border-subtle bg-surface-2 px-3 py-2 text-xs font-medium text-fg outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
            >
              {REASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as "" | ModContentType);
                setPage(1);
              }}
              className="rounded-xl border border-border-subtle bg-surface-2 px-3 py-2 text-xs font-medium text-fg outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-4">Case</th>
                <th className="px-6 py-4">Content Preview</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Reports</th>
                <th className="px-6 py-4">Content Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading || (isFetching && cases.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-fg-muted">
                    Loading cases…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-red-500">
                    Couldn&apos;t load the moderation queue. Please try again.
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-fg-muted">
                    No cases match these filters.
                  </td>
                </tr>
              ) : (
                cases.map(({ case: c, preview }) => {
                  const priority = severityPriority(c.severity);
                  const statusMeta = MODERATION_STATUS_META[preview.moderation_status];
                  const ContentIcon = c.content_type === "POST" ? FileText : MessageSquare;
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-overlay">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/reports/${c.id}`}
                          className="font-mono text-xs text-brand hover:underline"
                        >
                          #{shortCaseId(c.id)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {preview.missing ? (
                          <span className="text-sm italic text-fg-faint">[content removed]</span>
                        ) : (
                          <div className="max-w-xs">
                            {preview.title && (
                              <p className="truncate text-sm font-semibold text-fg">
                                {preview.title}
                              </p>
                            )}
                            <p className="line-clamp-1 text-xs text-fg-muted">{preview.snippet}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                          <ContentIcon className="h-4 w-4" />
                          {c.content_type === "POST" ? "Post" : "Comment"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", TONE_DOT[priority.tone])} />
                          <span className="text-sm font-medium text-fg">{c.report_count}</span>
                          <span className="text-xs text-fg-faint">({priority.label})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TonePill tone={statusMeta.tone}>{statusMeta.label}</TonePill>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/reports/${c.id}`}
                            title="Review case"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          label={`Showing ${rangeStart}–${rangeEnd} of ${grandTotal.toLocaleString()} cases`}
        />
      </SectionCard>
    </div>
  );
}
