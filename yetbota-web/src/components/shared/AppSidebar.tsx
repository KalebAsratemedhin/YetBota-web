"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, Compass, Bell, MessageSquare, Sparkles, User, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarUser {
  name: string;
  role: string;
  level?: number;
  avatarUrl?: string;
}

interface AppSidebarProps {
  user: SidebarUser;
  /** Optional page-specific content below nav */
  children?: React.ReactNode;
  title?: string;
  className?: string;
  onNavigate?: () => void;
}

export const NAV_ITEMS = [
  { id: "home",      label: "Home",         icon: Home,          href: "/"          },
  { id: "discover",  label: "Discover",     icon: Compass,       href: "/discovery" },
  { id: "notifications", label: "Notifications", icon: Bell,    href: "/notifications" },
  { id: "qa",        label: "QA Feed",      icon: MessageSquare, href: "/qa"        },
  { id: "assistant", label: "AI Assistant", icon: Sparkles,      href: "/assistant" },
  { id: "profile",   label: "Profile",      icon: User,          href: "/profile"   },
];

export default function AppSidebar({ user, children, title = "Yet Bota", className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 bg-surface border-r border-border-subtle flex flex-col h-full",
        "shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
    >

      {/* Logo */}
      <div className="px-6 py-5 border-b border-border-subtle flex items-center gap-2.5 shrink-0">
        <Image
                      src="/images/logo.jpg"
                      alt="Yet Bota"
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
        <span className="text-fg font-bold text-sm">{title}</span>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 shrink-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-brand/15 text-brand"
                  : "text-fg-muted hover:text-fg hover:bg-overlay"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Page-specific slot */}
      {children && (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {children}
        </div>
      )}

      {!children && <div className="flex-1" />}

      {/* User footer */}
      <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between gap-2 shrink-0">
        <Link href="/profile" className="flex items-center gap-2 min-w-0 group">
          <div className="w-7 h-7 rounded-full bg-brand overflow-hidden flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <Image alt="" src={user.avatarUrl} width={28} height={28} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-black text-[10px] font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-fg text-xs font-semibold truncate group-hover:text-brand transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-fg-muted truncate">
              {user.level ? `Level ${user.level}` : user.role}
            </p>
          </div>
        </Link>
        <button type="button" className="shrink-0 hover:bg-overlay p-1 rounded-lg transition-colors">
          <Settings className="w-3.5 h-3.5 text-fg-muted" />
        </button>
      </div>
    </aside>
  );
}