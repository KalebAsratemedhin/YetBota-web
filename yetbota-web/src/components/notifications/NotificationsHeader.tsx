"use client";

import { CheckCheck } from "lucide-react";
import {
  NOTIFICATION_FILTERS,
  type NotificationFilter,
} from "@/lib/notificationsMockData";
import { cn } from "@/lib/utils";

export default function NotificationsHeader({
  active,
  onChange,
  onMarkAllRead,
  hasUnread,
}: {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  onMarkAllRead: () => void;
  hasUnread: boolean;
}) {
  return (
    <header className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-fg tracking-tight">Notifications</h1>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasUnread}
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors shrink-0 pt-2",
            hasUnread
              ? "text-fg-muted hover:text-fg"
              : "text-fg-faint cursor-default"
          )}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NOTIFICATION_FILTERS.map((filter) => {
          const isActive = filter === active;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onChange(filter)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all shrink-0",
                isActive
                  ? "bg-brand text-black font-semibold hover:brightness-110"
                  : "bg-surface-2 text-fg border border-border-subtle hover:bg-overlay"
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </header>
  );
}
