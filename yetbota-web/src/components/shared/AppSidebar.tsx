"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, Compass, MessageSquare, Sparkles, User, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarUser {
  name: string;
  role: string;
  level?: number;
}

interface AppSidebarProps {
  user: SidebarUser;
  /** Optional page-specific content below nav */
  children?: React.ReactNode;
  title?: string;
}

export const NAV_ITEMS = [
  { id: "home",      label: "Home",         icon: Home,          href: "/"          },
  { id: "discover",  label: "Discover",     icon: Compass,       href: "/explore"   },
  { id: "qa",        label: "QA Feed",      icon: MessageSquare, href: "/qa"        },
  { id: "assistant", label: "AI Assistant", icon: Sparkles,      href: "/assistant" },
  { id: "profile",   label: "Profile",      icon: User,          href: "/profile"   },
];

export default function AppSidebar({ user, children, title = "Yet Bota" }: AppSidebarProps) {
  const pathname = usePathname();
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="w-40 shrink-0 bg-[#0d0d0d] border-r border-white/5 flex flex-col h-full">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5 flex items-center gap-2 shrink-0">
        <Image
                      src="/images/logo.jpg"
                      alt="Yet Bota"
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
        <span className="text-white font-bold text-sm">{title}</span>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3 shrink-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-brand/15 text-brand"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
      <div className="px-3 py-3 border-t border-white/5 flex items-center justify-between gap-2 shrink-0">
        <Link href="/profile" className="flex items-center gap-2 min-w-0 group">
          <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center shrink-0">
            <span className="text-black text-[10px] font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate group-hover:text-brand transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {user.level ? `Level ${user.level}` : user.role}
            </p>
          </div>
        </Link>
        <button className="shrink-0 hover:bg-white/5 p-1 rounded-lg transition-colors">
          <Settings className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </aside>
  );
}