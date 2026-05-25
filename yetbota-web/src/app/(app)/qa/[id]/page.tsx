"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Image as ImageIcon, Send } from "lucide-react";
import QaDetailHeader from "@/components/qa/QaDetailHeader";
import QaDetailHero from "@/components/qa/QaDetailHero";
import QaDetailQuestionSection from "@/components/qa/QaDetailQuestionSection";
import QaAttachedPostCard from "@/components/qa/QaAttachedPostCard";
import QaAnswerCard from "@/components/qa/QaAnswerCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateCommentMutation,
  useGetPostByIdQuery,
  useGetPostInteractionsQuery,
  useListCommentsQuery,
  useSavePostMutation,
  useUnsavePostMutation,
  useVotePostMutation,
} from "@/store/api/contentApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

type SortKey = "top" | "newest";

export default function QaDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const meId = me?.user?.id;

  const {
    data: postRes,
    isLoading: postLoading,
    isError: postError,
    refetch: refetchPost,
  } = useGetPostByIdQuery({ id, resolution: "WEB" });
  const post = postRes?.post;

  // When this question references another post, fetch it for the "In reference
  // to" preview. GET /v1/posts/{id} is public, so no auth gate.
  const attachedId = post?.is_question ? post.attached_post_id : undefined;
  const { data: attachedRes } = useGetPostByIdQuery(
    { id: attachedId ?? "", resolution: "WEB" },
    { skip: !attachedId }
  );
  const attachedPost = attachedRes?.post ?? null;

  const {
    data: commentsRes,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useListCommentsQuery({ post_id: id }, { skip: !accessToken });
  const comments = commentsRes?.comments ?? [];

  const [newAnswer, setNewAnswer] = useState("");
  const [createComment, { isLoading: posting }] = useCreateCommentMutation();
  const [sort, setSort] = useState<SortKey>("top");
  const [sortOpen, setSortOpen] = useState(false);

  // Bookmark — server (interactions.saved) is the source of truth; the override
  // only applies while a save/unsave request is in flight.
  const { data: interactions } = useGetPostInteractionsQuery({ id }, { skip: !accessToken || !id });
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const isSaved = savedOverride ?? interactions?.saved ?? false;
  const [savePost, { isLoading: saving }] = useSavePostMutation();
  const [unsavePost, { isLoading: unsaving }] = useUnsavePostMutation();

  async function handleToggleSave() {
    if (!post?.id) return;
    const next = !isSaved;
    try {
      setSavedOverride(next);
      if (next) {
        await savePost({ id: post.id }).unwrap();
      } else {
        await unsavePost({ id: post.id }).unwrap();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: getAuthErrorMessage(err) });
      setSavedOverride(null);
    }
  }

  // Question (post) vote — server (interactions.post_vote) is the source of
  // truth; the override applies while the request is in flight.
  const [postVoteOverride, setPostVoteOverride] = useState<"like" | "dislike" | null | undefined>(undefined);
  const myPostVote = postVoteOverride !== undefined ? postVoteOverride : interactions?.post_vote ?? null;
  const [votePost, { isLoading: votingPost }] = useVotePostMutation();
  const canVotePost = Boolean(meId && post?.user_id && meId !== post.user_id);

  async function handleVoteQuestion(kind: "like" | "dislike") {
    if (!post?.id) return;
    try {
      setPostVoteOverride(kind);
      await votePost({ id: post.id, body: { vote_type: kind } }).unwrap();
      // Counts come from the post read endpoint (single source of truth).
      void refetchPost();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to vote", description: getAuthErrorMessage(err) });
      setPostVoteOverride(undefined);
    }
  }

  const badgeLabel = useMemo(() => (post?.is_question ? "Community Question" : "Post"), [
    post?.is_question,
  ]);
  const askedLabel = useMemo(() => {
    if (!post?.created_at) return "Asked";
    const d = new Date(post.created_at);
    if (Number.isNaN(d.getTime())) return "Asked";
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `Asked ${Math.max(diffMin, 1)}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Asked ${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `Asked ${diffDay}d ago`;
    return `Asked ${new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(d)}`;
  }, [post?.created_at]);

  const { answers, repliesByAnswer, answerCount } = useMemo(() => {
    const topLevel = comments.filter((c) => !c.comment_id && c.is_answer);
    const replies = new Map<string, typeof comments>();
    for (const c of comments) {
      if (c.comment_id) {
        const list = replies.get(c.comment_id) ?? [];
        list.push(c);
        replies.set(c.comment_id, list);
      }
    }
    for (const [k, list] of replies) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      replies.set(k, list);
    }
    const sorted = [...topLevel].sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      const aScore = a.upvote - a.downvote;
      const bScore = b.upvote - b.downvote;
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return { answers: sorted, repliesByAnswer: replies, answerCount: topLevel.length };
  }, [comments, sort]);

  async function handlePostAnswer() {
    const text = newAnswer.trim();
    if (!text) return;
    try {
      await createComment({ post_id: id, comment: text, is_answer: true }).unwrap();
      setNewAnswer("");
      void refetchComments();
      void refetchPost();
      toast({ title: "Posted" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to post",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleReply(parentId: string, text: string) {
    try {
      await createComment({
        post_id: id,
        comment: text,
        is_answer: false,
        comment_id: parentId,
      }).unwrap();
      void refetchComments();
      void refetchPost();
      toast({ title: "Reply posted" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to reply",
        description: getAuthErrorMessage(err),
      });
      throw err;
    }
  }

  const sortLabel = sort === "top" ? "Top Rated" : "Newest";

  return (
    <div className="h-screen overflow-hidden bg-bg text-fg">
      <QaDetailHeader
        title="Question Details"
        onBack={() => router.back()}
        shareTitle={post?.title}
        saved={isSaved}
        onToggleSave={accessToken ? () => void handleToggleSave() : undefined}
        saveLoading={saving || unsaving}
        reportContentId={post?.id}
        reportLabel={post?.is_question ? "question" : "post"}
        canReport={Boolean(meId && post?.user_id && meId !== post.user_id)}
      />

      <ScrollArea className="h-[calc(100vh-80px)]">
        <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
          <QaDetailHero
            imageUrl={post?.photos?.[0]?.photo_url ? resolveApiUrl(post.photos[0].photo_url) : null}
            badgeLabel={badgeLabel}
            askedLabel={askedLabel}
          />

          {postLoading ? (
            <div className="text-fg-faint text-sm">Loading…</div>
          ) : postError || !post ? (
            <div className="text-fg-faint text-sm">
              Failed to load post.{" "}
              <button
                type="button"
                className="text-brand font-semibold"
                onClick={() => void refetchPost()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <QaDetailQuestionSection
                title={post.title}
                body={post.description}
                tags={post.tags ?? []}
                likes={post.likes}
                dislikes={post.dislikes}
                vote={myPostVote}
                onVote={accessToken ? (kind) => void handleVoteQuestion(kind) : undefined}
                canVote={canVotePost}
                voting={votingPost}
              />

              {attachedPost ? <QaAttachedPostCard post={attachedPost} /> : null}

              <section className="mb-10">
                <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-fg-muted">
                    {answerCount} Community {answerCount === 1 ? "Answer" : "Answers"}
                  </h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSortOpen((v) => !v)}
                      className="flex items-center gap-1 text-brand text-sm font-bold hover:opacity-80 transition-opacity"
                    >
                      {sortLabel}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-xl z-10 w-36">
                        {(["top", "newest"] as SortKey[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSort(s);
                              setSortOpen(false);
                            }}
                            className={
                              "w-full text-left px-4 py-2 text-sm hover:bg-overlay transition-colors " +
                              (sort === s ? "text-brand font-semibold" : "text-fg-muted")
                            }
                          >
                            {s === "top" ? "Top Rated" : "Newest"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {commentsLoading ? (
                  <div className="text-fg-faint text-sm">Loading answers…</div>
                ) : answers.length === 0 ? (
                  <div className="bg-overlay border border-border-subtle rounded-2xl p-6 text-sm text-fg-muted">
                    No answers yet. Be the first.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {answers.map((a) => (
                      <QaAnswerCard
                        key={a.id}
                        answer={a}
                        replies={repliesByAnswer.get(a.id) ?? []}
                        canVote={Boolean(meId && meId !== a.user_id)}
                        initialVote={interactions?.comment_votes?.[a.id] ?? null}
                        onReply={accessToken ? (t) => handleReply(a.id, t) : undefined}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 px-6 py-5 bg-bg/85 backdrop-blur-xl border-t border-border-subtle">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 group">
            <input
              className="w-full bg-overlay border border-border-subtle rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-fg placeholder:text-fg-faint outline-none"
              placeholder="Type your answer..."
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handlePostAnswer();
                }
              }}
              disabled={posting || !accessToken}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-fg-faint hover:text-brand transition-colors"
              aria-label="Attach image"
              disabled
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handlePostAnswer()}
            disabled={posting || !newAnswer.trim() || !accessToken}
            className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Send answer"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
