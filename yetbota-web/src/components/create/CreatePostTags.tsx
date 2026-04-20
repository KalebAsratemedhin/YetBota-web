"use client";

import { Plus } from "lucide-react";

export default function CreatePostTags({
  tags,
  selected,
  onToggle,
}: {
  tags: string[];
  selected: string[];
  onToggle: (t: string) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
        Popular Tags
      </label>
      <div className="flex flex-wrap gap-3">
        {tags.map((t) => {
          const isActive = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              className={
                isActive
                  ? "px-5 py-2 rounded-full border border-brand bg-brand/10 text-brand font-medium hover:bg-brand/20 transition-all"
                  : "px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616] text-slate-600 dark:text-slate-300 font-medium hover:border-brand/50 transition-all"
              }
            >
              {t}
            </button>
          );
        })}

        <button
          type="button"
          className="px-5 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-brand flex items-center gap-2 font-medium hover:bg-brand/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}

