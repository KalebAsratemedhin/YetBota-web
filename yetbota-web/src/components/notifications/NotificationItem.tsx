"use client";

import Image from "next/image";
import { Heart, MessageCircle, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/notificationsMockData";

export default function NotificationItem({
  notification,
}: {
  notification: AppNotification;
}) {
  const { read, category, timeLabel } = notification;

  return (
    <article
      className={cn(
        "relative flex gap-4 px-5 py-4 rounded-2xl transition-colors",
        !read && "bg-brand/5 border-l-4 border-brand"
      )}
    >
      <div className="shrink-0 pt-0.5">
        {notification.kind === "achievement" ? (
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        ) : notification.kind === "community" ? (
          <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
              <MapPin className="w-4 h-4 text-black" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-2 border border-border-subtle">
              <Image
                src={notification.avatarUrl}
                alt=""
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-bg flex items-center justify-center",
                notification.kind === "social_like" ? "bg-red-500" : "bg-blue-500"
              )}
            >
              {notification.kind === "social_like" ? (
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              ) : (
                <MessageCircle className="w-2.5 h-2.5 text-white fill-white" />
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {notification.kind === "social_like" && (
          <p className="text-sm text-fg leading-relaxed">
            <span className="font-semibold">{notification.username}</span>{" "}
            {notification.body}{" "}
            <span className="text-brand font-medium">{notification.highlight}</span>
          </p>
        )}

        {notification.kind === "qa_reply" && (
          <>
            <p className="text-sm text-fg leading-relaxed">
              <span className="font-semibold">{notification.username}</span> replied to your
              question:
            </p>
            <blockquote className="mt-3 px-4 py-3 rounded-xl bg-surface-2 border border-border-subtle text-sm text-fg-muted italic">
              &ldquo;{notification.quote}&rdquo;
            </blockquote>
          </>
        )}

        {notification.kind === "achievement" && (
          <>
            <p className="text-sm text-fg leading-relaxed">
              <span className="font-semibold">Achievement Unlocked!</span> You&apos;ve earned the{" "}
              <span className="text-brand font-medium underline underline-offset-2">
                {notification.badgeName}
              </span>{" "}
              badge.
            </p>
            <p className="mt-1 text-sm text-fg-muted">{notification.subtext}</p>
          </>
        )}

        {notification.kind === "community" && (
          <p className="text-sm text-fg leading-relaxed">
            {notification.body}{" "}
            <span className="font-semibold text-brand">{notification.highlight}</span> is now open!
          </p>
        )}

        <p className="mt-2 text-xs text-fg-muted">
          {category} • {timeLabel}
        </p>
      </div>

      {!read && (
        <span
          className="absolute top-5 right-4 w-2 h-2 rounded-full bg-brand shrink-0"
          aria-label="Unread"
        />
      )}
    </article>
  );
}
