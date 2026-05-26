"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  ChevronRight,
  FileText,
  MessageSquare,
  Trash2,
  CircleCheck,
  Ban,
  Info,
  Lightbulb,
  TriangleAlert,
  Flag,
} from "lucide-react";
import { SectionCard, TonePill, type Tone } from "@/components/admin/AdminUI";
import {
  useGetModerationCaseQuery,
  useActOnModerationCaseMutation,
} from "@/store/api/moderationApi";
import {
  REASON_META,
  MODERATION_STATUS_META,
  CASE_STATUS_META,
  severityPriority,
  shortCaseId,
  formatModerationDate,
} from "@/lib/moderation";
import type { AdminAction } from "@/types/moderation";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACTION_COPY: Record<
  "DELETE" | "BAN",
  { title: string; body: string; confirm: string; tone: Tone }
> = {
  DELETE: {
    title: "Remove this content?",
    body: "The content will be set to REMOVED and hidden from the platform. The case will be resolved.",
    confirm: "Delete Content",
    tone: "red",
  },
  BAN: {
    title: "Ban the author?",
    body: "The content is removed and the author's account is banned — they can no longer log in or refresh their session.",
    confirm: "Ban User",
    tone: "orange",
  },
};

export default function ModerationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const caseId = params?.id ?? "";

  const { data, isLoading, isError, refetch } = useGetModerationCaseQuery(
    { id: caseId },
    { skip: !caseId }
  );
  const [act, { isLoading: acting }] = useActOnModerationCaseMutation();

  const [modalAction, setModalAction] = useState<"DELETE" | "BAN" | null>(null);
  const [note, setNote] = useState("");
  const [banReason, setBanReason] = useState("");

  function closeModal() {
    setModalAction(null);
    setNote("");
    setBanReason("");
  }

  async function runAction(action: AdminAction) {
    if (!data) return;
    try {
      const res = await act({
        id: caseId,
        body: {
          action,
          note: note.trim() || undefined,
          ban_reason: action === "BAN" ? banReason.trim() || undefined : undefined,
          version: data.case.version,
        },
      }).unwrap();
      toast({
        title:
          res.resolution === "DISMISSED"
            ? "Report dismissed"
            : action === "BAN"
              ? "Author banned & content removed"
              : "Content removed",
        description: `Case #${shortCaseId(caseId)} → ${res.status}`,
      });
      closeModal();
      router.push("/admin/reports");
    } catch (err) {
      const httpStatus = (err as FetchBaseQueryError)?.status;
      if (httpStatus === 409) {
        toast({
          variant: "destructive",
          title: "Case changed",
          description: "Someone else acted on this case. Refreshing to the latest state.",
        });
        closeModal();
        refetch();
      } else {
        toast({ variant: "destructive", title: "Action failed", description: getAuthErrorMessage(err) });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-fg-muted">
        Loading case…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <Breadcrumb caseId={caseId} />
        <div className="rounded-2xl border border-border-subtle bg-surface p-10 text-center shadow-sm">
          <p className="text-fg font-semibold">Case not found</p>
          <p className="mt-1 text-sm text-fg-muted">
            This case may have been removed, or you don&apos;t have access to it.
          </p>
          <Link
            href="/admin/reports"
            className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to queue
          </Link>
        </div>
      </div>
    );
  }

  const { case: c, reports, content } = data;
  const priority = severityPriority(c.severity);
  const caseStatusMeta = CASE_STATUS_META[c.status];
  const isPending = c.status === "PENDING";
  const ContentIcon = c.content_type === "POST" ? FileText : MessageSquare;
  const modStatusMeta = content ? MODERATION_STATUS_META[content.moderation_status] : null;

  // Unique reasons across the reports, for the summary chips.
  const reasons = Array.from(new Set(reports.map((r) => r.reason)));

  return (
    <div className="space-y-6">
      <Breadcrumb caseId={caseId} />

      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <TonePill tone={priority.tone} className="rounded px-2 py-0.5 uppercase">
              {priority.label} priority
            </TonePill>
            <TonePill tone={caseStatusMeta.tone} className="rounded px-2 py-0.5">
              {caseStatusMeta.label}
            </TonePill>
            <span className="text-sm text-fg-muted">
              First reported {formatModerationDate(c.first_reported_at)}
            </span>
          </div>
          <h1 className="text-fg text-2xl font-bold tracking-tight sm:text-3xl">
            Review Flagged Content
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
            <ContentIcon className="h-4 w-4" />
            {c.content_type === "POST" ? "Post" : "Comment"} · {c.report_count} report
            {c.report_count === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Resolved banner */}
      {!isPending && (
        <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-2 p-4">
          <CircleCheck className="mt-0.5 h-5 w-5 text-brand" />
          <div className="text-sm">
            <p className="font-semibold text-fg">
              This case is {caseStatusMeta.label.toLowerCase()}
              {c.resolution ? ` (${c.resolution.toLowerCase()})` : ""}.
            </p>
            <p className="text-fg-muted">
              {c.resolved_at ? `Resolved ${formatModerationDate(c.resolved_at)}` : "No further action needed."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: content + actions */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Content Preview"
            icon={ContentIcon}
            action={
              modStatusMeta ? (
                <TonePill tone={modStatusMeta.tone}>{modStatusMeta.label}</TonePill>
              ) : undefined
            }
            bodyClassName="p-6"
          >
            {content ? (
              <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand">
                    {shortCaseId(content.author_id).slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fg">Author {shortCaseId(content.author_id)}</p>
                    <p className="text-[10px] text-fg-muted">
                      Posted {formatModerationDate(content.created_at)}
                    </p>
                  </div>
                </div>
                {content.title && (
                  <h3 className="mb-2 text-lg font-bold text-fg">{content.title}</h3>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{content.body}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-2 p-10 text-center">
                <TriangleAlert className="h-6 w-6 text-fg-faint" />
                <p className="text-sm font-medium text-fg-muted">
                  The reported content no longer exists.
                </p>
                <p className="text-xs text-fg-faint">Content ID: {c.content_id}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Take Action" icon={Flag} bodyClassName="p-6">
            {!isPending ? (
              <p className="text-sm text-fg-muted">
                No actions available — this case has already been{" "}
                {caseStatusMeta.label.toLowerCase()}.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setModalAction("DELETE")}
                  disabled={acting}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-red-500 hover:bg-red-500/5 disabled:opacity-50"
                >
                  <Trash2 className="h-8 w-8 text-fg-faint transition-colors group-hover:text-red-500" />
                  <span className="font-bold text-fg-muted transition-colors group-hover:text-red-500">
                    Delete Content
                  </span>
                  <span className="text-center text-[10px] text-fg-faint">
                    Remove post from the platform
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => runAction("DISMISS")}
                  disabled={acting}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-brand hover:bg-brand/5 disabled:opacity-50"
                >
                  <CircleCheck className="h-8 w-8 text-fg-faint transition-colors group-hover:text-brand" />
                  <span className="font-bold text-fg-muted transition-colors group-hover:text-brand">
                    Dismiss Report
                  </span>
                  <span className="text-center text-[10px] text-fg-faint">
                    No violation; restore if hidden
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction("BAN")}
                  disabled={acting}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-orange-500 hover:bg-orange-500/5 disabled:opacity-50"
                >
                  <Ban className="h-8 w-8 text-fg-faint transition-colors group-hover:text-orange-500" />
                  <span className="font-bold text-fg-muted transition-colors group-hover:text-orange-500">
                    Ban User
                  </span>
                  <span className="text-center text-[10px] text-fg-faint">
                    Remove content & ban the author
                  </span>
                </button>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: reports + insight */}
        <div className="space-y-6">
          <SectionCard title="Report Details" icon={Info} bodyClassName="space-y-6 p-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-fg-muted">
                Reasons ({reports.length} report{reports.length === 1 ? "" : "s"})
              </p>
              <div className="flex flex-wrap gap-2">
                {reasons.length === 0 ? (
                  <span className="text-sm text-fg-faint">No reports recorded.</span>
                ) : (
                  reasons.map((r) => (
                    <TonePill key={r} tone={REASON_META[r].tone} className="rounded-full px-3 py-1">
                      {REASON_META[r].label}
                    </TonePill>
                  ))
                )}
              </div>
            </div>

            {reports.length > 0 && (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border-subtle bg-surface-2 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-fg">
                        Reporter {shortCaseId(r.reporter_id)}
                      </span>
                      <TonePill tone={REASON_META[r.reason].tone}>
                        {REASON_META[r.reason].label}
                      </TonePill>
                    </div>
                    {r.details && (
                      <p className="text-xs italic leading-relaxed text-fg-muted">
                        &quot;{r.details}&quot;
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-fg-faint">
                      {formatModerationDate(r.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand">
              <Lightbulb className="h-5 w-5" />
              Mod Insight
            </h4>
            <p className="text-xs leading-normal text-fg-muted">
              Dismissing restores auto-hidden content. Deleting sets it to REMOVED. Banning also
              removes the content and locks the author out at their next token refresh.
            </p>
          </div>
        </div>
      </div>

      {/* Action confirmation modal (DELETE / BAN) */}
      {modalAction && (
        <ActionModal
          copy={ACTION_COPY[modalAction]}
          action={modalAction}
          note={note}
          onNote={setNote}
          banReason={banReason}
          onBanReason={setBanReason}
          acting={acting}
          onCancel={closeModal}
          onConfirm={() => runAction(modalAction)}
        />
      )}
    </div>
  );
}

function Breadcrumb({ caseId }: { caseId: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <Link href="/admin/reports" className="hover:text-brand">
        Reports
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="font-medium text-fg">Case #{caseId ? shortCaseId(caseId) : "—"}</span>
    </div>
  );
}

function ActionModal({
  copy,
  action,
  note,
  onNote,
  banReason,
  onBanReason,
  acting,
  onCancel,
  onConfirm,
}: {
  copy: { title: string; body: string; confirm: string; tone: Tone };
  action: "DELETE" | "BAN";
  note: string;
  onNote: (v: string) => void;
  banReason: string;
  onBanReason: (v: string) => void;
  acting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl">
        <div className="p-6">
          <div
            className={cn(
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
              copy.tone === "red" ? "bg-red-500/10" : "bg-orange-500/10"
            )}
          >
            <TriangleAlert
              className={cn("h-8 w-8", copy.tone === "red" ? "text-red-500" : "text-orange-500")}
            />
          </div>
          <h3 className="mb-2 text-center text-xl font-bold text-fg">{copy.title}</h3>
          <p className="mb-6 text-center text-sm text-fg-muted">{copy.body}</p>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-muted">
                Moderation Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => onNote(e.target.value)}
                rows={2}
                placeholder="Recorded in the audit log"
                className="w-full resize-none rounded-lg border border-border-subtle bg-surface-2 p-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
              />
            </div>
            {action === "BAN" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-muted">
                  Ban Reason (optional)
                </label>
                <input
                  value={banReason}
                  onChange={(e) => onBanReason(e.target.value)}
                  placeholder="Reason recorded with the ban"
                  className="w-full rounded-lg border border-border-subtle bg-surface-2 p-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 border-t border-border-subtle bg-surface-2 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={acting}
            className="flex-1 rounded-lg px-4 py-2.5 font-bold text-fg-muted transition-colors hover:bg-overlay disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={acting}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 font-bold text-white transition-colors disabled:opacity-50",
              copy.tone === "red" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
            )}
          >
            {acting ? "Working…" : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
