import {
  Settings,
  Database,
  Bot,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const healthCards = [
  {
    label: "API Status",
    value: "Active",
    sub: "+0.2% uptime",
    icon: Settings,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    label: "Database Health",
    value: "98% Health",
    sub: "Optimal Load",
    icon: Database,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    label: "AI Service Status",
    value: "Online",
    sub: "Stable Latency",
    icon: Bot,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
];

type ActionType = "Delete Post" | "Update Reputation" | "User Login" | "System Update" | "Cache Purge";

const actionColors: Record<ActionType, string> = {
  "Delete Post": "bg-red-500/20 text-red-400",
  "Update Reputation": "bg-amber-500/20 text-amber-400",
  "User Login": "bg-slate-500/20 text-slate-300",
  "System Update": "bg-blue-500/20 text-blue-400",
  "Cache Purge": "bg-primary/20 text-primary",
};

const auditTrail = [
  { timestamp: "2023-10-27 14:22:01", actor: "Admin_User_01", actorInitials: "AU", action: "Delete Post" as ActionType, details: "Removed flagged content ID #8821" },
  { timestamp: "2023-10-27 14:15:30", actor: "System_Bot", actorInitials: "SB", action: "Update Reputation" as ActionType, details: "Recalculated scores for top 100 users" },
  { timestamp: "2023-10-27 13:58:12", actor: "Moderator_X", actorInitials: "MX", action: "User Login" as ActionType, details: "Successful login from verified IP" },
  { timestamp: "2023-10-27 13:45:00", actor: "Dev_Lead", actorInitials: "DL", action: "System Update" as ActionType, details: "Patch v2.4.1 deployed to production" },
  { timestamp: "2023-10-27 13:12:44", actor: "System_Bot", actorInitials: "SB", action: "Cache Purge" as ActionType, details: "Global CDN cache invalidated" },
];

export default function SystemLogsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
          System Logs
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time audit trail and system health monitoring
        </p>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {healthCards.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-card rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-primary font-semibold">{sub}</p>
          </div>
        ))}
      </div>

      {/* Audit Trail */}
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">System Audit Trail</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 text-slate-300 rounded-xl gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-primary tracking-wider">
                <th className="pb-3 pr-4 font-bold">Timestamp</th>
                <th className="pb-3 pr-4 font-bold">Actor</th>
                <th className="pb-3 pr-4 font-bold">Action Type</th>
                <th className="pb-3 font-bold">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0">
                  <td className="py-5 pr-4 text-sm text-slate-400 font-mono">{row.timestamp}</td>
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {row.actorInitials}
                      </span>
                      <span className="text-sm text-white font-medium">{row.actor}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    <span className={cn("px-3 py-1 rounded-md text-xs font-bold", actionColors[row.action])}>
                      {row.action}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-slate-400">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <p className="text-sm text-slate-500">Showing 5 of 1,284 entries</p>
          <div className="flex items-center gap-1">
            <button type="button" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5" aria-label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium",
                  p === 1
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {p}
              </button>
            ))}
            <button type="button" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5" aria-label="Next">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
