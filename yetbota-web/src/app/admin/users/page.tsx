"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  UserPlus,
  Users as UsersIcon,
  BadgeCheck,
  Ban,
  RotateCcw,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  SectionCard,
  AdminPagination,
  type Tone,
} from "@/components/admin/AdminUI";
import { useListUsersQuery, useUpdateUserByIdMutation } from "@/store/api/authApi";
import { USER_STATUS, isBanned, isInactive } from "@/lib/adminRole";
import { earnedBadges } from "@/lib/badges";
import { tierProgress } from "@/lib/badges";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserPrivate } from "@/types/auth";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { label: "Status: All", value: "" },
  { label: "Active", value: USER_STATUS.ACTIVE },
  { label: "Banned", value: USER_STATUS.BANNED },
  { label: "Inactive", value: USER_STATUS.INACTIVE },
];

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusMeta(status: string): { label: string; tone: Tone } {
  if (isBanned(status)) return { label: "Banned", tone: "red" };
  if (isInactive(status)) return { label: "Inactive", tone: "slate" };
  return { label: "Active", tone: "brand" };
}

const STATUS_PILL: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  slate: "bg-fg-faint/10 text-fg-muted",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function BadgeStack({ slugs }: { slugs?: string[] }) {
  const earned = earnedBadges(slugs);
  if (earned.length === 0) return <span className="text-xs text-fg-faint">None</span>;
  const shown = earned.slice(0, 3);
  const extra = earned.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((b) => (
        <div
          key={b.slug}
          title={b.label}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-brand text-[10px] font-bold text-white"
        >
          {b.label[0]}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-[10px] font-bold text-fg-muted">
          +{extra}
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onChanged }: { user: UserPrivate; onChanged: () => void }) {
  const { toast } = useToast();
  const [updateUser, { isLoading }] = useUpdateUserByIdMutation();
  const banned = isBanned(user.status);
  const meta = statusMeta(user.status);
  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
  const username = user.username.startsWith("@") ? user.username : `@${user.username}`;
  const avatar = user.profile_url ? resolveApiUrl(user.profile_url) : "";
  const { percent } = tierProgress(user.rating);

  async function toggleBan() {
    const nextStatus = banned ? USER_STATUS.ACTIVE : USER_STATUS.BANNED;
    try {
      await updateUser({ id: user.id, body: { status: nextStatus } }).unwrap();
      toast({ title: banned ? "Ban lifted" : "User banned", description: username });
      onChanged();
    } catch (err) {
      toast({ variant: "destructive", title: "Action failed", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <tr className="transition-colors hover:bg-overlay">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-3">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xs font-bold text-fg-muted">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-fg">{username}</span>
            <span className="truncate text-xs text-fg-muted">{name}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-fg-muted">{formatJoinDate(user.created_at)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-fg">{user.rating.toLocaleString()}</span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-3">
            <div
              className={cn("h-full", banned ? "bg-red-500" : "bg-brand")}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <BadgeStack slugs={user.badges} />
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            STATUS_PILL[meta.tone]
          )}
        >
          {meta.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleBan}
            disabled={isLoading}
            title={banned ? "Lift ban" : "Ban user"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40",
              banned
                ? "text-brand hover:bg-brand/10"
                : "text-fg-muted hover:bg-red-500/10 hover:text-red-500"
            )}
          >
            {banned ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            {banned ? "Unban" : "Ban"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box; reset to page 1 whenever the term settles.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, refetch } = useListUsersQuery({
    limit: PAGE_SIZE,
    page,
    username: search || undefined,
    status: status || undefined,
  });

  // Stable counts independent of the active filters.
  const { data: totalData } = useListUsersQuery({ limit: 1 });
  const { data: bannedData, refetch: refetchBanned } = useListUsersQuery({
    limit: 1,
    status: USER_STATUS.BANNED,
  });

  // updateUserById only invalidates the id-specific User tag, so the list and
  // banned count (which provide the general tag) need an explicit refetch.
  function handleUserChanged() {
    refetch();
    refetchBanned();
  }

  const users = data?.users ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const stats = useMemo(
    () => [
      {
        label: "Total Registered Users",
        value: totalData ? totalData.pagination.total.toLocaleString() : "—",
        icon: UsersIcon,
        iconTone: "brand" as Tone,
      },
      { label: "Newly Joined Today", value: "145", delta: "+5%", deltaTone: "brand" as Tone, icon: UserPlus, iconTone: "brand" as Tone },
      { label: "High Reputation Users", value: "3,421", icon: BadgeCheck, iconTone: "blue" as Tone },
      {
        label: "Banned Users",
        value: bannedData ? bannedData.pagination.total.toLocaleString() : "—",
        icon: Ban,
        iconTone: "red" as Tone,
      },
    ],
    [totalData, bannedData]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        subtitle="Manage and monitor your community members' activity and status."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username..."
            className="w-full rounded-xl border border-border-subtle bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-fg-faint focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            toast({
              title: "Not available yet",
              description: "Admin user creation isn't wired to the backend.",
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Table */}
      <SectionCard bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Reputation</th>
                <th className="px-6 py-4">Badges</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading || (isFetching && users.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-fg-muted">
                    Loading users…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-red-500">
                    Couldn&apos;t load users. Please try again.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-fg-muted">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => <UserRow key={u.id} user={u} onChanged={handleUserChanged} />)
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          label={`Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()} users`}
        />
      </SectionCard>
    </div>
  );
}
