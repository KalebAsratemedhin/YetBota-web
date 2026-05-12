"use client";

import { Image as ImageIcon, SendHorizontal } from "lucide-react";

export default function QaAnswerComposer() {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 px-8 lg:px-32 py-6 bg-white/80 dark:bg-bg/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5">
      <div className="w-full flex items-center gap-4">
        <div className="relative flex-1 group">
          <input
            className="w-full bg-slate-100 dark:bg-surface-2 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-brand transition-all text-slate-900 dark:text-fg placeholder:text-fg-muted"
            placeholder="Type your answer..."
            type="text"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-fg-muted hover:text-brand transition-colors"
            aria-label="Add image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/30"
          aria-label="Send"
        >
          <SendHorizontal className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}

