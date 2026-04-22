import {
  Users,
  UserPlus,
  Star,
  Ban,
  Search,
  Filter,
  Plus,
  Pencil,
  EyeOff,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Registered Users", value: "12,840", change: "+12%", icon: Users, iconBg: "bg-primary/20" },
  { label: "Newly Joined Today", value: "145", change: "+5%", icon: UserPlus, iconBg: "bg-blue-500/20" },
  { label: "High Reputation Users", value: "3,421", tag: "Active", icon: Star, iconBg: "bg-primary/20" },
  { label: "Banned Users", value: "82", tagGlobal: "Global", icon: Ban, iconBg: "bg-slate-700" },
];

const statusColors: Record<string, string> = {
  Active: "bg-primary/20 text-primary",
  Inactive: "bg-slate-500/20 text-slate-400",
  Banned: "bg-red-500/20 text-red-400",
};

const users = [
  {
    username: "@felix_dev",
    email: "felix@example.com",
    avatar: "FD",
    joinDate: "Oct 12, 2023",
    reputation: 4820,
    repPercent: 96,
    badges: ["G", "G"],
    badgeExtra: "+4",
    status: "Active",
  },
  {
    username: "@luna_stars",
    email: "luna@space.io",
    avatar: "LS",
    joinDate: "Jan 05, 2024",
    reputation: 1240,
    repPercent: 25,
    badges: ["S"],
    badgeExtra: "+1",
    status: "Inactive",
  },
  {
    username: "@troll_king",
    email: "banned@user.net",
    avatar: "TK",
    joinDate: "Feb 11, 2024",
    reputation: 12,
    repPercent: 1,
    badges: [],
    badgeExtra: "",
    status: "Banned",
  },
  {
    username: "@aria_nova",
    email: "aria.n@tech.com",
    avatar: "AN",
    joinDate: "Today, 08:34",
    reputation: 150,
    repPercent: 3,
    badges: ["N"],
    badgeExtra: "",
    status: "Active",
  },
];

export default function UsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
          User Management
        </h1>
        <p className="text-slate-500 mt-1">
          Manage and monitor your community members&apos; activity and status.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, tag, tagGlobal, icon: Icon, iconBg }) => (
          <div key={label} className="bg-card rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              {change && <span className="text-sm text-primary font-semibold">{change}</span>}
              {tag && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {tag}
                </span>
              )}
              {tagGlobal && (
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
                  {tagGlobal}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by username or email..."
              className="pl-9 bg-background border-white/10 rounded-xl"
            />
          </div>
          <Button variant="outline" className="border-white/10 text-slate-300 rounded-xl gap-2">
            <Filter className="w-4 h-4" />
            Status: All
          </Button>
          <Button variant="outline" className="border-white/10 text-slate-300 rounded-xl gap-2">
            <Star className="w-4 h-4" />
            Reputation: High
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-slate-500 tracking-wider">
                <th className="pb-3 pr-4 font-bold">User</th>
                <th className="pb-3 pr-4 font-bold">Join Date</th>
                <th className="pb-3 pr-4 font-bold">Reputation</th>
                <th className="pb-3 pr-4 font-bold">Badges</th>
                <th className="pb-3 pr-4 font-bold">Status</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username} className="border-b border-white/5 last:border-0">
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{u.username}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-4 text-sm text-slate-400">{u.joinDate}</td>
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{u.reputation.toLocaleString()}</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${u.repPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    {u.badges.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {u.badges.map((b, i) => (
                          <span
                            key={i}
                            className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary"
                          >
                            {b}
                          </span>
                        ))}
                        {u.badgeExtra && (
                          <span className="text-xs text-slate-500 ml-1">{u.badgeExtra}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-600">None</span>
                    )}
                  </td>
                  <td className="py-5 pr-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold",
                        statusColors[u.status]
                      )}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10" aria-label="Suspend">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10" aria-label="View">
                        <Eye className="w-4 h-4" />
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
          <p className="text-sm text-slate-500">
            Showing 1 - 10 of <span className="text-primary font-semibold">12,840</span> users
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="border-white/10 text-slate-400 rounded-lg">
              Previous
            </Button>
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
            <Button variant="outline" size="sm" className="border-white/10 text-slate-400 rounded-lg">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
