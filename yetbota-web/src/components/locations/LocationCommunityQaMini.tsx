"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import type { LocationQaItem } from "@/components/locations/LocationCommunityQa";

export default function LocationCommunityQaMini({ items }: { items: LocationQaItem[] }) {
  return (
    <section className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-flex w-7 h-7 rounded-lg bg-brand/15 items-center justify-center text-brand">
          <MessageSquareText className="w-4 h-4" />
        </span>
        <span>Community QA</span>
      </h2>

      <div className="space-y-3">
        {items.slice(0, 6).map((q) => (
          <Link
            key={q.id}
            href={`/qa/${q.id}`}
            className="block bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-2xl p-4 hover:border-brand/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-surface overflow-hidden shrink-0">
                <Image alt={q.authorName} src={q.authorAvatarUrl} width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">{q.authorName}</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-fg-faint text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {q.authorBadge}
                  </span>
                  <span className="text-[10px] text-fg-faint ml-auto shrink-0">{q.timeAgo}</span>
                </div>
                <p className="mt-1 text-slate-700 dark:text-slate-300 text-sm line-clamp-2">{q.text}</p>
                <div className="mt-2 text-xs text-fg-faint">{q.upvotes} upvotes</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

