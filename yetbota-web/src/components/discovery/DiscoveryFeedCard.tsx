"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bookmark, Flag, Heart, Link2, Map, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";
import type { DiscoveryFeedItem } from "@/lib/discoveryMockData";
import { buildShareTargets } from "@/lib/share";
import ReportDialog from "@/components/common/ReportDialog";
import { useToast } from "@/hooks/use-toast";

interface DiscoveryFeedCardProps {
  item: DiscoveryFeedItem;
  // Controlled bookmark state + handler (wired by DiscoveryPostCard).
  saved?: boolean;
  onToggleSave?: () => void;
  saveLoading?: boolean;
  // Permalink path for the post, used to build absolute share links.
  sharePath?: string;
  // When set, the More menu shows a working Report item (signed in, not own post).
  reportContentId?: string;
}

export default function DiscoveryFeedCard({
  item,
  saved,
  onToggleSave,
  saveLoading,
  sharePath,
  reportContentId,
}: DiscoveryFeedCardProps) {
  const { toast } = useToast();
  const [openMenu, setOpenMenu] = useState<"share" | "more" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const isSaved = saved ?? item.bookmarked ?? false;
  const shareTitle = item.body?.trim() ? item.body.slice(0, 80) : "YetBota";

  useEffect(() => {
    if (!openMenu) return;
    function onDocClick(e: MouseEvent) {
      const ref = openMenu === "share" ? shareRef.current : moreRef.current;
      if (ref && !ref.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  function shareUrl(): string {
    if (typeof window === "undefined") return "";
    return sharePath ? `${window.location.origin}${sharePath}` : window.location.href;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      toast({ title: "Link copied", description: "The link is on your clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't copy the link" });
    }
    setOpenMenu(null);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: shareTitle, url: shareUrl() });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
    setOpenMenu(null);
  }

  const menuItemClass =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-fg hover:bg-overlay transition-colors text-left disabled:opacity-60";

  return (
    <article className="bg-white dark:bg-surface rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-slate-200 dark:border-white/5">
      <div className="p-5 flex items-center justify-between">
        {item.author.href ? (
          <Link
            href={item.author.href}
            className="flex items-center gap-2 min-w-0 rounded-full p-2 pr-4 hover:bg-slate-100 dark:hover:bg-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            aria-label={`View ${item.author.name}'s profile`}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
              <Image src={item.author.avatarUrl} alt={item.author.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate">{item.author.name}</h4>
              <p className="text-sm text-brand flex items-center gap-1 truncate">

                {item.author.locationLabel}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
              <Image src={item.author.avatarUrl} alt={item.author.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate">{item.author.name}</h4>
              <p className="text-sm text-brand flex items-center gap-1 truncate">
                <span className="text-[10px]">●</span>
                {item.author.locationLabel}
              </p>
            </div>
          </div>
        )}

        {/* More menu (bookmark + report) */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
            aria-haspopup="menu"
            aria-expanded={openMenu === "more"}
            className="p-2 text-fg-muted hover:text-slate-600 dark:hover:text-fg transition-colors"
            aria-label="More"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {openMenu === "more" ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 py-2 rounded-2xl bg-surface border border-border-subtle shadow-xl z-50 overflow-hidden"
            >
              {onToggleSave ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onToggleSave();
                    setOpenMenu(null);
                  }}
                  disabled={saveLoading}
                  className={menuItemClass}
                >
                  <Bookmark className={"w-4 h-4 " + (isSaved ? "fill-brand text-brand" : "text-fg-muted")} />
                  {isSaved ? "Remove bookmark" : "Save"}
                </button>
              ) : null}
              {reportContentId ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenu(null);
                    setReportOpen(true);
                  }}
                  className={menuItemClass}
                >
                  <Flag className="w-4 h-4 text-fg-muted" />
                  Report
                </button>
              ) : null}
              {!onToggleSave && !reportContentId ? (
                <p className="px-4 py-2.5 text-sm text-fg-muted">Sign in for more actions</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative px-4">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-overlay">
          <Link
            href={`/locations/${item.id}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <Image
              src={item.imageUrl}
              alt=""
              width={1200}
              height={900}
              className="w-full h-[500px] object-contain"
              priority={false}
            />
          </Link>
          {item.badgeLabel && (
            <span className="pointer-events-none absolute top-6 left-6 px-3 py-1 bg-brand text-white text-[10px] font-bold tracking-widest rounded-lg uppercase shadow-lg">
              {item.badgeLabel}
            </span>
          )}
          {item.mapHref ? (
            <Link
              href={item.mapHref}
              className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Map className="w-4 h-4 text-brand" />
              {item.showOnMapLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className={[
                "flex items-center gap-2 transition-colors",
                item.liked ? "text-brand" : "text-slate-600 dark:text-slate-400 hover:text-red-500",
              ].join(" ")}
            >
              <Heart className={`w-5 h-5 ${item.liked ? "fill-brand" : ""}`} />
              <span className="text-sm font-semibold">{item.likes}</span>
            </button>
            <Link
              href={`/locations/${item.id}`}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{item.comments}</span>
            </Link>

            {/* Share menu */}
            <div className="relative" ref={shareRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((m) => (m === "share" ? null : "share"))}
                aria-haspopup="menu"
                aria-expanded={openMenu === "share"}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {openMenu === "share" ? (
                <div
                  role="menu"
                  className="absolute bottom-full left-0 mb-2 w-60 py-2 rounded-2xl bg-surface border border-border-subtle shadow-xl z-50 overflow-hidden"
                >
                  <button type="button" role="menuitem" onClick={() => void copyLink()} className={menuItemClass}>
                    <Link2 className="w-4 h-4 text-fg-muted" />
                    Copy link
                  </button>
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                    <button type="button" role="menuitem" onClick={() => void nativeShare()} className={menuItemClass}>
                      <Send className="w-4 h-4 text-fg-muted" />
                      Share via…
                    </button>
                  ) : null}
                  <div className="my-1 border-t border-border-subtle" />
                  {buildShareTargets(shareUrl(), shareTitle).map((target) => (
                    <a
                      key={target.id}
                      role="menuitem"
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpenMenu(null)}
                      className={menuItemClass}
                    >
                      {target.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleSave?.()}
            disabled={!onToggleSave || saveLoading}
            className={[
              "transition-colors disabled:opacity-60",
              isSaved ? "text-brand" : "text-slate-600 dark:text-slate-400 hover:text-brand",
            ].join(" ")}
            aria-label={isSaved ? "Remove bookmark" : "Save"}
            aria-pressed={isSaved}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-brand" : ""}`} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.body}</p>
          <div className="flex flex-wrap gap-3">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-bold text-brand opacity-80 hover:opacity-100 cursor-pointer"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {reportContentId ? (
        <ReportDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          contentType="POST"
          contentId={reportContentId}
          contentLabel="post"
        />
      ) : null}
    </article>
  );
}
