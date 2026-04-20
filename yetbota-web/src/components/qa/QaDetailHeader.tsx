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
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="w-full px-8 lg:px-32 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            aria-label="More"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

