"use client";

import Link from "next/link";
import {
  Users,
  MapPin,
  Activity,
  MessageSquare,
  Download,
  Gavel,
  MessageSquarePlus,
  ThumbsUp,
  Flag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { PageHeader, StatCard, SectionCard, TonePill, type Tone } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

// Representative figures — no analytics backend exists yet. Shaped so a future
// `useGetAdminOverviewQuery()` can drop straight in.
const STATS = [
  { label: "Total Users", value: "124,802", delta: "+12%", deltaTone: "brand" as Tone, icon: Users },
  { label: "Total Locations", value: "1,420", delta: "+5%", deltaTone: "brand" as Tone, icon: MapPin },
  { label: "Daily Active Users", value: "12,504", delta: "-2%", deltaTone: "red" as Tone, icon: Activity },
  { label: "Total Questions", value: "45,210", delta: "+18%", deltaTone: "brand" as Tone, icon: MessageSquare },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type ActivityItem = {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  detail: string;
  meta: string;
  action?: { label: string; href: string };
};

const ACTIVITY: ActivityItem[] = [
  {
    icon: MessageSquarePlus,
    tone: "blue",
    title: "New Post by @sarah_explorer",
    detail: "\"Hidden waterfalls in the northern valley...\"",
    meta: "2m ago",
  },
  {
    icon: ThumbsUp,
    tone: "brand",
    title: "Upvote Milestone",
    detail: "Post \"Best Coffee in Addis\" reached 500 upvotes",
    meta: "15m ago",
  },
  {
    icon: Flag,
    tone: "red",
    title: "New Report Logged",
    detail: "Inappropriate content reported at Location #1402",
    meta: "",
    action: { label: "Review", href: "/admin/reports" },
  },
  {
    icon: UserPlus,
    tone: "purple",
    title: "New Guide Verified",
    detail: "User @kebede_j has been promoted to Guide status",
    meta: "1h ago",
  },
];

function Sparkline({
  gradientId,
  line,
  area,
}: {
  gradientId: string;
  line: string;
  area: string;
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
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={3} />
      </svg>
      <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-fg-faint">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function GrowthCard({
  title,
  subtitle,
  total,
  trend,
  gradientId,
  line,
  area,
}: {
  title: string;
  subtitle: string;
  total: string;
  trend: string;
  gradientId: string;
  line: string;
  area: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-fg text-lg font-bold">{title}</h3>
          <p className="text-fg-muted text-sm">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-fg text-2xl font-bold">{total}</span>
          <p className="text-brand text-xs font-bold">{trend}</p>
        </div>
      </div>
      <Sparkline gradientId={gradientId} line={line} area={area} />
    </div>
  );
}

export default function AdminOverviewPage() {
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
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

      {/* Growth charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GrowthCard
          title="User Growth"
          subtitle="Monthly user registrations"
          total="124.8k"
          trend="+2.4k this week"
          gradientId="gradientUser"
          line="M0,80 Q50,70 100,85 T200,40 T300,50 T400,20"
          area="M0,80 Q50,70 100,85 T200,40 T300,50 T400,20 V100 H0 Z"
        />
        <GrowthCard
          title="Location Growth"
          subtitle="Expansion of indexed spots"
          total="1.4k"
          trend="+42 this week"
          gradientId="gradientLoc"
          line="M0,90 Q50,85 100,70 T200,60 T300,30 T400,45"
          area="M0,90 Q50,85 100,70 T200,60 T300,30 T400,45 V100 H0 Z"
        />
      </div>

      {/* Recent activity */}
      <SectionCard
        title="Recent Community Activity"
        action={<TonePill tone="brand">Live updates</TonePill>}
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-border-subtle">
          {ACTIVITY.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-overlay"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    item.tone === "brand"
                      ? "bg-brand/10 text-brand"
                      : item.tone === "blue"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : item.tone === "red"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-fg truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-fg-muted truncate text-xs">{item.detail}</p>
                </div>
                {item.action ? (
                  <Link
                    href={item.action.href}
                    className="text-brand shrink-0 text-xs font-bold hover:underline"
                  >
                    {item.action.label}
                  </Link>
                ) : (
                  <span className="text-fg-faint shrink-0 text-xs">{item.meta}</span>
                )}
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
