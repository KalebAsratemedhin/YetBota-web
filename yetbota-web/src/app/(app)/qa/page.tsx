"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import QaFeedHeader from "@/components/qa/QaFeedHeader";
import QaPostCard from "@/components/qa/QaPostCard";
import QaRightRail from "@/components/qa/QaRightRail";
import { QA_POSTS, type QaCategory } from "@/lib/qaMockData";

export default function QaFeedPage() {
  const router = useRouter();
  const [active, setActive] = useState<QaCategory>("All");

  const posts = useMemo(() => {
    if (active === "All") return QA_POSTS;
    return QA_POSTS.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(active.toLowerCase()));
  }, [active]);

  return (
    <div className="flex justify-center">
      <main className="flex-1 xl:mr-80 flex justify-center">
        <div className="w-full max-w-3xl px-4 py-8">
          <QaFeedHeader active={active} onChange={setActive} />
          <div className="mt-6 space-y-6">
            {posts.map((p) => (
              <QaPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </main>

      <QaRightRail />

      <button
        type="button"
        onClick={() => router.push("/ask")}
        className="fixed bottom-8 right-8 xl:right-[340px] w-14 h-14 bg-brand text-white rounded-full shadow-lg shadow-brand/20 items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 hidden lg:flex"
        aria-label="Ask a question"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

