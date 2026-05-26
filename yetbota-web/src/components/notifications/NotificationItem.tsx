"use client";

import { Bell, Star, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

// `sent_at` is an absolute timestamp; formatting it (vs. a "2h ago" relative
// label) keeps render pure — no read of the current clock.
function formatSentAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function NotificationItem({
  notification,
  busy = false,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  busy?: boolean;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const read = Boolean(notification.read_at);
  const isBadge = notification.data?.type === "badge";

  return (
    <article
      className={cn(
        "relative flex gap-4 px-5 py-4 rounded-2xl border transition-colors",
        read ? "bg-surface border-border-subtle" : "bg-brand/5 border-brand/20"
      )}
    >
      <div className="shrink-0 pt-0.5">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isBadge ? "bg-amber-500/20" : "bg-brand/20"
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              isBadge ? "bg-amber-500" : "bg-brand"
            )}
          >
            {isBadge ? (
              <Star className="w-4 h-4 text-white fill-white" />
            ) : (
              <Bell className="w-4 h-4 text-black" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg leading-relaxed">{notification.title}</p>
        {notification.body ? (
          <p className="mt-1 text-sm text-fg-muted leading-relaxed">{notification.body}</p>
        ) : null}
        <p className="mt-2 text-xs text-fg-faint">{formatSentAt(notification.sent_at)}</p>
      </div>

      <div className="shrink-0 flex items-start gap-1">
        {!read && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onMarkRead(notification.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-faint hover:text-fg hover:bg-overlay transition-colors disabled:opacity-50"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(notification.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-faint hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          aria-label="Delete notification"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
