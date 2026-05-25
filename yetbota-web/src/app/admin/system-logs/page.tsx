"use client";

import { Activity, Database, Cpu, ScrollText, type LucideIcon } from "lucide-react";
import { PageHeader, SectionCard, AdminPagination, type Tone } from "@/components/admin/AdminUI";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatusCard = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  pulse?: boolean;
};

const STATUS_CARDS: StatusCard[] = [
  { label: "API Status", value: "Active", note: "+0.2% uptime", icon: Activity, pulse: true },
  { label: "Database Health", value: "98% Health", note: "Optimal Load", icon: Database },
  { label: "AI Service Status", value: "Online", note: "Stable Latency", icon: Cpu },
];

type AuditEntry = {
  timestamp: string;
  actor: string;
  initials: string;
  action: string;
  tone: Tone;
  details: string;
};

const AUDIT_TRAIL: AuditEntry[] = [
  { timestamp: "2023-10-27 14:22:01", actor: "Admin_User_01", initials: "AU", action: "Delete Post", tone: "red", details: "Removed flagged content ID #8821" },
  { timestamp: "2023-10-27 14:15:30", actor: "System_Bot", initials: "SB", action: "Update Reputation", tone: "brand", details: "Recalculated scores for top 100 users" },
  { timestamp: "2023-10-27 13:58:12", actor: "Moderator_X", initials: "MX", action: "User Login", tone: "blue", details: "Successful login from verified IP" },
  { timestamp: "2023-10-27 13:45:00", actor: "Dev_Lead", initials: "DL", action: "System Update", tone: "purple", details: "Patch v2.4.1 deployed to production" },
  { timestamp: "2023-10-27 13:12:44", actor: "System_Bot", initials: "SB", action: "Cache Purge", tone: "orange", details: "Global CDN cache invalidated" },
];

const ACTION_PILL: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand border-brand/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  slate: "bg-fg-faint/10 text-fg-muted border-border-subtle",
};

export default function AdminSystemLogsPage() {
  const { toast } = useToast();

  function handleExportCsv() {
    const header = ["Timestamp", "Actor", "Action Type", "Details"];
    const rows = AUDIT_TRAIL.map((e) => [e.timestamp, e.actor, e.action, e.details]);
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
    <div className="space-y-8">
      <PageHeader
        title="System Logs"
        subtitle="Real-time audit trail and system health monitoring"
      />

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATUS_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm transition-colors hover:border-brand/50"
            >
              <div className="mb-4 flex items-start justify-between">
                <p className="text-fg-muted text-sm font-medium uppercase tracking-wide">
                  {c.label}
                </p>
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <p className="text-fg text-3xl font-bold">{c.value}</p>
              <div className="mt-2 flex items-center gap-1.5">
                {c.pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />}
                <p className="text-brand text-sm font-bold">{c.note}</p>
              </div>
            </div>
          );
        })}
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
              onClick={() => toast({ title: "Logs refreshed" })}
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
              {AUDIT_TRAIL.map((e, i) => (
                <tr key={i} className="transition-colors hover:bg-overlay">
                  <td className="px-6 py-5 text-sm text-fg-muted">{e.timestamp}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-[10px] font-bold text-fg-muted">
                        {e.initials}
                      </div>
                      <span className="text-sm font-medium text-fg">{e.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold",
                        ACTION_PILL[e.tone]
                      )}
                    >
                      {e.action}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-fg-muted">{e.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={1}
          totalPages={257}
          onPageChange={() => {}}
          label="Showing 5 of 1,284 entries"
        />
      </SectionCard>
    </div>
  );
}
