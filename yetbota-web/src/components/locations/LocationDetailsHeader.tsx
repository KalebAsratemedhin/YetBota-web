"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Share2 } from "lucide-react";

export default function LocationDetailsHeader() {
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
            aria-label="More"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
