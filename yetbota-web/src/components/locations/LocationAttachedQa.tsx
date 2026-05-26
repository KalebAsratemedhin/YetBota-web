"use client";

import { MessageSquareText } from "lucide-react";
import QaApiPostCard from "@/components/qa/QaApiPostCard";
import type { Post } from "@/types/content";

// Questions attached to this post, fetched via
// GET /v1/posts/?is_question=true&attached_post_id={id} (see the page).
export default function LocationAttachedQa({
  posts,
  loading,
  error,
}: {
  posts: Post[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <section className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-lg bg-brand/15 items-center justify-center text-brand">
          <MessageSquareText className="w-4 h-4" />
        </span>
        <span>Community Q&amp;A</span>
      </h2>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-2xl bg-overlay border border-border-subtle animate-pulse" />
          <div className="h-40 rounded-2xl bg-overlay border border-border-subtle animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-overlay border border-border-subtle rounded-2xl p-6 text-sm text-fg-muted">
          Failed to load questions about this place.
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-overlay border border-border-subtle rounded-2xl p-6 text-sm text-fg-muted">
          No questions about this place yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <QaApiPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </section>
  );
}
