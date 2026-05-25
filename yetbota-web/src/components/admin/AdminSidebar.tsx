"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Flag,
  Users,
  Terminal,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAppDispatch } from "@/store/hooks";
import { logoutFromApp } from "@/store/authThunks";

export interface AdminSidebarUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Reports", icon: Flag, href: "/admin/reports" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "System Logs", icon: Terminal, href: "/admin/system-logs" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar({
  user,
  className,
  onNavigate,
}: {
  user: AdminSidebarUser;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, toggle } = useTheme();

  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  function handleLogout() {
    logoutFromApp(dispatch);
    onNavigate?.();
    router.replace("/signin");
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col bg-surface border-r border-border-subtle",
        "shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border-subtle px-6 py-5">
        <Image src="/images/logo.jpg" alt="Yet Bota" width={36} height={36} className="rounded-lg" />
        <div className="flex flex-col leading-none">
          <span className="text-fg text-sm font-bold">Yet Bota</span>
          <span className="text-fg-muted text-xs font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "mb-0.5 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/15 text-brand"
                  : "text-fg-muted hover:bg-overlay hover:text-fg"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-subtle p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-[10px] font-bold text-black">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-fg truncate text-xs font-bold">{user.name}</p>
            <p className="text-fg-muted truncate text-[10px] uppercase tracking-wider">
              {user.role}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="shrink-0 rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
