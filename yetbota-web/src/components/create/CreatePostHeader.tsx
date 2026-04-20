"use client";

import { X } from "lucide-react";

export default function CreatePostHeader({
  title,
  onClose,
  onPost,
}: {
  title: string;
  onClose: () => void;
  onPost: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-[#161616] rounded-full transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onPost}
          className="px-6 py-2 bg-brand text-black font-bold rounded-full hover:opacity-90 transition-all shadow-lg shadow-brand/20"
        >
          Post
        </button>
      </div>
    </header>
  );
}

