"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Hourglass,
  History,
  Timer,
  ShieldCheck,
  EyeOff,
  Trash2,
  Gavel,
  Ban,
  Trash,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  SectionCard,
  TonePill,
  AdminPagination,
  TONE_DOT,
  type Tone,
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

// Representative moderation queue — no reports backend exists yet. Search and
// the priority filter operate on this list client-side so the controls are live.
type Report = {
  id: string;
  preview: string;
  reason: { label: string; tone: Tone };
  priority: { label: string; tone: Tone };
  reporter: string;
};

const REPORTS: Report[] = [
  {
    id: "REP-9482",
    preview: "\"Get free coins now at bit.ly/spam-link...\"",
    reason: { label: "Spam", tone: "red" },
    priority: { label: "Critical", tone: "red" },
    reporter: "User_9921",
  },
  {
    id: "REP-9483",
    preview: "\"That player is absolutely [removed offensive text]\"",
    reason: { label: "Offensive", tone: "orange" },
    priority: { label: "High", tone: "orange" },
    reporter: "Mod_Check",
  },
  {
    id: "REP-9484",
    preview: "\"The stats for the last game are wrong...\"",
    reason: { label: "Incorrect", tone: "blue" },
    priority: { label: "Low", tone: "slate" },
    reporter: "Data_Guard",
  },
  {
    id: "REP-9485",
    preview: "\"Join this server for exclusive bot features...\"",
    reason: { label: "Spam", tone: "red" },
    priority: { label: "High", tone: "orange" },
    reporter: "System_Bot",
  },
];

const STATS = [
  { label: "Pending Reports", value: "128", delta: "+12%", deltaTone: "brand" as Tone, icon: Hourglass, iconTone: "brand" as Tone },
  { label: "Actions (24h)", value: "45", delta: "-5%", deltaTone: "red" as Tone, icon: History, iconTone: "blue" as Tone },
  { label: "Avg Resolution Time", value: "14m", delta: "-2.4%", deltaTone: "brand" as Tone, icon: Timer, iconTone: "orange" as Tone },
  { label: "Active Mods", value: "12", icon: ShieldCheck, iconTone: "purple" as Tone },
];

type ModAction = { icon: LucideIcon; tone: Tone; title: string; meta: string };

const MOD_ACTIONS: ModAction[] = [
  { icon: Ban, tone: "red", title: "User \"BotDev_2\" Banned", meta: "By Admin User • 2m ago" },
  { icon: Trash, tone: "brand", title: "Deleted 15 spam messages", meta: "System Auto-Mod • 15m ago" },
  { icon: CircleCheck, tone: "blue", title: "Report #REP-9471 Dismissed", meta: "By Moderator_2 • 1h ago" },
];

const PRIORITIES = ["All", "Critical", "High", "Low"] as const;

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REPORTS.filter((r) => {
      const matchesPriority = priority === "All" || r.priority.label === priority;
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.preview.toLowerCase().includes(q) ||
        r.reporter.toLowerCase().includes(q);
      return matchesPriority && matchesSearch;
    });
  }, [search, priority]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        subtitle="Prioritized moderation queue"
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports, users, or IDs..."
              className="w-full rounded-xl border border-border-subtle bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-fg-faint focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <SectionCard
        title="Flagged Content"
        subtitle="Manual content moderation review"
        action={
          <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-2 p-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  priority === p ? "bg-brand text-white" : "text-fg-muted hover:text-fg"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Content Preview</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-overlay">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/reports/${r.id}`}
                      className="font-mono text-xs text-brand hover:underline"
                    >
                      #{r.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="line-clamp-1 max-w-xs text-sm text-fg">{r.preview}</p>
                  </td>
                  <td className="px-6 py-4">
                    <TonePill tone={r.reason.tone}>{r.reason.label}</TonePill>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", TONE_DOT[r.priority.tone])} />
                      <span className="text-sm font-medium text-fg">{r.priority.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-fg-muted">{r.reporter}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/reports/${r.id}`}
                        title="Dismiss"
                        className="rounded-lg p-2 text-fg-faint transition-all hover:bg-blue-500/10 hover:text-blue-500"
                      >
                        <EyeOff className="h-[18px] w-[18px]" />
                      </Link>
                      <Link
                        href={`/admin/reports/${r.id}`}
                        title="Delete content"
                        className="rounded-lg p-2 text-fg-faint transition-all hover:bg-orange-500/10 hover:text-orange-500"
                      >
                        <Trash2 className="h-[18px] w-[18px]" />
                      </Link>
                      <Link
                        href={`/admin/reports/${r.id}`}
                        title="Ban user"
                        className="rounded-lg p-2 text-fg-faint transition-all hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Gavel className="h-[18px] w-[18px]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-fg-muted">
                    No reports match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={1}
          totalPages={32}
          onPageChange={() => {}}
          label={`Showing ${filtered.length} of 128 reports`}
        />
      </SectionCard>

      <SectionCard title="Recent Mod Actions">
        <ul className="space-y-4">
          {MOD_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.title} className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    a.tone === "brand"
                      ? "bg-brand/10 text-brand"
                      : a.tone === "blue"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">{a.title}</p>
                  <p className="text-xs text-fg-muted">{a.meta}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
