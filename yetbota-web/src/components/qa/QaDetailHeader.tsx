"use client";

import { ArrowLeft, MoreHorizontal, Share2 } from "lucide-react";

export default function QaDetailHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]">
      <div className="w-full px-6 sm:px-8 lg:px-32 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-fg">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
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
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
