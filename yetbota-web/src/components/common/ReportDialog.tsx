"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, X } from "lucide-react";
import { useCreateReportMutation } from "@/store/api/moderationApi";
import { REASON_META } from "@/lib/moderation";
import type { ModContentType, ReportReason } from "@/types/moderation";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";

// Order shown in the picker. Labels come from REASON_META so they stay in sync
// with the admin UI.
const REASONS: ReportReason[] = ["SPAM", "OFFENSIVE", "INCORRECT", "OTHER"];

// RTK Query rejects with a FetchBaseQueryError whose `status` is the HTTP code
// (or the envelope-derived code). Pull it out so we can special-case 409/429.
function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const s = (error as { status: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

// End-user reporting dialog for a post or comment. Self-reporting, duplicate
// reports (409) and the rate limit (429) are enforced server-side; we surface
// them as friendly toasts. See moderation-frontend-integration.md §2.
export default function ReportDialog({
  open,
  onClose,
  contentType,
  contentId,
  contentLabel = "this content",
}: {
  open: boolean;
  onClose: () => void;
  contentType: ModContentType;
  contentId: string;
  // What we're reporting, used in the heading (e.g. "post", "answer").
  contentLabel?: string;
}) {
  const { toast } = useToast();
  const [createReport, { isLoading }] = useCreateReportMutation();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  // Clear the form on close so a reopened dialog starts fresh (the component
  // stays mounted across open/close, so state would otherwise persist).
  const handleClose = useCallback(() => {
    setReason(null);
    setDetails("");
    onClose();
  }, [onClose]);

  // Lock body scroll and wire Escape-to-close while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, handleClose]);

  if (!open) return null;

  const detailsRequired = reason === "OTHER";
  const canSubmit = Boolean(reason) && (!detailsRequired || details.trim().length > 0) && !isLoading;

  async function handleSubmit() {
    if (!reason || isLoading) return;
    if (detailsRequired && !details.trim()) return;
    try {
      const res = await createReport({
        content_type: contentType,
        content_id: contentId,
        reason,
        details: details.trim() || undefined,
      }).unwrap();
      toast({
        title: res.auto_hidden ? "Thanks — this content is under review" : "Report submitted",
        description: res.auto_hidden
          ? "Enough people have flagged this that it's now hidden pending review."
          : "Thanks for helping keep YetBota safe.",
      });
      handleClose();
    } catch (err) {
      const status = statusOf(err);
      if (status === 409) {
        // Already reported — not a hard error, just let them know.
        toast({ title: "Already reported", description: "You've already reported this." });
        handleClose();
      } else if (status === 429) {
        toast({
          variant: "destructive",
          title: "You're reporting too quickly",
          description: "Please try again later.",
        });
      } else if (status === 401) {
        toast({
          variant: "destructive",
          title: "Sign in required",
          description: "Please sign in to report content.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Couldn't submit report",
          description: getAuthErrorMessage(err),
        });
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overscroll-contain"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Report ${contentLabel}`}
        className="bg-white dark:bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flag className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold text-fg">Report {contentLabel}</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-fg-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-sm text-fg-muted">Why are you reporting this?</p>

          <div className="space-y-2">
            {REASONS.map((r) => {
              const selected = reason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-colors " +
                    (selected
                      ? "border-brand bg-brand/10 text-fg"
                      : "border-border-subtle hover:bg-overlay text-fg-muted")
                  }
                  aria-pressed={selected}
                >
                  <span
                    className={
                      "w-4 h-4 rounded-full border-2 shrink-0 " +
                      (selected ? "border-brand bg-brand" : "border-border-subtle")
                    }
                  />
                  {REASON_META[r].label}
                </button>
              );
            })}
          </div>

          <div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder={detailsRequired ? "Please add a few details (required)" : "Add details (optional)"}
              className="w-full bg-overlay border border-border-subtle rounded-2xl px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-brand/40 resize-none placeholder:text-fg-faint"
            />
            {detailsRequired && !details.trim() ? (
              <p className="mt-1 text-xs text-red-500">Details are required for &ldquo;Other&rdquo;.</p>
            ) : null}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex justify-end gap-3 border-t border-slate-100 dark:border-border-subtle">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 h-11 rounded-2xl border border-border-subtle text-fg-muted font-semibold hover:bg-overlay transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="px-6 h-11 bg-brand text-black font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
