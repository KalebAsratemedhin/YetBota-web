"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  History,
  Eye,
  EyeOff,
  Gavel,
  Trash2,
  CircleCheck,
  Ban,
  Info,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import { SectionCard, TonePill } from "@/components/admin/AdminUI";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DELETE_REASONS = [
  "Community Guideline Violation",
  "Harassment/Bullying",
  "Hate Speech",
  "Illegal Acts Incitement",
];

export default function ModerationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const caseId = params?.id ?? "REP-0000";

  const [revealed, setRevealed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState(DELETE_REASONS[0]);
  const [notify, setNotify] = useState(false);

  function handleDismiss() {
    toast({ title: "Report dismissed", description: `Case #${caseId} marked resolved.` });
    router.push("/admin/reports");
  }

  function handleBan() {
    toast({ title: "User suspended", description: "@john_doe_22 has been banned." });
    router.push("/admin/reports");
  }

  function confirmDelete() {
    setDeleteOpen(false);
    toast({ title: "Content removed", description: `Reason: ${deleteReason}.` });
    router.push("/admin/reports");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-fg-muted">
        <Link href="/admin/reports" className="hover:text-brand">
          Reports
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-fg">Case #{caseId}</span>
      </div>

      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              High Priority
            </span>
            <span className="text-sm text-fg-muted">Created 2 hours ago</span>
          </div>
          <h1 className="text-fg text-2xl font-bold tracking-tight sm:text-3xl">
            Review Flagged Content
          </h1>
          <p className="mt-1 text-sm italic text-fg-muted">
            Manual content moderation review process
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
        >
          <History className="h-4 w-4" />
          User History
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: content + actions */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Content Preview"
            icon={Eye}
            action={<span className="text-xs text-fg-muted">Post ID: #PX-9921</span>}
            bodyClassName="p-6"
          >
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold text-fg">@john_doe_22</p>
                  <p className="text-[10px] text-fg-muted">Posted Oct 24, 2023 • 14:32</p>
                </div>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-fg">
                &quot;I can&apos;t believe how bad the service is here. Anyone who uses this app is a
                complete idiot and doesn&apos;t deserve respect. We should all find where the
                developers live and let them know what we think in person.&quot;
              </p>
              <div className="overflow-hidden rounded-lg border border-border-subtle">
                <div className="relative flex aspect-video items-center justify-center bg-surface-3">
                  {revealed ? (
                    <p className="text-sm text-fg-muted">Attached image (content revealed)</p>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                      <EyeOff className="mb-2 h-9 w-9 text-white" />
                      <p className="text-sm font-bold text-white">Sensitive Content Filtered</p>
                      <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="mt-3 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black transition-colors hover:bg-white/80"
                      >
                        Reveal Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Take Action" icon={Gavel} bodyClassName="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-red-500 hover:bg-red-500/5"
              >
                <Trash2 className="h-8 w-8 text-fg-faint transition-colors group-hover:text-red-500" />
                <span className="font-bold text-fg-muted transition-colors group-hover:text-red-500">
                  Delete Content
                </span>
                <span className="text-center text-[10px] text-fg-faint">
                  Remove post from platform permanently
                </span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-brand hover:bg-brand/5"
              >
                <CircleCheck className="h-8 w-8 text-fg-faint transition-colors group-hover:text-brand" />
                <span className="font-bold text-fg-muted transition-colors group-hover:text-brand">
                  Dismiss Report
                </span>
                <span className="text-center text-[10px] text-fg-faint">
                  Mark as resolved with no violation
                </span>
              </button>
              <button
                type="button"
                onClick={handleBan}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border-subtle p-6 transition-all hover:border-orange-500 hover:bg-orange-500/5"
              >
                <Ban className="h-8 w-8 text-fg-faint transition-colors group-hover:text-orange-500" />
                <span className="font-bold text-fg-muted transition-colors group-hover:text-orange-500">
                  Ban User
                </span>
                <span className="text-center text-[10px] text-fg-faint">
                  Suspend author&apos;s account access
                </span>
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Right: metadata */}
        <div className="space-y-6">
          <SectionCard title="Report Details" icon={Info} bodyClassName="space-y-6 p-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-fg-muted">
                Reporter
              </p>
              <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-fg-muted">
                  UR
                </div>
                <div>
                  <p className="text-sm font-bold text-fg">@user_reporter123</p>
                  <p className="text-xs text-fg-muted">Member since 2021</p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-fg-muted">
                Reason for Flag
              </p>
              <div className="flex flex-wrap gap-2">
                <TonePill tone="red" className="rounded-full px-3 py-1">
                  Harassment
                </TonePill>
                <TonePill tone="orange" className="rounded-full px-3 py-1">
                  Hate Speech
                </TonePill>
              </div>
              <p className="mt-4 border-l-2 border-brand/40 pl-4 text-sm italic leading-relaxed text-fg-muted">
                &quot;This user is calling people idiots and inciting violence by suggesting we go to
                the developers&apos; homes. This is dangerous behavior.&quot;
              </p>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-fg-muted">
                Similar Violations
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-surface-2", "bg-surface-3", "bg-fg-faint/40"].map((c, i) => (
                    <div
                      key={i}
                      className={cn("h-6 w-6 rounded-full border-2 border-surface", c)}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-fg-muted">
                  14 others reported this post
                </span>
              </div>
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand">
              <Lightbulb className="h-5 w-5" />
              Mod Insight
            </h4>
            <p className="text-xs leading-normal text-fg-muted">
              Posts inciting real-world tracking or harassment of individuals violate Section 4.2 of
              the Community Guidelines. This warrants immediate content removal.
            </p>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <TriangleAlert className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-fg">Soft-Delete Content?</h3>
              <p className="mb-6 text-center text-sm text-fg-muted">
                The content will be hidden from the public feed but preserved in our database for 30
                days for legal compliance.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-muted">
                    Moderation Reason (Required)
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-2 p-2.5 text-sm text-fg outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                  >
                    {DELETE_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-fg-muted">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="rounded border-border-subtle text-brand focus:ring-brand"
                  />
                  Notify @john_doe_22 of removal
                </label>
              </div>
            </div>
            <div className="flex gap-3 border-t border-border-subtle bg-surface-2 p-4">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-lg px-4 py-2.5 font-bold text-fg-muted transition-colors hover:bg-overlay"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-red-700"
              >
                Delete Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
