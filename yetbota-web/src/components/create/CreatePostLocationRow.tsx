"use client";

import { ChevronRight, MapPin } from "lucide-react";

export default function CreatePostLocationRow({
  onClick,
  subtitle,
}: {
  onClick: () => void;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-surface flex items-center justify-between cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <p className="text-base font-semibold">Set Location</p>
          <p className="text-sm text-fg-faint dark:text-slate-400 mt-0.5">
            {subtitle ?? "Pin your post to a specific spot"}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-fg-muted" />
    </button>
  );
}

