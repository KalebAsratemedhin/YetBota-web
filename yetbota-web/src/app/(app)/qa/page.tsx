"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import QaFeedHeader from "@/components/qa/QaFeedHeader";
import QaApiPostCard from "@/components/qa/QaApiPostCard";
import QaRightRail from "@/components/qa/QaRightRail";
import { useListPostsQuery } from "@/store/api/contentApi";
import { type QaCategory } from "@/lib/qaMockData";

export default function QaFeedPage() {
  const router = useRouter();
  const [active, setActive] = useState<QaCategory>("All");

  const { data, isLoading, isError, refetch } = useListPostsQuery({
    is_question: true,
    page: 1,
    page_size: 30,
    sort_by: "created_at",
    sort_dir: "desc",
    resolution: "WEB",
  });

  const posts = useMemo(() => {
    const all = data?.posts ?? [];
    if (active === "All") return all;
    const needle = active.toLowerCase();
    return all.filter((p) => p.tags?.some((t) => t.toLowerCase() === needle));
  }, [data?.posts, active]);

  return (
    <div className="flex justify-center">
      <main className="flex-1 min-w-0 xl:mr-80 flex justify-center">
        <div className="w-full min-w-0 max-w-3xl px-4 py-8">
          <QaFeedHeader active={active} onChange={setActive} />

          <div className="mt-6 space-y-6">
            {isLoading ? (
              <>
                <div className="h-64 rounded-2xl bg-overlay border border-border-subtle animate-pulse" />
                <div className="h-64 rounded-2xl bg-overlay border border-border-subtle animate-pulse" />
              </>
            ) : isError ? (
              <div className="bg-overlay border border-border-subtle rounded-2xl p-6 text-sm text-fg-muted">
                Failed to load questions.{" "}
                <button
                  type="button"
                  className="text-brand font-semibold"
                  onClick={() => void refetch()}
                >
                  Retry
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-overlay border border-border-subtle rounded-2xl p-6 text-sm text-fg-muted">
                {active === "All"
                  ? "No questions yet. Be the first to ask one."
                  : `No questions in “${active}” yet.`}
              </div>
            ) : (
              posts.map((p) => <QaApiPostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      </main>

      <QaRightRail />

      <button
        type="button"
        onClick={() => router.push("/ask")}
        className="fixed bottom-6 right-6 xl:right-[340px] w-14 h-14 bg-brand text-white rounded-full shadow-lg shadow-brand/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        aria-label="Ask a question"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
