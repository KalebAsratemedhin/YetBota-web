"use client";

import Image from "next/image";
import { Flag, Reply } from "lucide-react";
import { useMemo, useState } from "react";
import type { QaDetailAnswer } from "@/lib/qaDetailMockData";

export default function QaAnswerCard({ answer }: { answer: QaDetailAnswer }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const score = useMemo(() => {
    if (vote === "up") return answer.score + 1;
    if (vote === "down") return answer.score - 1;
    return answer.score;
  }, [answer.score, vote]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => setVote((v) => (v === "up" ? null : "up"))}
          className={"p-1 transition-colors " + (vote === "up" ? "text-brand" : "hover:text-brand")}
          aria-label="Upvote"
          aria-pressed={vote === "up"}
        >
          <span className="text-3xl leading-none">▴</span>
        </button>
        <span className="text-2xl font-bold text-brand">{score}</span>
        <button
          type="button"
          onClick={() => setVote((v) => (v === "down" ? null : "down"))}
          className={
            "p-1 transition-colors " +
            (vote === "down" ? "text-brand" : "text-slate-400 hover:text-slate-400")
          }
          aria-label="Downvote"
          aria-pressed={vote === "down"}
        >
          <span className="text-3xl leading-none">▾</span>
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image
              alt={answer.author.name}
              src={answer.author.avatarUrl}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-brand/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{answer.author.name}</span>
                <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold uppercase rounded">
                  {answer.author.badge}
                </span>
              </div>
              <span className="text-xs text-slate-500">{answer.timeAgo}</span>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Flag"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{answer.body}</p>

        <div className="flex gap-6">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand transition-colors"
          >
            <Reply className="w-4 h-4" /> REPLY
          </button>
        </div>

        {(answer.replies.length > 0 || answer.hasMoreReplies) && (
          <div className="mt-6 pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-6">
            {answer.replies.map((r) => (
              <div key={r.id} className="flex gap-3">
                <Image
                  alt={r.author.name}
                  src={r.author.avatarUrl}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">{r.author.name}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 text-[9px] font-bold uppercase rounded">
                      {r.author.badge}
                    </span>
                    <span className="text-[10px] text-slate-500">{r.timeAgo}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{r.body}</p>
                  <button
                    type="button"
                    className="mt-2 text-[10px] font-bold text-slate-500 hover:text-brand uppercase tracking-wider"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}

            {answer.hasMoreReplies && (
              <button type="button" className="text-xs font-bold text-brand hover:underline">
                {answer.moreRepliesLabel ?? "Show more comments..."}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

