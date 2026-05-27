"use client";

import { Search } from "lucide-react";
import { QA_CATEGORIES, type QaCategory } from "@/lib/qaMockData";

export default function QaFeedHeader({
  active,
  onChange,
}: {
  active: QaCategory;
  onChange: (c: QaCategory) => void;
}) {
  return (
    <header className="sticky top-0 bg-bg/95 backdrop-blur-md py-4 z-30 space-y-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
        <input
          className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-100 dark:bg-[#171717] border-none rounded-full focus:ring-2 focus:ring-brand/50 text-sm sm:text-base transition-all outline-none"
          placeholder="Search community questions..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QA_CATEGORIES.map((c) => {
          const isActive = c === active;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={
                isActive
                  ? "px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-brand text-white font-semibold rounded-full hover:brightness-110 transition-all shrink-0"
                  : "px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-slate-100 dark:bg-[#171717] text-slate-600 dark:text-slate-300 font-medium rounded-full border border-slate-200 dark:border-[#262626] hover:bg-slate-200 dark:hover:bg-neutral-800 transition-all shrink-0"
              }
            >
              {c}
            </button>
          );
        })}
      </div>
    </header>
  );
}

