"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Shield,
  Users,
  Filter,
  Search,
  Bell,
  HelpCircle,
  EyeOff,
  Trash2,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SoftDeleteModal } from "@/components/admin/SoftDeleteModal";

const stats = [
  { label: "Pending Reports", value: "128", change: "+12%", positive: true, icon: AlertTriangle, iconBg: "bg-orange-500/20", iconColor: "text-orange-400" },
  { label: "Actions (24h)", value: "45", change: "-5%", positive: false, icon: Clock, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
  { label: "Avg Resolution Time", value: "14m", change: "-2.4%", positive: true, icon: Clock, iconBg: "bg-amber-500/20", iconColor: "text-amber-400" },
  { label: "Active Mods", value: "12", sub: "Online now", icon: Shield, iconBg: "bg-primary/20", iconColor: "text-primary" },
];

type ReasonTag = "Spam" | "Offensive" | "Incorrect";

const reasonColors: Record<ReasonTag, string> = {
  Spam: "bg-red-500/20 text-red-400",
  Offensive: "bg-amber-500/20 text-amber-400",
  Incorrect: "bg-blue-500/20 text-blue-400",
};

const flaggedContent = [
  { id: "#REP-9482", preview: '"Get free coins now at bit.ly/spam-..."', reason: "Spam" as ReasonTag, priority: "Critical", priorityColor: "text-red-400", reporter: "User_9921" },
  { id: "#REP-9483", preview: '"That player is absolutely [removed..."', reason: "Offensive" as ReasonTag, priority: "High", priorityColor: "text-amber-400", reporter: "Mod_Check" },
  { id: "#REP-9484", preview: '"The stats for the last game are..."', reason: "Incorrect" as ReasonTag, priority: "Low", priorityColor: "text-slate-400", reporter: "Data_Guard" },
  { id: "#REP-9485", preview: '"Join this server for exclusive bot..."', reason: "Spam" as ReasonTag, priority: "High", priorityColor: "text-amber-400", reporter: "System_Bot" },
];

const recentActions = [
  { title: 'User "BotDev_2" Banned', sub: "By Admin User • 2m ago", color: "bg-red-500/20", iconColor: "text-red-400" },
  { title: "Deleted 15 spam messages", sub: "System Auto-Mod • 15m ago", color: "bg-purple-500/20", iconColor: "text-purple-400" },
];

export default function ReportsPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search reports, users, or IDs..."
              className="pl-9 bg-card border-white/10 rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="relative p-2 text-slate-400 hover:text-white" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-slate-400 hover:text-white" aria-label="Help">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, positive, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-card rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {change && (
              <span className={`text-sm font-semibold ${positive ? "text-primary" : "text-red-400"}`}>
                {change}
              </span>
            )}
            {sub && <p className="text-sm text-slate-500">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Flagged Content Table */}
      <div className="bg-card rounded-2xl border border-white/5 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Flagged Content</h2>
            <p className="text-sm text-slate-500">Prioritized moderation queue (Compliance with FR-016)</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 text-slate-300 rounded-xl gap-2">
              Priority: All
              <ChevronRight className="w-4 h-4 rotate-90" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-slate-500 tracking-wider">
                <th className="pb-3 pr-4 font-bold">Report ID</th>
                <th className="pb-3 pr-4 font-bold">Content Preview</th>
                <th className="pb-3 pr-4 font-bold">Reason</th>
                <th className="pb-3 pr-4 font-bold">Priority</th>
                <th className="pb-3 pr-4 font-bold">Reporter</th>
                <th className="pb-3 font-bold">Actions (FR-017)</th>
              </tr>
            </thead>
            <tbody>
              {flaggedContent.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0">
                  <td className="py-5 pr-4">
                    <span className="text-primary font-mono text-sm font-semibold">{row.id}</span>
                  </td>
                  <td className="py-5 pr-4 text-sm text-slate-300 max-w-[200px] truncate">
                    {row.preview}
                  </td>
                  <td className="py-5 pr-4">
                    <span className={cn("px-3 py-1 rounded-md text-xs font-bold", reasonColors[row.reason])}>
                      {row.reason}
                    </span>
                  </td>
                  <td className="py-5 pr-4">
                    <span className="flex items-center gap-2 text-sm">
                      <span className={cn("w-2 h-2 rounded-full", row.priorityColor === "text-red-400" ? "bg-red-400" : row.priorityColor === "text-amber-400" ? "bg-amber-400" : "bg-slate-400")} />
                      <span className={row.priorityColor}>{row.priority}</span>
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-sm text-slate-300">{row.reporter}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" title="Hide" aria-label="Hide content">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                        aria-label="Delete content"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10" title="Ban user" aria-label="Ban user">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <p className="text-sm text-slate-500">Showing 1 to 4 of 128 reports</p>
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

      {/* Recent Mod Actions */}
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Mod Actions</h3>
        <div className="space-y-1">
          {recentActions.map(({ title, sub, color, iconColor }) => (
            <div key={title} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", color)}>
                <Shield className={cn("w-5 h-5", iconColor)} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-500 text-sm">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SoftDeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
