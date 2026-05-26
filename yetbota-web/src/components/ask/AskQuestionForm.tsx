"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Link2, MapPin, Plus, Radar, X } from "lucide-react";
import type { Post } from "@/types/content";

function areaLabel(post: Post): string {
  if (post.address && post.address.trim().length > 0) return post.address;
  if (
    post.location &&
    typeof post.location.latitude === "number" &&
    typeof post.location.longitude === "number"
  ) {
    return `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`;
  }
  return "Ethiopia";
}

export default function AskQuestionForm({
  question,
  onChangeQuestion,
  tags,
  tagOptions,
  onToggleTag,
  onAddTag,
  locationSubtitle,
  onClickLocation,
  onClickSelectPost,
  attachedPost,
  attachedPostLoading,
  onRemovePost,
}: {
  question: string;
  onChangeQuestion: (v: string) => void;
  tags: string[];
  tagOptions: string[];
  onToggleTag: (t: string) => void;
  onAddTag: (t: string) => void;
  locationSubtitle?: string;
  onClickLocation?: () => void;
  onClickSelectPost?: () => void;
  attachedPost?: Post | null;
  attachedPostLoading?: boolean;
  onRemovePost?: () => void;
}) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  function commitNewTag() {
    const trimmed = newTag.trim();
    if (trimmed) onAddTag(trimmed);
    setNewTag("");
    setAddingTag(false);
  }

  return (
    <>
      <section className="space-y-4">
        <label className="block text-xs font-bold tracking-widest text-fg-faint dark:text-zinc-500 uppercase">
          Your Question
        </label>
        <textarea
          value={question}
          onChange={(e) => onChangeQuestion(e.target.value)}
          className="w-full bg-slate-100 dark:bg-bg border border-slate-200 dark:border-zinc-800 rounded-xl p-5 text-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all outline-none resize-none [scrollbar-width:thin] [scrollbar-color:#333_transparent]"
          placeholder="What would you like to ask your local community?"
          rows={8}
        />
      </section>

      <section className="space-y-4">
        <label className="block text-xs font-bold tracking-widest text-fg-faint dark:text-zinc-500 uppercase">
          Reference Location
        </label>
        <button
          type="button"
          onClick={onClickLocation}
          className="w-full bg-slate-100 dark:bg-bg border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-brand/50 transition-colors group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-200 dark:bg-zinc-800 p-3 rounded-xl group-hover:bg-brand/20 transition-colors text-brand">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-fg">Tag a Location</h3>
              <p className="text-fg-faint dark:text-zinc-500 text-sm">
                {locationSubtitle ?? "Help people nearby find your post"}
              </p>
            </div>
          </div>
          <Radar className="w-5 h-5 text-fg-muted dark:text-zinc-600" />
        </button>
      </section>

      <section className="space-y-4">
        <label className="block text-xs font-bold tracking-widest text-fg-faint dark:text-zinc-500 uppercase">
          Reference a Post
        </label>
        {attachedPost ? (
          <div className="w-full bg-slate-100 dark:bg-bg border border-brand/40 rounded-xl p-3 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0">
              <Image
                src={attachedPost.photos?.[0]?.photo_url ?? "/images/profile/rock-hewn.webp"}
                alt=""
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Based on</p>
              <h4 className="font-bold text-slate-900 dark:text-fg truncate">{attachedPost.title}</h4>
              <p className="text-fg-faint dark:text-zinc-500 text-xs truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {areaLabel(attachedPost)}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemovePost}
              aria-label="Remove referenced post"
              className="p-2 rounded-full text-fg-muted hover:text-fg hover:bg-overlay transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : attachedPostLoading ? (
          <div className="w-full bg-slate-100 dark:bg-bg border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-fg-faint">
            Loading selected post…
          </div>
        ) : (
          <button
            type="button"
            onClick={onClickSelectPost}
            className="w-full bg-slate-100 dark:bg-bg border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-brand/50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-200 dark:bg-zinc-800 p-3 rounded-xl group-hover:bg-brand/20 transition-colors text-brand">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-fg">Base on a Post</h3>
                <p className="text-fg-faint dark:text-zinc-500 text-sm">
                  Pick a location post your question is about
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-fg-muted dark:text-zinc-600" />
          </button>
        )}
      </section>

      <section className="space-y-4">
        <label className="block text-xs font-bold tracking-widest text-fg-faint dark:text-zinc-500 uppercase">
          Add Tags
        </label>
        <div className="flex flex-wrap gap-3 items-center">
          {addingTag ? (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-bg border border-brand/50 rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-brand/40">
              <input
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitNewTag();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setNewTag("");
                    setAddingTag(false);
                  }
                }}
                onBlur={commitNewTag}
                placeholder="New tag"
                maxLength={32}
                className="bg-transparent outline-none text-sm w-28 text-slate-900 dark:text-fg placeholder:text-fg-faint"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setNewTag("");
                  setAddingTag(false);
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
              onClick={() => setAddingTag(true)}
              className="flex items-center gap-2 bg-brand text-black px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Tag
            </button>
          )}

          {tagOptions.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => onToggleTag(t)}
                className={
                  "px-5 py-2 rounded-full font-medium text-sm transition-all " +
                  (active
                    ? "bg-brand/20 text-brand"
                    : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700")
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
