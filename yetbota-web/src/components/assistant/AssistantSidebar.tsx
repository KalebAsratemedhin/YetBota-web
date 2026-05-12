"use client";
import Link from "next/link";
import Image from "next/image";
import { Home, Compass, MessageSquare, User, Settings, Sparkles } from "lucide-react";
import { RECENT_CHATS, SUGGESTED_TOPICS, type RecentChat } from "@/lib/assistantMockData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeChat: string;
  onSelectChat: (id: string) => void;
  user: { name: string; role: string };
}

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: Home,          href: "/"           },
  { id: "discover", label: "Discover", icon: Compass,       href: "/explore"    },
  { id: "qa",        label: "QA Feed",      icon: MessageSquare, href: "/qa"         },
  { id: "ai",       label: "AI Assistant",  icon: Sparkles, href: "/assistant"  },
  { id: "profile",  label: "Profile",  icon: User,          href: "/profile"    },
];

export default function AssistantSidebar({ activeChat, onSelectChat, user }: SidebarProps) {
  return (
    <aside className="w-57.5 shrink-0 bg-bg border-r border-brand/20 flex flex-col h-full shadow-[4px_0_16px_-8px_rgba(15,23,42,0.08)] dark:shadow-none">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2.5">
        <Image
                      src="/images/logo.jpg"
                      alt="Yet Bota"
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
        <span className="text-fg font-bold text-sm leading-tight">Yet Bota AI</span>
      </div>

      {/* Nav items */}
      <nav className="px-3 py-4 border-b border-border-subtle">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/assistant";
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
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

      {/* Recent chats */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint px-3 mb-2">
          Recent Chats
        </p>
        <div className="space-y-0.5">
          {RECENT_CHATS.map((chat: RecentChat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-colors",
                activeChat === chat.id
                  ? "bg-brand/10 text-fg border border-brand/20"
                  : "text-fg-muted hover:text-fg hover:bg-overlay"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-sm shrink-0",
                activeChat === chat.id ? "bg-brand" : "bg-fg-faint"
              )} />
              <span className="truncate text-xs">{chat.title}</span>
            </button>
          ))}
        </div>

        {/* Suggested topics */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint px-3 mt-5 mb-2">
          Suggested Topics
        </p>
        <div className="flex flex-wrap gap-1.5 px-1">
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic.id}
              className="text-[10px] text-fg-muted hover:text-brand bg-overlay hover:bg-brand/10 border border-border-subtle hover:border-brand/30 px-2.5 py-1 rounded-full transition-colors"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* User profile footer */}
      <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-bold">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-fg text-xs font-semibold leading-tight">{user.name}</p>
            <p className="text-[10px] text-fg-muted uppercase tracking-wide">{user.role}</p>
          </div>
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-overlay transition-colors">
          <Settings className="w-3.5 h-3.5 text-fg-muted" />
        </button>
      </div>
    </aside>
  );
}