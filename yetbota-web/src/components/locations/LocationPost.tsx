"use client";

import Image from "next/image";
import { ThumbsDown, ThumbsUp, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

export interface LocationPostAuthor {
  name: string;
  avatarUrl: string;
  badge: string;
  meta: string;
}

export default function LocationPost({
  author,
  title,
  body,
  tags,
  likes,
  comments,
  commentsOpen,
  onToggleComments,
  showFollow = true,
}: {
  author: LocationPostAuthor;
  title: string;
  body: string;
  tags: string[];
  likes: number;
  comments: number;
  commentsOpen?: boolean;
  onToggleComments?: () => void;
  showFollow?: boolean;
}) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const score = useMemo(() => {
    if (vote === "up") return likes + 1;
    if (vote === "down") return likes - 1;
    return likes;
  }, [likes, vote]);

  return (
    <article className="px-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand">
            <Image
              alt={author.name}
              src={author.avatarUrl}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{author.name}</h3>
              <span className="bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {author.badge}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{author.meta}</p>
          </div>
        </div>
        {showFollow ? (
          <button className="bg-brand text-white px-6 py-2 rounded-full font-bold hover:bg-brand/90 transition-colors">
            Follow
          </button>
        ) : null}
      </div>

      <h1 className="text-3xl font-extrabold mb-4">{title}</h1>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-lg">
        {body}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((t) => (
          <span
            key={t}
            className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-sm font-medium border border-brand/20"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 py-4 border-y border-slate-200 dark:border-[#262626]">
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-[#161616] px-4 py-2 rounded-full">
          <button
            type="button"
            aria-pressed={vote === "up"}
            onClick={() => setVote((v) => (v === "up" ? null : "up"))}
            className={
              "flex items-center gap-1.5 font-bold transition-colors " +
              (vote === "up" ? "text-brand" : "text-slate-500 dark:text-slate-300 hover:text-brand")
            }
          >
            <ThumbsUp className="w-5 h-5" />
            <span>{score}</span>
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <button
            type="button"
            aria-label="Downvote"
            aria-pressed={vote === "down"}
            onClick={() => setVote((v) => (v === "down" ? null : "down"))}
            className={
              "flex items-center transition-colors " +
              (vote === "down"
                ? "text-brand"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")
            }
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleComments}
          aria-expanded={commentsOpen}
          aria-controls="comments"
          className={
            "flex items-center gap-2 transition-colors " +
            (commentsOpen ? "text-brand" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
          }
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold">{comments}</span>
        </button>
      </div>
    </article>
  );
}

