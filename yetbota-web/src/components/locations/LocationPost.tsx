"use client";

import Image from "next/image";
import Link from "next/link";
import { ThumbsDown, ThumbsUp, MessageCircle, MessageSquareText, Bookmark } from "lucide-react";

export interface LocationPostAuthor {
  id?: string;
  name: string;
  avatarUrl: string;
  badge: string;
  meta: string;
}

export default function LocationPost({
  author,
  title,
  body,
  tags,
  likes,
  dislikes,
  comments,
  qaCount,
  activeTab,
  onTabChange,
  showFollow = true,
  following = false,
  followLoading,
  onToggleFollow,
  vote,
  onVote,
  voting,
  canVote = true,
  saved = false,
  onToggleSave,
  saveLoading,
}: {
  author: LocationPostAuthor;
  title: string;
  body: string;
  tags: string[];
  likes: number;
  dislikes?: number;
  comments: number;
  qaCount?: number;
  activeTab?: "comments" | "qa";
  onTabChange?: (tab: "comments" | "qa") => void;
  showFollow?: boolean;
  following?: boolean;
  followLoading?: boolean;
  onToggleFollow?: () => void;
  vote?: "like" | "dislike" | null;
  onVote?: (next: "like" | "dislike") => void;
  voting?: boolean;
  canVote?: boolean;
  saved?: boolean;
  onToggleSave?: () => void;
  saveLoading?: boolean;
}) {
  const safeDislikes = typeof dislikes === "number" && Number.isFinite(dislikes) ? dislikes : 0;
  const safeQaCount = typeof qaCount === "number" && Number.isFinite(qaCount) ? qaCount : 0;
  const profileHref = author.id ? `/users/${author.id}` : null;

  return (
    <article className="px-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {profileHref ? (
            <Link
              href={profileHref}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              aria-label={`View ${author.name}'s profile`}
            >
              <Image
                alt={author.name}
                src={author.avatarUrl}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand">
              <Image
                alt={author.name}
                src={author.avatarUrl}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="font-bold text-lg hover:text-brand hover:underline transition-colors"
                >
                  {author.name}
                </Link>
              ) : (
                <h3 className="font-bold text-lg">{author.name}</h3>
              )}
              <span className="bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {author.badge}
              </span>
            </div>
            <p className="text-sm text-fg-faint dark:text-slate-400">{author.meta}</p>
          </div>
        </div>
        {showFollow ? (
          <button
            type="button"
            onClick={onToggleFollow}
            disabled={followLoading}
            className={
              "px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-60 " +
              (following
                ? "bg-slate-100 dark:bg-surface text-slate-900 dark:text-fg border border-slate-200 dark:border-border-subtle hover:bg-slate-200 dark:hover:bg-surface-2"
                : "bg-brand text-white hover:bg-brand/90")
            }
          >
            {followLoading ? "…" : following ? "Following" : "Follow"}
          </button>
        ) : null}
      </div>

      <h1 className="text-3xl font-extrabold mb-4">{title}</h1>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-lg">
        {body}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((t) => (
          <span
            key={t}
            className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-sm font-medium border border-brand/20"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 py-4 border-y border-slate-200 dark:border-border-subtle">
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-surface px-4 py-2 rounded-full">
          <button
            type="button"
            aria-pressed={vote === "like"}
            onClick={() => onVote?.("like")}
            disabled={voting || !canVote}
            className={
              "flex items-center gap-1.5 font-bold transition-colors " +
              (vote === "like" ? "text-brand" : "text-fg-faint dark:text-slate-300 hover:text-brand")
            }
          >
            <ThumbsUp className="w-5 h-5" />
            <span>{likes}</span>
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <button
            type="button"
            aria-label="Dislike"
            aria-pressed={vote === "dislike"}
            onClick={() => onVote?.("dislike")}
            disabled={voting || !canVote}
            className={
              "flex items-center gap-1.5 font-bold transition-colors " +
              (vote === "dislike"
                ? "text-brand"
                : "text-fg-muted hover:text-fg")
            }
          >
            <ThumbsDown className="w-5 h-5" />
            <span>{safeDislikes}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onTabChange?.("comments")}
            aria-current={activeTab === "comments"}
            aria-controls="comments"
            className={
              "flex items-center gap-2 transition-colors " +
              (activeTab === "comments"
                ? "text-brand"
                : "text-fg-faint hover:text-slate-900 dark:text-slate-400 dark:hover:text-fg")
            }
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">{comments}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.("qa")}
            aria-current={activeTab === "qa"}
            aria-controls="community-qa"
            className={
              "flex items-center gap-2 transition-colors " +
              (activeTab === "qa"
                ? "text-brand"
                : "text-fg-faint hover:text-slate-900 dark:text-slate-400 dark:hover:text-fg")
            }
            aria-label="Community QA"
          >
            <MessageSquareText className="w-5 h-5" />
            <span className="font-bold">{safeQaCount}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          disabled={saveLoading}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark"}
          className={
            "ml-auto transition-colors disabled:opacity-60 " +
            (saved ? "text-brand" : "text-fg-faint dark:text-slate-400 hover:text-brand")
          }
        >
          <Bookmark className={"w-5 h-5 " + (saved ? "fill-brand" : "")} />
        </button>
      </div>
    </article>
  );
}

