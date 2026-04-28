"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QaDetailHeader from "@/components/qa/QaDetailHeader";
import QaDetailHero from "@/components/qa/QaDetailHero";
import QaDetailQuestionSection from "@/components/qa/QaDetailQuestionSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateCommentMutation, useGetPostByIdQuery, useListCommentsQuery } from "@/store/api/contentApi";
import { useGetUserByIdQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";

export default function QaDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();

  const { data: postRes, isLoading: postLoading, isError: postError, refetch: refetchPost } = useGetPostByIdQuery(
    { id, resolution: "WEB" },
    { skip: !accessToken }
  );
  const post = postRes?.post;

  const { data: authorRes } = useGetUserByIdQuery(
    { id: post?.user_id ?? "", resolution: "WEB" },
    { skip: !accessToken || !post?.user_id }
  );

  const { data: commentsRes, isLoading: commentsLoading, refetch: refetchComments } = useListCommentsQuery(
    { post_id: id },
    { skip: !accessToken }
  );
  const comments = commentsRes?.comments ?? [];

  const [newAnswer, setNewAnswer] = useState("");
  const [createComment, { isLoading: posting }] = useCreateCommentMutation();

  const askedLabel = useMemo(() => {
    if (!post?.created_at) return "Asked";
    return "Asked";
  }, [post?.created_at]);

  const badgeLabel = useMemo(() => (post?.is_question ? "QUESTION" : "POST"), [post?.is_question]);

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
      toast({ variant: "destructive", title: "Failed to post", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <QaDetailHeader title="Question Details" onBack={() => router.back()} />

      <ScrollArea className="h-[calc(100vh-64px)]">
        <main className="w-full px-8 lg:px-32 py-8 pb-32">
          <QaDetailHero imageUrl="/images/profile/rock-hewn.webp" badgeLabel={badgeLabel} askedLabel={askedLabel} />

          {postLoading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : postError || !post ? (
            <div className="text-slate-500 text-sm">
              Failed to load post.{" "}
              <button type="button" className="text-brand font-semibold" onClick={() => void refetchPost()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <QaDetailQuestionSection
                title={post.title}
                body={post.description}
                tagLabel={(post.tags?.[0] ?? "Community") as string}
              />

              <section className="mb-10">
                <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    {post.comments ?? comments.length} Community Answers
                  </h3>
                  {authorRes?.user ? (
                    <span className="text-xs text-slate-500">
                      Asked by{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {authorRes.user.first_name} {authorRes.user.last_name}
                      </span>
                    </span>
                  ) : null}
                </div>

                {commentsLoading ? (
                  <div className="text-slate-500 text-sm">Loading answers…</div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <article
                        key={c.id}
                        className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-2xl p-5"
                      >
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{c.comment}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {c.upvote} up • {c.downvote} down
                          </span>
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                      </article>
                    ))}
                    {!comments.length ? (
                      <div className="text-slate-500 text-sm">No answers yet. Be the first.</div>
                    ) : null}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 px-8 lg:px-32 py-6 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5">
        <div className="w-full flex items-center gap-4">
          <div className="relative flex-1">
            <input
              className="w-full bg-slate-100 dark:bg-[#1a1a1a] border-none rounded-2xl py-4 pl-6 pr-6 focus:ring-2 focus:ring-brand transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Type your answer..."
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              disabled={posting || !accessToken}
            />
          </div>
          <Button
            type="button"
            className="bg-brand hover:bg-brand-dark text-black font-bold rounded-2xl h-14 px-6"
            disabled={posting || !newAnswer.trim() || !accessToken}
            onClick={() => void handlePostAnswer()}
          >
            {posting ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

