"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Flag,
  MessageCircle,
  Reply as ReplyIcon,
} from "lucide-react";
import type { Comment } from "@/types/content";
import { useAppSelector } from "@/store/hooks";
import { useGetUserByIdQuery } from "@/store/api/authApi";
import { useVoteCommentMutation } from "@/store/api/contentApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";

function approxTimeLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(d);
}

function useAuthor(userId: string | undefined) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data } = useGetUserByIdQuery(
    { id: userId ?? "", resolution: "WEB" },
    { skip: !accessToken || !userId }
  );
  const user = data?.user;
  const name = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : "Anonymous";
  const avatarUrl = user?.profile_url ? resolveApiUrl(user.profile_url) : null;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileHref = userId ? `/users/${userId}` : null;
  return { name, avatarUrl, initials, profileHref };
}

function ReplyRow({ reply }: { reply: Comment }) {
  const { name, avatarUrl, initials, profileHref } = useAuthor(reply.user_id);

  const Avatar = (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-overlay shrink-0 flex items-center justify-center">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={32}
          height={32}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        <span className="text-[10px] font-bold text-fg-muted">{initials || "?"}</span>
      )}
    </div>
  );

  return (
    <div className="flex gap-3">
      {profileHref ? (
        <Link href={profileHref} aria-label={`${name}'s profile`}>
          {Avatar}
        </Link>
      ) : (
        Avatar
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {profileHref ? (
            <Link
              href={profileHref}
              className="text-sm font-bold text-fg hover:text-brand transition-colors"
            >
              {name}
            </Link>
          ) : (
            <span className="text-sm font-bold text-fg">{name}</span>
          )}
          <span className="text-[10px] text-fg-faint">{approxTimeLabel(reply.created_at)}</span>
        </div>
        <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">
          {reply.comment}
        </p>
      </div>
    </div>
  );
}

export interface QaAnswerCardProps {
  answer: Comment;
  replies: Comment[];
  canVote: boolean;
  onReply?: (text: string) => Promise<void> | void;
}

export default function QaAnswerCard({ answer, replies, canVote, onReply }: QaAnswerCardProps) {
  const { name, avatarUrl, initials, profileHref } = useAuthor(answer.user_id);
  const { toast } = useToast();

  const [optimisticUpvote, setOptimisticUpvote] = useState<number | null>(null);
  const [optimisticDownvote, setOptimisticDownvote] = useState<number | null>(null);
  const [myVote, setMyVote] = useState<"upvote" | "downvote" | null>(null);
  const [voteComment, { isLoading: voting }] = useVoteCommentMutation();

  const upvotes = optimisticUpvote ?? answer.upvote;
  const downvotes = optimisticDownvote ?? answer.downvote;
  const score = upvotes - downvotes;

  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");

  const visibleReplies = useMemo(() => replies, [replies]);

  async function handleVote(kind: "upvote" | "downvote") {
    if (!canVote || voting) return;
    const previousMy = myVote;
    const nextMy = previousMy === kind ? null : kind;
    setMyVote(nextMy);
    setOptimisticUpvote(
      kind === "upvote"
        ? answer.upvote + (nextMy === "upvote" ? 1 : 0) - (previousMy === "upvote" ? 1 : 0)
        : answer.upvote - (previousMy === "upvote" ? 1 : 0)
    );
    setOptimisticDownvote(
      kind === "downvote"
        ? answer.downvote + (nextMy === "downvote" ? 1 : 0) - (previousMy === "downvote" ? 1 : 0)
        : answer.downvote - (previousMy === "downvote" ? 1 : 0)
    );
    try {
      await voteComment({ id: answer.id, body: { vote_type: kind } }).unwrap();
    } catch (err) {
      setMyVote(previousMy);
      setOptimisticUpvote(null);
      setOptimisticDownvote(null);
      toast({
        variant: "destructive",
        title: "Vote failed",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleSubmitReply() {
    const trimmed = draft.trim();
    if (!trimmed || !onReply) return;
    try {
      await onReply(trimmed);
      setDraft("");
      setReplying(false);
    } catch {
      // parent surfaces error
    }
  }

  return (
    <div className="flex gap-4">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-10 pt-2">
        <button
          type="button"
          onClick={() => void handleVote("upvote")}
          disabled={!canVote || voting}
          aria-pressed={myVote === "upvote"}
          aria-label="Upvote"
          className={
            "p-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
            (myVote === "upvote"
              ? "text-brand bg-brand/10"
              : "text-fg-faint hover:text-brand hover:bg-overlay")
          }
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-brand tabular-nums">{score}</span>
        <button
          type="button"
          onClick={() => void handleVote("downvote")}
          disabled={!canVote || voting}
          aria-pressed={myVote === "downvote"}
          aria-label="Downvote"
          className={
            "p-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
            (myVote === "downvote"
              ? "text-red-500 bg-red-500/10"
              : "text-fg-faint hover:text-fg-muted hover:bg-overlay")
          }
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Content card */}
      <div className="flex-1 min-w-0 bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {profileHref ? (
              <Link
                href={profileHref}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/20 bg-overlay shrink-0 flex items-center justify-center"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold text-fg-muted">{initials || "?"}</span>
                )}
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-brand/20 bg-overlay shrink-0 flex items-center justify-center">
                <span className="text-xs font-bold text-fg-muted">{initials || "?"}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="font-bold text-fg hover:text-brand transition-colors"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="font-bold text-fg">{name}</span>
                )}
                <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold uppercase rounded">
                  Community
                </span>
              </div>
              <span className="text-xs text-fg-faint">{approxTimeLabel(answer.created_at)}</span>
            </div>
          </div>
          <button
            type="button"
            className="text-fg-faint hover:text-fg-muted transition-colors p-1 rounded-md hover:bg-overlay"
            aria-label="Flag"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        <p className="text-fg-muted mb-4 leading-relaxed whitespace-pre-wrap">{answer.comment}</p>

        <div className="flex items-center gap-6">
          {onReply ? (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-fg-faint hover:text-brand transition-colors uppercase tracking-wider"
            >
              <ReplyIcon className="w-3.5 h-3.5" /> Reply
            </button>
          ) : null}
          {visibleReplies.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-fg-faint hover:text-brand transition-colors uppercase tracking-wider"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {showReplies ? "Hide" : "Show"} {visibleReplies.length}{" "}
              {visibleReplies.length === 1 ? "Reply" : "Replies"}
            </button>
          )}
        </div>

        {replying && onReply && (
          <div className="mt-4 flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              className="flex-1 bg-overlay border border-border-subtle rounded-xl px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-brand/40 resize-none"
            />
            <button
              type="button"
              onClick={() => void handleSubmitReply()}
              disabled={!draft.trim()}
              className="px-4 h-10 bg-brand text-black font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Send
            </button>
          </div>
        )}

        {showReplies && visibleReplies.length > 0 && (
          <div className="mt-6 pl-6 border-l-2 border-border-subtle space-y-6">
            {visibleReplies.map((r) => (
              <ReplyRow key={r.id} reply={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
