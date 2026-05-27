"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import type { Post } from "@/types/content";
import { useGetUserByIdQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

function approxTimeLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(d);
}

export default function QaApiPostCard({ post }: { post: Post }) {
  // GET /v1/users/{id} is a public profile read, so the author loads for
  // anonymous viewers too — no auth gate.
  const { data: authorRes } = useGetUserByIdQuery(
    { id: post.user_id, resolution: "WEB" },
    { skip: !post.user_id }
  );

  const authorName = authorRes?.user
    ? `${authorRes.user.first_name} ${authorRes.user.last_name}`.trim() || authorRes.user.username
    : "Anonymous";
  const authorAvatarUrl = authorRes?.user?.profile_url
    ? resolveApiUrl(authorRes.user.profile_url)
    : null;
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const locationLabel = post.address?.trim() || "Ethiopia";
  const timeLabel = approxTimeLabel(post.created_at);
  const locationAndTime = timeLabel ? `${locationLabel} • ${timeLabel}` : locationLabel;
  const photoUrl = post.photos?.[0]?.photo_url ? resolveApiUrl(post.photos[0].photo_url) : null;
  const upvotes = typeof post.likes === "number" ? post.likes : 0;
  const commentCount = typeof post.comments === "number" ? post.comments : 0;

  return (
    <Link
      href={`/qa/${post.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl"
    >
      <article className="bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-2xl p-4 sm:p-6 transition-transform hover:border-brand/30 hover:-translate-y-px cursor-pointer">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex gap-3 sm:gap-4 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-surface-2 ring-2 ring-brand/20 shrink-0 flex items-center justify-center">
              {authorAvatarUrl ? (
                <Image
                  src={authorAvatarUrl}
                  alt={authorName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-xs font-bold text-fg-muted">{initials || "?"}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-lg text-fg truncate">{authorName}</h3>
              </div>
              <p className="text-xs sm:text-sm text-fg-faint dark:text-slate-400 truncate">{locationAndTime}</p>
            </div>
          </div>
          <button
            type="button"
            className="text-fg-muted hover:text-brand transition-colors shrink-0 -mr-1 p-1"
            aria-label="More"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-xl font-bold leading-tight text-fg">{post.title}</h2>
          {post.description ? (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {post.description}
            </p>
          ) : null}

          {photoUrl ? (
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-border-subtle">
              <Image
                src={photoUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}

          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 bg-overlay text-fg-faint dark:text-slate-400 text-xs font-bold rounded-md uppercase tracking-wide"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center bg-overlay rounded-full px-1 py-1">
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-overlay-strong transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-brand text-sm sm:text-base">{upvotes}</span>
            </button>
            <div className="w-px h-5 sm:h-6 bg-border-subtle mx-1" />
            <button
              type="button"
              className="flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-overlay-strong transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 sm:gap-2 text-fg-faint">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">{commentCount}</span>
            </span>
            <button
              type="button"
              className="flex items-center gap-2 text-fg-faint hover:text-brand transition-colors"
              aria-label="Share"
              onClick={(e) => e.preventDefault()}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
