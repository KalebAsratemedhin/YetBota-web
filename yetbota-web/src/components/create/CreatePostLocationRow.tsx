"use client";

import { ChevronRight, MapPin } from "lucide-react";

export default function CreatePostLocationRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-[#161616] flex items-center justify-between cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold">Set Location</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pin your post to a specific spot</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </button>
  );
}

