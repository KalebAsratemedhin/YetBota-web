"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Flag, Link2, MoreHorizontal, Send, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportDialog from "@/components/common/ReportDialog";
import type { ModContentType } from "@/types/moderation";

type ShareTarget = { id: string; label: string; href: string };

function buildShareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { id: "x", label: "X (Twitter)", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { id: "email", label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
}

// Header action cluster shared by the post- and question-detail pages: a Share
// menu (copy link / native share / platform links) and a More menu (bookmark +
// report). The bookmark item only appears when `onToggleSave` is provided.
export default function PostActionMenus({
  shareTitle = "YetBota",
  saved = false,
  onToggleSave,
  saveLoading,
  reportContentId,
  reportContentType = "POST",
  reportLabel = "post",
  canReport = true,
}: {
  shareTitle?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  saveLoading?: boolean;
  // When `reportContentId` is set and `canReport` is true, the More menu shows
  // a working Report item that opens the reporting dialog. Omit on content the
  // user can't report (own content / signed out).
  reportContentId?: string;
  reportContentType?: ModContentType;
  reportLabel?: string;
  canReport?: boolean;
}) {
  const { toast } = useToast();
  const [openMenu, setOpenMenu] = useState<"share" | "more" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const showReport = Boolean(reportContentId) && canReport;

  useEffect(() => {
    if (!openMenu) return;
    function onDocClick(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
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

  function currentUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      toast({ title: "Link copied", description: "The link is on your clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't copy the link" });
    }
    setOpenMenu(null);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: shareTitle, url: currentUrl() });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
    setOpenMenu(null);
  }

  const itemClass =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-fg hover:bg-overlay transition-colors text-left disabled:opacity-60";

  return (
    <div ref={actionsRef} className="flex items-center gap-2">
      {/* Share */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "share" ? null : "share"))}
          aria-haspopup="menu"
          aria-expanded={openMenu === "share"}
          className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        {openMenu === "share" ? (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 py-2 rounded-2xl bg-surface border border-border-subtle shadow-xl z-50 overflow-hidden"
          >
            <button type="button" role="menuitem" onClick={() => void copyLink()} className={itemClass}>
              <Link2 className="w-4 h-4 text-fg-muted" />
              Copy link
            </button>
            {/* The menu only renders after a client click, so reading
                navigator here can't cause a hydration mismatch. */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
              <button type="button" role="menuitem" onClick={() => void nativeShare()} className={itemClass}>
                <Send className="w-4 h-4 text-fg-muted" />
                Share via…
              </button>
            ) : null}
            <div className="my-1 border-t border-border-subtle" />
            {buildShareTargets(currentUrl(), shareTitle).map((target) => (
              <a
                key={target.id}
                role="menuitem"
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenMenu(null)}
                className={itemClass}
              >
                {target.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {/* More */}
      {onToggleSave || showReport ? (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
          aria-haspopup="menu"
          aria-expanded={openMenu === "more"}
          className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
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
                className={itemClass}
              >
                <Bookmark className={"w-4 h-4 " + (saved ? "fill-brand text-brand" : "text-fg-muted")} />
                {saved ? "Remove bookmark" : "Bookmark"}
              </button>
            ) : null}
            {showReport ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setReportOpen(true);
                }}
                className={itemClass}
              >
                <Flag className="w-4 h-4 text-fg-muted" />
                Report
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      ) : null}

      {reportContentId ? (
        <ReportDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          contentType={reportContentType}
          contentId={reportContentId}
          contentLabel={reportLabel}
        />
      ) : null}
    </div>
  );
}
