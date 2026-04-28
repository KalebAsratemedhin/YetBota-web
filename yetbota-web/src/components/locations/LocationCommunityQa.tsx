"use client";

import Image from "next/image";
import { MessageSquareText, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";

export interface LocationQaReply {
  id: string;
  authorName: string;
  authorBadge: string;
  authorAvatarUrl: string;
  text: string;
  upvotes: number;
  timeAgo: string;
}

export interface LocationQaItem {
  id: string;
  authorName: string;
  authorBadge: string;
  authorAvatarUrl: string;
  text: string;
  upvotes: number;
  timeAgo: string;
  replies?: LocationQaReply[];
}

export default function LocationCommunityQa({
  currentUserAvatarUrl,
  items,
}: {
  currentUserAvatarUrl: string;
  items: LocationQaItem[];
}) {
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});

  const getScore = useMemo(() => {
    return (id: string, base: number) => {
      const v = votes[id] ?? null;
      if (v === "up") return base + 1;
      if (v === "down") return base - 1;
      return base;
    };
  }, [votes]);

  const toggleVote = (id: string, next: "up" | "down") => {
    setVotes((prev) => {
      const current = prev[id] ?? null;
      return { ...prev, [id]: current === next ? null : next };
    });
  };

  return (
    <section className="p-6 bg-slate-50 dark:bg-[#0f0f0f]">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-lg bg-brand/15 items-center justify-center text-brand">
          <MessageSquareText className="w-4 h-4" />
        </span>
        <span>Community QA</span>
      </h2>

      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#161616] overflow-hidden shrink-0">
          <Image
            alt="Current user"
            src={currentUserAvatarUrl}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative flex-1">
          <input
            className="w-full bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-2xl py-3 px-5 pr-12 focus:ring-brand focus:border-brand"
            placeholder="Ask a question about this spot..."
            type="text"
          />
          <button
            type="button"
            className="absolute right-2 top-1.5 p-2 bg-brand text-white rounded-xl shadow-lg shadow-brand/20"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {items.map((q) => (
          <div key={q.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#161616] overflow-hidden shrink-0">
              <Image
                alt={q.authorName}
                src={q.authorAvatarUrl}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{q.authorName}</span>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {q.authorBadge}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-3">{q.text}</p>
              <div className="flex items-center gap-4 text-xs">
                <button
                  type="button"
                  aria-pressed={(votes[q.id] ?? null) === "up"}
                  onClick={() => toggleVote(q.id, "up")}
                  className={
                    "flex items-center gap-1 font-bold transition-colors " +
                    ((votes[q.id] ?? null) === "up"
                      ? "text-brand"
                      : "text-slate-500 dark:text-slate-300 hover:text-brand")
                  }
                >
                  <ThumbsUp className="w-4 h-4" /> {getScore(q.id, q.upvotes)}
                </button>
                <button
                  type="button"
                  aria-label="Downvote"
                  aria-pressed={(votes[q.id] ?? null) === "down"}
                  onClick={() => toggleVote(q.id, "down")}
                  className={
                    "transition-colors " +
                    ((votes[q.id] ?? null) === "down"
                      ? "text-brand"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")
                  }
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <span className="text-slate-500">{q.timeAgo}</span>
                <button className="text-brand font-bold hover:underline">Reply</button>
              </div>

              {q.replies?.map((r) => (
                <div
                  key={r.id}
                  className="mt-6 flex gap-3 border-l-2 border-slate-200 dark:border-[#262626] pl-6"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#161616] overflow-hidden shrink-0">
                    <Image
                      alt={r.authorName}
                      src={r.authorAvatarUrl}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{r.authorName}</span>
                      <span className="bg-brand/20 text-brand text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {r.authorBadge}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">{r.text}</p>
                    <div className="flex items-center gap-4 text-[10px]">
                      <button
                        type="button"
                        aria-pressed={(votes[r.id] ?? null) === "up"}
                        onClick={() => toggleVote(r.id, "up")}
                        className={
                          "flex items-center gap-1 font-bold transition-colors " +
                          ((votes[r.id] ?? null) === "up"
                            ? "text-brand"
                            : "text-slate-500 dark:text-slate-300 hover:text-brand")
                        }
                      >
                        <ThumbsUp className="w-3 h-3" /> {getScore(r.id, r.upvotes)}
                      </button>
                      <button
                        type="button"
                        aria-label="Downvote"
                        aria-pressed={(votes[r.id] ?? null) === "down"}
                        onClick={() => toggleVote(r.id, "down")}
                        className={
                          "transition-colors " +
                          ((votes[r.id] ?? null) === "down"
                            ? "text-brand"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")
                        }
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <span className="text-slate-500">{r.timeAgo}</span>
                      <button className="text-brand font-bold hover:underline text-[10px]">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

