"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, Home, Compass, Bell, MessageSquare, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/shared/UserMenu";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocPointerDown(e: PointerEvent) {
      const el = menuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
      <div className="relative px-3 py-4 border-t border-border-subtle shrink-0" ref={menuRef}>
        {menuOpen && (
          <UserMenu
            className="absolute bottom-full left-3 right-3 mb-2"
            onClose={() => {
              setMenuOpen(false);
              onNavigate?.();
            }}
          />
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="w-full flex items-center gap-2 min-w-0 px-2 py-1.5 rounded-xl hover:bg-overlay transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-brand overflow-hidden flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <Image alt="" src={user.avatarUrl} width={28} height={28} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-black text-[10px] font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-fg text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-fg-muted truncate">
              {user.level ? `Level ${user.level}` : user.role}
            </p>
          </div>
          <ChevronUp
            className={cn(
              "w-4 h-4 text-fg-muted shrink-0 ml-auto transition-transform",
              menuOpen ? "" : "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}