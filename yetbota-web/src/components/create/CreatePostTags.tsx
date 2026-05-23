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
    <div className="space-y-3">
      <label className="text-xs font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
        Popular Tags
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((t) => {
          const isActive = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              className={
                isActive
                  ? "px-4 py-2 text-sm rounded-full border border-brand bg-brand/10 text-brand font-semibold transition-all duration-150 hover:bg-brand/20 hover:border-brand hover:-translate-y-0.5 hover:shadow-sm hover:shadow-brand/20 active:translate-y-0"
                  : "px-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface text-slate-600 dark:text-slate-300 font-medium transition-all duration-150 hover:border-brand/60 hover:bg-brand/5 hover:text-brand hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"
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
              className="p-0.5 rounded-full hover:bg-overlay text-fg-muted"
              aria-label="Cancel new tag"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-4 py-2 text-sm rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-brand flex items-center gap-1.5 font-semibold transition-all duration-150 hover:bg-brand/10 hover:border-brand hover:border-solid hover:-translate-y-0.5 hover:shadow-sm hover:shadow-brand/20 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
