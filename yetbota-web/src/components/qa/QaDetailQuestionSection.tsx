"use client";

import { ChevronDown, ChevronUp, Tag } from "lucide-react";

export default function QaDetailQuestionSection({
  title,
  body,
  tags,
  likes = 0,
  dislikes = 0,
  vote = null,
  onVote,
  canVote = false,
  voting = false,
}: {
  title: string;
  body: string;
  tags: string[];
  likes?: number;
  dislikes?: number;
  vote?: "like" | "dislike" | null;
  onVote?: (kind: "like" | "dislike") => void;
  canVote?: boolean;
  voting?: boolean;
}) {
  const score = (likes || 0) - (dislikes || 0);

  return (
    <section className="mb-12 flex gap-4">
      {/* Vote column — like/dislike on the question post */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-10 pt-2">
        <button
          type="button"
          onClick={() => onVote?.("like")}
          disabled={!canVote || voting}
          aria-pressed={vote === "like"}
          aria-label="Upvote question"
          className={
            "p-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
            (vote === "like"
              ? "text-brand bg-brand/10"
              : "text-fg-faint hover:text-brand hover:bg-overlay")
          }
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-brand tabular-nums">{score}</span>
        <button
          type="button"
          onClick={() => onVote?.("dislike")}
          disabled={!canVote || voting}
          aria-pressed={vote === "dislike"}
          aria-label="Downvote question"
          className={
            "p-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
            (vote === "dislike"
              ? "text-red-500 bg-red-500/10"
              : "text-fg-faint hover:text-fg-muted hover:bg-overlay")
          }
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-fg">{title}</h2>
        {body ? (
          <p className="text-fg-muted text-lg leading-relaxed mb-6 whitespace-pre-wrap">{body}</p>
        ) : null}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-4 py-2 bg-overlay hover:bg-overlay-strong rounded-full transition-colors border border-border-subtle text-fg"
              >
                <Tag className="w-3.5 h-3.5 text-brand" />
                <span className="text-sm font-medium">{t}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
