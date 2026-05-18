"use client";

import { useMemo, useState } from "react";
import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import NotificationItem from "@/components/notifications/NotificationItem";
import {
  MOCK_NOTIFICATIONS,
  filterNotifications,
  type AppNotification,
  type NotificationFilter,
} from "@/lib/notificationsMockData";

const GROUP_ORDER = ["TODAY", "YESTERDAY"] as const;

function groupByDate(items: AppNotification[]) {
  return GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((n) => n.group === group),
  })).filter((g) => g.items.length > 0);
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filtered = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [notifications, activeFilter]
  );

  const groups = useMemo(() => groupByDate(filtered), [filtered]);
  const hasUnread = notifications.some((n) => !n.read);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex justify-center min-h-full">
      <main className="w-full max-w-3xl px-4 sm:px-6 py-8 lg:py-10">
        <NotificationsHeader
          active={activeFilter}
          onChange={setActiveFilter}
          onMarkAllRead={markAllRead}
          hasUnread={hasUnread}
        />

        <div className="mt-8 space-y-8">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-overlay px-6 py-10 text-center text-sm text-fg-muted">
              No notifications in this category yet.
            </div>
          ) : (
            groups.map(({ group, items }) => (
              <section key={group}>
                <h2 className="text-[11px] font-semibold tracking-widest text-fg-muted uppercase mb-3 px-1">
                  {group}
                </h2>
                <div className="space-y-1">
                  {items.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
