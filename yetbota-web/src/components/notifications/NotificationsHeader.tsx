"use client";

import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsHeader({
  onMarkAllRead,
  hasUnread,
}: {
  onMarkAllRead: () => void;
  hasUnread: boolean;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
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
    </header>
  );
}
