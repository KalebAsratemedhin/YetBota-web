"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function CreatePostTags({
  tags,
  selected,
  onToggle,
  onAddTag,
}: {
  tags: string[];
  selected: string[];
  onToggle: (t: string) => void;
  onAddTag?: (t: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && onAddTag) onAddTag(trimmed);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
        Popular Tags
      </label>
      <div className="flex flex-wrap gap-3 items-center">
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
                  : "px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface text-slate-600 dark:text-slate-300 font-medium hover:border-brand/50 transition-all"
              }
            >
              {t}
            </button>
          );
        })}

        {adding ? (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-brand/60 bg-white dark:bg-surface focus-within:ring-2 focus-within:ring-brand/40">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setDraft("");
                  setAdding(false);
                }
              }}
              onBlur={commit}
              placeholder="New tag"
              maxLength={32}
              className="bg-transparent outline-none text-sm w-28 text-slate-900 dark:text-fg placeholder:text-fg-faint"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setDraft("");
                setAdding(false);
              }}
              className="p-1 rounded-full hover:bg-overlay text-fg-muted"
              aria-label="Cancel new tag"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-5 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-brand flex items-center gap-2 font-medium hover:bg-brand/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
