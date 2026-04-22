import {
  Users,
  MapPin,
  Activity,
  HelpCircle,
  FileText,
  ShieldAlert,
  Plus,
  ThumbsUp,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { label: "Total Users", value: "124,802", change: "+12%", positive: true, icon: Users },
  { label: "Total Locations", value: "1,420", change: "+5%", positive: true, icon: MapPin },
  { label: "Daily Active Users", value: "12,504", change: "-2%", positive: false, icon: Activity },
  { label: "Total Questions", value: "45,210", change: "+18%", positive: true, icon: HelpCircle },
];

const activityItems = [
  {
    icon: Plus,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    title: 'New Post by @sarah_explorer',
    sub: '"Hidden waterfalls in the northern valley..."',
    time: "2m ago",
  },
  {
    icon: ThumbsUp,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    title: "Upvote Milestone",
    sub: 'Post "Best Coffee in Addis" reached 500 upvotes',
    time: "15m ago",
  },
  {
    icon: AlertCircle,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    title: "New Report Logged",
    sub: "Inappropriate content reported at Location #1402",
    time: "",
    action: "Review",
  },
  {
    icon: BadgeCheck,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    title: "New Guide Verified",
    sub: "User @kebede_j has been promoted to Guide status",
    time: "1h ago",
  },
];

function MiniChart({ variant }: { variant: "growth" | "location" }) {
  const points =
    variant === "growth"
      ? "M 0 80 C 40 70, 80 30, 120 50 C 160 70, 200 20, 240 35 C 280 50, 320 60, 360 40"
      : "M 0 90 C 60 85, 100 70, 150 60 C 200 50, 250 30, 300 20 C 330 15, 350 10, 360 5";
  const fill =
    variant === "growth"
      ? "M 0 80 C 40 70, 80 30, 120 50 C 160 70, 200 20, 240 35 C 280 50, 320 60, 360 40 L 360 100 L 0 100 Z"
      : "M 0 90 C 60 85, 100 70, 150 60 C 200 50, 250 30, 300 20 C 330 15, 350 10, 360 5 L 360 100 L 0 100 Z";
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="relative h-[160px] mt-4">
      <svg viewBox="0 0 360 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#grad-${variant})`} />
        <path d={points} fill="none" stroke="#22c55e" strokeWidth="2" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-slate-600 font-medium">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
          Platform Overview
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2" asChild>
            <Link href="/admin/reports">
              <ShieldAlert className="w-4 h-4" />
              Moderation Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, positive, icon: Icon }) => (
          <div
            key={label}
            className="bg-card rounded-2xl border border-white/5 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <span
              className={`text-sm font-semibold ${positive ? "text-primary" : "text-red-400"}`}
            >
              {change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">User Growth</h3>
              <p className="text-sm text-slate-500">Monthly user registrations</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">124.8k</p>
              <p className="text-sm text-primary font-semibold">+2.4k this week</p>
            </div>
          </div>
          <MiniChart variant="growth" />
        </div>
        <div className="bg-card rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Location Growth</h3>
              <p className="text-sm text-slate-500">Expansion of indexed spots</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">1.4k</p>
              <p className="text-sm text-primary font-semibold">+42 this week</p>
            </div>
          </div>
          <MiniChart variant="location" />
        </div>
      </div>

      {/* Recent Community Activity */}
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Community Activity</h3>
          <span className="px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-bold">
            Live updates
          </span>
        </div>
        <div className="space-y-1">
          {activityItems.map(({ icon: Icon, iconBg, iconColor, title, sub, time, action }) => (
            <div
              key={title}
              className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0"
            >
              <div
                className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-500 text-sm truncate">{sub}</p>
              </div>
              {time && <span className="text-slate-500 text-sm shrink-0">{time}</span>}
              {action && (
                <span className="text-primary text-sm font-semibold shrink-0 cursor-pointer hover:underline">
                  {action}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
