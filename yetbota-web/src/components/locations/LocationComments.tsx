"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useCreateCommentMutation, useListCommentsQuery, useVoteCommentMutation } from "@/store/api/contentApi";
import { useGetUserByIdQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import type { Comment } from "@/types/content";

function timeLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 6) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function voteStorageKey(commentId: string) {
  return `yetbota.commentVote.${commentId}`;
}

function readStoredVote(commentId: string): "upvote" | "downvote" | null {
  if (!commentId) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(voteStorageKey(commentId));
    if (raw === "upvote" || raw === "downvote") return raw;
    return null;
  } catch {
    return null;
  }
}

function writeStoredVote(commentId: string, vote: "upvote" | "downvote") {
  if (!commentId) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(voteStorageKey(commentId), vote);
  } catch {
    // ignore
  }
}

function truncateText(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function CommentNode({
  c,
  depth,
  childrenByParentId,
  commentById,
  currentUserAvatarUrl,
  currentUserId,
  onRefetch,
}: {
  c: Comment;
  depth: number;
  childrenByParentId: Map<string, Comment[]>;
  commentById: Map<string, Comment>;
  currentUserAvatarUrl: string;
  currentUserId?: string;
  onRefetch: () => void;
}) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [voteComment, { isLoading: voting }] = useVoteCommentMutation();
  const { data: userRes } = useGetUserByIdQuery(
    { id: c.user_id, resolution: "WEB" },
    { skip: !accessToken || !c.user_id }
  );
  const [createComment, { isLoading: replying }] = useCreateCommentMutation();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [myVote, setMyVote] = useState<"upvote" | "downvote" | null>(() => readStoredVote(c.id));
  const [voteOverride, setVoteOverride] = useState<{ upvote: number; downvote: number } | null>(null);
  const upCount = voteOverride?.upvote ?? (typeof c.upvote === "number" ? c.upvote : 0);
  const downCount = voteOverride?.downvote ?? (typeof c.downvote === "number" ? c.downvote : 0);

  const name = userRes?.user ? `${userRes.user.first_name} ${userRes.user.last_name}`.trim() || userRes.user.username : "User";
  const avatarUrl = userRes?.user?.profile_url ? resolveApiUrl(userRes.user.profile_url) : "/images/profile/tomoca-coffee-on-cameroon.webp";
  const isOwn = Boolean(currentUserId && c.user_id && currentUserId === c.user_id);
  const canVote = Boolean(accessToken) && !isOwn;
  const children = childrenByParentId.get(c.id) ?? [];
  const isReplyOfReply = depth >= 2 && typeof c.comment_id === "string" && Boolean(c.comment_id);
  const replyRef = isReplyOfReply ? commentById.get(c.comment_id ?? "") : undefined;
  // Indent exactly one level for any reply (depth >= 1),
  // so replies-of-replies stay aligned with their parent reply.
  const isVisuallyNested = depth > 0;
  const avatarSize = isVisuallyNested ? 32 : 40;
  const maxDepth = 6;

  const parentUserId = replyRef?.user_id ?? "";
  const { data: parentUserRes } = useGetUserByIdQuery(
    { id: parentUserId, resolution: "WEB" },
    { skip: !accessToken || !parentUserId }
  );
  const parentName = parentUserRes?.user
    ? `${parentUserRes.user.first_name} ${parentUserRes.user.last_name}`.trim() || parentUserRes.user.username
    : "User";

  async function handleVote(next: "upvote" | "downvote") {
    if (!c.id) return;
    try {
      setMyVote(next);
      writeStoredVote(c.id, next);
      const res = await voteComment({ id: c.id, body: { vote_type: next } }).unwrap();
      if (typeof res.upvote === "number" && typeof res.downvote === "number") {
        setVoteOverride({ upvote: res.upvote, downvote: res.downvote });
      }
      onRefetch();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to vote", description: getAuthErrorMessage(err) });
      setMyVote(readStoredVote(c.id));
    }
  }

  async function handleReply() {
    const body = replyText.trim();
    if (!body) return;
    try {
      await createComment({ post_id: c.post_id, comment: body, is_answer: c.is_answer, comment_id: c.id }).unwrap();
      setReplyText("");
      setReplyOpen(false);
      onRefetch();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to reply", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <>
      <div
        id={`comment-${c.id}`}
        className={
          (isVisuallyNested ? "ml-6 pl-4 border-l border-slate-200 dark:border-border-subtle " : "") + "scroll-mt-28"
        }
      >
        <div className="flex gap-4">
        {c.user_id ? (
          <Link
            href={`/users/${c.user_id}`}
            className={`${isVisuallyNested ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-slate-200 dark:bg-surface overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50`}
            aria-label={`View ${name}'s profile`}
          >
            <Image alt={name} src={avatarUrl} width={avatarSize} height={avatarSize} className="w-full h-full object-cover" />
          </Link>
        ) : (
          <div className={`${isVisuallyNested ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-slate-200 dark:bg-surface overflow-hidden shrink-0`}>
            <Image alt={name} src={avatarUrl} width={avatarSize} height={avatarSize} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
        <div className="flex items-center justify-between gap-3 mb-1">
          {c.user_id ? (
            <Link
              href={`/users/${c.user_id}`}
              className={`${isVisuallyNested ? "font-bold text-sm" : "font-bold"} hover:text-brand hover:underline transition-colors`}
            >
              {name}
            </Link>
          ) : (
            <span className={isVisuallyNested ? "font-bold text-sm" : "font-bold"}>{name}</span>
          )}
          <span className="text-[10px] text-fg-faint">{timeLabel(c.created_at)}</span>
        </div>
        {replyRef ? (
          <div className="mb-2 rounded-xl border border-slate-200 dark:border-border-subtle bg-slate-50 dark:bg-surface px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
            <a
              href={`#comment-${replyRef.id}`}
              className="font-semibold text-brand hover:underline"
              aria-label={`Jump to ${parentName}'s comment`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(`comment-${replyRef.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Replying to {parentName}
            </a>{" "}
            <span className="italic text-fg-faint dark:text-slate-400">“{truncateText(replyRef.comment ?? "", 90)}”</span>
          </div>
        ) : null}
        <p className={isVisuallyNested ? "text-slate-700 dark:text-slate-300 text-sm mb-2" : "text-slate-700 dark:text-slate-300 mb-2"}>
          {c.comment}
        </p>
        <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              aria-label="Upvote"
              aria-pressed={myVote === "upvote"}
              disabled={!canVote || voting}
              onClick={() => void handleVote("upvote")}
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors " +
                (myVote === "upvote"
                  ? "text-brand bg-brand/10"
                  : "text-fg-faint hover:text-slate-900 dark:text-slate-400 dark:hover:text-fg")
              }
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-semibold">{upCount}</span>
            </button>
            <button
              type="button"
              aria-label="Downvote"
              aria-pressed={myVote === "downvote"}
              disabled={!canVote || voting}
              onClick={() => void handleVote("downvote")}
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors " +
                (myVote === "downvote"
                  ? "text-brand bg-brand/10"
                  : "text-fg-faint hover:text-slate-900 dark:text-slate-400 dark:hover:text-fg")
              }
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="font-semibold">{downCount}</span>
            </button>
            <button
              type="button"
              className="ml-2 text-xs font-semibold text-fg-faint hover:text-brand disabled:opacity-50"
              onClick={() => setReplyOpen((v) => !v)}
              disabled={!accessToken}
            >
              Reply
            </button>
        </div>

        {replyOpen ? (
          <div className="mt-3 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-surface overflow-hidden shrink-0">
              <Image
                alt="Current user"
                src={currentUserAvatarUrl}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative flex-1">
              <input
                className="w-full bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-2xl py-2.5 px-4 pr-11 focus:ring-brand focus:border-brand text-sm"
                placeholder="Write a reply..."
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replying || !accessToken}
              />
              <button
                type="button"
                className="absolute right-2 top-1.5 p-2 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 disabled:opacity-50"
                aria-label="Send reply"
                onClick={() => void handleReply()}
                disabled={replying || !accessToken || !replyText.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        </div>
      </div>
      </div>

      {children.length > 0 && depth < maxDepth ? (
        <div className="mt-4 space-y-5">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              c={child}
              depth={depth + 1}
              childrenByParentId={childrenByParentId}
              commentById={commentById}
              currentUserAvatarUrl={currentUserAvatarUrl}
              currentUserId={currentUserId}
              onRefetch={onRefetch}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function LocationComments({
  postId,
  currentUserAvatarUrl,
  currentUserId,
  onCommentPosted,
}: {
  postId: string;
  currentUserAvatarUrl: string;
  currentUserId?: string;
  onCommentPosted?: () => void;
}) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [text, setText] = useState("");

  const { data, isLoading, isError, refetch } = useListCommentsQuery(
    { post_id: postId },
    { skip: !accessToken || !postId }
  );
  const topLevelComments = useMemo(
    () => (data?.comments ?? []).filter((c) => !c.comment_id && !c.is_answer),
    [data?.comments]
  );
  const childrenByParentId = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const c of data?.comments ?? []) {
      if (!c.comment_id) continue;
      const arr = map.get(c.comment_id) ?? [];
      arr.push(c);
      map.set(c.comment_id, arr);
    }
    return map;
  }, [data?.comments]);
  const commentById = useMemo(() => {
    const map = new Map<string, Comment>();
    for (const c of data?.comments ?? []) map.set(c.id, c);
    return map;
  }, [data?.comments]);

  const [createComment, { isLoading: posting }] = useCreateCommentMutation();

  async function handleSend() {
    const body = text.trim();
    if (!body) return;
    try {
      await createComment({ post_id: postId, comment: body, is_answer: false }).unwrap();
      setText("");
      void refetch();
      onCommentPosted?.();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to post", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <section className="p-6 bg-slate-50 dark:bg-bg">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-lg bg-brand/15 items-center justify-center text-brand">
          <MessageSquareText className="w-4 h-4" />
        </span>
        <span>Comments</span>
      </h2>

      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-surface overflow-hidden shrink-0">
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
            className="w-full bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-2xl py-3 px-5 pr-12 focus:ring-brand focus:border-brand"
            placeholder="Write a comment..."
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={posting || !accessToken}
          />
          <button
            type="button"
            className="absolute right-2 top-1.5 p-2 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 disabled:opacity-50"
            aria-label="Send"
            onClick={() => void handleSend()}
            disabled={posting || !accessToken || !text.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-fg-faint text-sm">Loading…</div>
      ) : isError ? (
        <div className="text-fg-faint text-sm">
          Failed to load comments.{" "}
          <button type="button" className="text-brand font-semibold" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-fg-faint text-sm">No comments yet.</div>
      ) : (
        <div className="space-y-8">
          {topLevelComments.map((c) => (
            <CommentNode
              key={c.id}
              c={c}
              depth={0}
              childrenByParentId={childrenByParentId}
              commentById={commentById}
              currentUserAvatarUrl={currentUserAvatarUrl}
              currentUserId={currentUserId}
              onRefetch={() => {
                void refetch();
                onCommentPosted?.();
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

