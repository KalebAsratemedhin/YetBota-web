"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Share2 } from "lucide-react";

export default function LocationDetailsHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-[#262626]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-[#161616] rounded-full transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold">Post Details</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-[#161616] rounded-full"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-[#161616] rounded-full"
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

