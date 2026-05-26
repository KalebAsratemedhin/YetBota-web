"use client";

import { useEffect, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { SectionCard, AdminPagination, TonePill } from "@/components/admin/AdminUI";
import { useGetAdminAuditLogQuery } from "@/store/api/adminApi";
import { AUDIT_ACTION_META, actorInitials } from "@/lib/adminDashboard";
import { formatModerationDate } from "@/lib/moderation";
import type { AuditActionType } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const ACTION_FILTERS: { label: string; value: "" | AuditActionType }[] = [
  { label: "All actions", value: "" },
  { label: "Delete", value: "DELETE" },
  { label: "Dismiss", value: "DISMISS" },
  { label: "Ban", value: "BAN" },
  { label: "Unhide", value: "UNHIDE" },
];

/**
 * Self-contained system audit trail: actor search + action filter, paginated
 * table and CSV export, all backed by /admin/system/audit. Shared by the
 * overview and the system logs pages.
 */
export default function AuditTrail() {
  const { toast } = useToast();

  const [actorInput, setActorInput] = useState("");
  const [actor, setActor] = useState("");
  const [actionType, setActionType] = useState<"" | AuditActionType>("");
  const [page, setPage] = useState(1);

  // Debounce the actor filter; reset to page 1 when it settles.
  useEffect(() => {
    const t = setTimeout(() => {
      setActor(actorInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [actorInput]);

  const {
    data: audit,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdminAuditLogQuery({
    page,
    page_size: PAGE_SIZE,
    action_type: actionType || undefined,
    actor: actor || undefined,
  });

  const entries = audit?.entries ?? [];
  const total = audit?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  function handleExportCsv() {
    if (entries.length === 0) {
      toast({ title: "Nothing to export", description: "No audit entries on this page." });
      return;
    }
    const header = ["Timestamp", "Actor", "Action Type", "Details"];
    const rows = entries.map((e) => [
      formatModerationDate(e.timestamp),
      e.actor.display,
      AUDIT_ACTION_META[e.action_type]?.label ?? e.action_type,
      e.details ?? "",
    ]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "system-audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export started", description: "Audit trail downloaded as CSV." });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
          <input
            type="search"
            value={actorInput}
            onChange={(e) => setActorInput(e.target.value)}
            placeholder="Filter by actor…"
            className="w-full rounded-xl border border-border-subtle bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-fg-faint focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
          />
        </div>
        <select
          value={actionType}
          onChange={(e) => {
            setActionType(e.target.value as "" | AuditActionType);
            setPage(1);
          }}
          className="rounded-xl border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
        >
          {ACTION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Audit trail */}
      <SectionCard
        title="System Audit Trail"
        icon={ScrollText}
        action={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-bold text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand/20"
            >
              Refresh
            </button>
          </>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-widest text-fg-muted">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading || (isFetching && entries.length === 0) ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-sm text-fg-muted">
                    Loading audit trail…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-sm text-red-500">
                    Couldn&apos;t load the audit trail. Please try again.
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-sm text-fg-muted">
                    No audit entries match your filters.
                  </td>
                </tr>
              ) : (
                entries.map((e) => {
                  const meta = AUDIT_ACTION_META[e.action_type] ?? {
                    label: e.action_type,
                    tone: "slate" as const,
                  };
                  return (
                    <tr key={e.id} className="transition-colors hover:bg-overlay">
                      <td className="px-6 py-5 text-sm text-fg-muted">
                        {formatModerationDate(e.timestamp)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-[10px] font-bold text-fg-muted">
                            {actorInitials(e.actor.display)}
                          </div>
                          <span className="text-sm font-medium text-fg">{e.actor.display}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <TonePill tone={meta.tone}>{meta.label}</TonePill>
                      </td>
                      <td className="px-6 py-5 text-sm text-fg-muted">{e.details || "—"}</td>
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
          label={`Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()} entries`}
        />
      </SectionCard>
    </div>
  );
}
