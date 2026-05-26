"use client";

import Link from "next/link";
import { Users, MessageSquare, MapPin, Download, Gavel } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/AdminUI";
import AuditTrail from "@/components/admin/AuditTrail";
import {
  useGetAdminOverviewStatsQuery,
  useGetAdminOverviewGrowthQuery,
} from "@/store/api/adminApi";
import { trendTone, formatChangePct, buildSparklinePaths } from "@/lib/adminDashboard";

function Sparkline({
  gradientId,
  line,
  area,
  labels,
}: {
  gradientId: string;
  line: string;
  area: string;
  labels: string[];
}) {
  return (
    <div className="relative h-44 w-full">
      <svg
        className="h-full w-full text-brand"
        preserveAspectRatio="none"
        viewBox="0 0 400 100"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {line && (
          <path d={line} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={3} />
        )}
      </svg>
      {labels.length > 0 && labels.length <= 12 && (
        <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-fg-faint">
          {labels.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminOverviewStatsQuery();
  const { data: growth, isLoading: growthLoading } = useGetAdminOverviewGrowthQuery({ range: "7d" });

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users.value.toLocaleString(),
          delta: formatChangePct(stats.total_users.change_pct),
          deltaTone: trendTone(stats.total_users.direction),
          icon: Users,
        },
        {
          label: "Total Questions",
          value: stats.total_questions.value.toLocaleString(),
          delta: formatChangePct(stats.total_questions.change_pct),
          deltaTone: trendTone(stats.total_questions.direction),
          icon: MessageSquare,
        },
        {
          label: "Total Locations",
          value: stats.total_locations.value.toLocaleString(),
          delta: formatChangePct(stats.total_locations.change_pct),
          deltaTone: trendTone(stats.total_locations.direction),
          icon: MapPin,
        },
      ]
    : [];

  const growthPaths = growth
    ? buildSparklinePaths(growth.points.map((p) => p.value))
    : { line: "", area: "" };
  const growthLabels = growth?.points.map((p) => p.label) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        subtitle="Community health and growth at a glance"
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
            >
              <Download className="h-[18px] w-[18px]" />
              Generate Report
            </button>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <Gavel className="h-[18px] w-[18px]" />
              Moderation Queue
            </Link>
          </>
        }
      />

      {/* Key stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statsLoading
          ? [0, 1, 2].map((i) => <StatCard key={i} label="Loading…" value="—" />)
          : statCards.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                delta={s.delta}
                deltaTone={s.deltaTone}
                icon={s.icon}
              />
            ))}
      </div>

      {/* Growth chart */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-fg text-lg font-bold">User Growth</h3>
            <p className="text-fg-muted text-sm">Cumulative registrations</p>
          </div>
          <div className="text-right">
            <span className="text-fg text-2xl font-bold">
              {growth ? growth.total.toLocaleString() : "—"}
            </span>
            {growth?.delta_label && (
              <p className="text-brand text-xs font-bold">{growth.delta_label}</p>
            )}
          </div>
        </div>
        {growthLoading ? (
          <div className="flex h-44 items-center justify-center text-sm text-fg-muted">
            Loading chart…
          </div>
        ) : (
          <Sparkline
            gradientId="gradientUser"
            line={growthPaths.line}
            area={growthPaths.area}
            labels={growthLabels}
          />
        )}
      </div>

      {/* System audit log */}
      <AuditTrail />
    </div>
  );
}
