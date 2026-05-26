"use client";

import { useState } from "react";
import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import NotificationItem from "@/components/notifications/NotificationItem";
import PushOptInBanner from "@/components/notifications/PushOptInBanner";
import {
  useDeleteNotificationMutation,
  useListNotificationsQuery,
  useMarkNotificationsReadMutation,
} from "@/store/api/notificationApi";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const PAGE_LIMIT = 50;

export default function NotificationsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();

  const { data, isLoading, isFetching, isError, refetch } = useListNotificationsQuery(
    { page: 1, limit: PAGE_LIMIT },
    { skip: !accessToken }
  );

  const [markRead, { isLoading: markingAll }] = useMarkNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  const notifications = data?.notifications ?? [];
  const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
  const hasUnread = unreadIds.length > 0;

  async function handleMarkAllRead() {
    if (unreadIds.length === 0) return;
    try {
      await markRead({ ids: unreadIds }).unwrap();
    } catch {
      toast({ variant: "destructive", title: "Couldn't mark all as read" });
    }
  }

  async function handleMarkRead(id: string) {
    setBusyId(id);
    try {
      await markRead({ ids: [id] }).unwrap();
    } catch {
      toast({ variant: "destructive", title: "Couldn't mark as read" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteNotification(id).unwrap();
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete notification" });
    } finally {
      setBusyId(null);
    }
  }

  function renderBody() {
    if (!accessToken) {
      return (
        <div className="rounded-2xl border border-border-subtle bg-overlay px-6 py-10 text-center text-sm text-fg-muted">
          <p className="text-fg font-semibold mb-1">Sign in to see your notifications</p>
          <Link href="/signin" className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-border-subtle bg-surface animate-pulse" />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="rounded-2xl border border-border-subtle bg-overlay px-6 py-10 text-center text-sm text-fg-muted">
          Couldn&apos;t load your notifications.{" "}
          <button type="button" className="text-brand font-semibold" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="rounded-2xl border border-border-subtle bg-overlay px-6 py-10 text-center text-sm text-fg-muted">
          <p className="text-fg font-semibold mb-1">You&apos;re all caught up</p>
          <p>We&apos;ll let you know when something happens.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            busy={busyId === notification.id}
            onMarkRead={(id) => void handleMarkRead(id)}
            onDelete={(id) => void handleDelete(id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-full">
      <main className="w-full max-w-3xl px-4 sm:px-6 py-8 lg:py-10">
        <NotificationsHeader
          onMarkAllRead={() => void handleMarkAllRead()}
          hasUnread={hasUnread && !markingAll}
        />

        <div className="mt-8">
          <PushOptInBanner />
          {renderBody()}
        </div>
        {isFetching && !isLoading ? (
          <p className="mt-4 text-center text-xs text-fg-faint">Updating…</p>
        ) : null}
      </main>
    </div>
  );
}
