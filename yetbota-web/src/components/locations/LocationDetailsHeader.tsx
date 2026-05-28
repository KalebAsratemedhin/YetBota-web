"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostActionMenus from "@/components/common/PostActionMenus";

export default function LocationDetailsHeader({
  title = "YetBota",
  saved = false,
  onToggleSave,
  saveLoading,
  reportContentId,
  canReport,
  editHref,
}: {
  title?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  saveLoading?: boolean;
  reportContentId?: string;
  canReport?: boolean;
  editHref?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-fg">Post Details</h2>
        </div>

        <PostActionMenus
          shareTitle={title}
          saved={saved}
          onToggleSave={onToggleSave}
          saveLoading={saveLoading}
          reportContentId={reportContentId}
          reportContentType="POST"
          reportLabel="post"
          canReport={canReport}
          editHref={editHref}
        />
      </div>
    </header>
  );
}
