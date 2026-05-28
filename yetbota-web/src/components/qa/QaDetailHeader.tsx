"use client";

import { ArrowLeft } from "lucide-react";
import PostActionMenus from "@/components/common/PostActionMenus";

export default function QaDetailHeader({
  title,
  onBack,
  shareTitle,
  saved,
  onToggleSave,
  saveLoading,
  reportContentId,
  reportLabel,
  canReport,
  editHref,
}: {
  title: string;
  onBack: () => void;
  shareTitle?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  saveLoading?: boolean;
  reportContentId?: string;
  reportLabel?: string;
  canReport?: boolean;
  editHref?: string;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]">
      <div className="w-full px-4 sm:px-8 lg:px-32 h-16 sm:h-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-fg truncate">{title}</h1>
        </div>

        <PostActionMenus
          shareTitle={shareTitle}
          saved={saved}
          onToggleSave={onToggleSave}
          saveLoading={saveLoading}
          reportContentId={reportContentId}
          reportContentType="POST"
          reportLabel={reportLabel}
          canReport={canReport}
          editHref={editHref}
        />
      </div>
    </nav>
  );
}
