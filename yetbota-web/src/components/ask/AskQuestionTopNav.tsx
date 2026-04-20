"use client";

import { X } from "lucide-react";
import Link from "next/link";

export default function AskQuestionTopNav({
  title,
  onClose,
  onPost,
}: {
  title: string;
  onClose: () => void;
  onPost: () => void;
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link className="text-sm font-medium hover:text-brand transition-colors" href="/discovery">
              Home
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-colors" href="/discovery">
              Explore
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-colors" href="/qa">
              Q&amp;A
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onPost}
              className="bg-brand text-black font-bold px-6 py-2 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

