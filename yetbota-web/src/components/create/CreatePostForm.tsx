"use client";

import { useRef } from "react";

const FIELD_CLASS =
  "w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-surface border-0 outline-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all placeholder:text-fg-muted dark:placeholder:text-slate-600";

export default function CreatePostForm({
  title,
  description,
  address,
  onChangeTitle,
  onChangeDescription,
  onChangeAddress,
}: {
  title: string;
  description: string;
  address: string;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeAddress: (v: string) => void;
}) {
  const descRef = useRef<HTMLTextAreaElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              descRef.current?.focus();
            }
          }}
          className={`${FIELD_CLASS} text-lg`}
          placeholder="e.g. Exploring the Simien Mountains"
          type="text"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Description
        </label>
        <textarea
          ref={descRef}
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          onKeyDown={(e) => {
            // Enter → next field; Shift+Enter falls through to default newline.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addressRef.current?.focus();
            }
          }}
          className={`${FIELD_CLASS} text-base leading-relaxed resize-none`}
          placeholder="Describe the vibe at the local Buna ceremony... (Shift+Enter for a new line)"
          rows={6}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Address
        </label>
        <input
          ref={addressRef}
          value={address}
          onChange={(e) => onChangeAddress(e.target.value.slice(0, 255))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          maxLength={255}
          className={`${FIELD_CLASS} text-base`}
          placeholder="e.g. Bole, Addis Ababa"
          type="text"
        />
      </div>
    </>
  );
}
