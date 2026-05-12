"use client";

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
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-surface border-transparent focus:border-brand focus:ring-0 transition-all text-lg placeholder:text-fg-muted dark:placeholder:text-slate-600"
          placeholder="e.g. Exploring the Simien Mountains"
          type="text"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-surface border-transparent focus:border-brand focus:ring-0 transition-all text-lg placeholder:text-fg-muted dark:placeholder:text-slate-600 resize-none"
          placeholder="Describe the vibe at the local Buna ceremony..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-fg-faint dark:text-slate-400 uppercase tracking-wider ml-1">
          Address
        </label>
        <input
          value={address}
          onChange={(e) => onChangeAddress(e.target.value.slice(0, 255))}
          maxLength={255}
          className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-surface border-transparent focus:border-brand focus:ring-0 transition-all text-lg placeholder:text-fg-muted dark:placeholder:text-slate-600"
          placeholder="e.g. Bole, Addis Ababa"
          type="text"
        />
      </div>
    </>
  );
}
