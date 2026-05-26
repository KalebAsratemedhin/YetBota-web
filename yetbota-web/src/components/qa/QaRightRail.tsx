"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";
import { useTopContributors, type TopContributor } from "@/lib/useTopContributors";
import { useTrendingPosts } from "@/lib/useTrendingPosts";
import { renderBadgeIcon } from "@/lib/badges";

const CONTRIBUTORS_LIMIT = 4;
const TRENDING_LIMIT = 4;

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function ContributorAvatar({ c }: { c: TopContributor }) {
  return (
    <div className="relative shrink-0">
      <div className="w-10 h-10 rounded-full border-2 border-brand/20 overflow-hidden bg-brand/10 flex items-center justify-center">
        {c.avatarUrl ? (
          <Image
            alt={c.name}
            src={c.avatarUrl}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs font-bold text-brand">{c.initials}</span>
        )}
      </div>
      {c.topBadge && (
        <span className="absolute -bottom-1 -right-1 bg-brand w-4 h-4 rounded-full ring-2 ring-white dark:ring-[#0A0A0A] flex items-center justify-center">
          {renderBadgeIcon(c.topBadge, "w-2.5 h-2.5 text-black")}
        </span>
      )}
    </div>
  );
}

export default function QaRightRail() {
  const { contributors, isLoading } = useTopContributors(CONTRIBUTORS_LIMIT);
  const { posts: trendingQas, isLoading: qasLoading } = useTrendingPosts({
    isQuestion: true,
    limit: TRENDING_LIMIT,
  });

  // Tags surfaced from the trending questions, deduped.
  const trendingTags = useMemo(
    () => Array.from(new Set(trendingQas.flatMap((p) => p.tags ?? []))),
    [trendingQas]
  );

  return (
    <aside className="w-80 fixed inset-y-0 right-0 border-l border-brand/20 bg-bg hidden xl:flex flex-col z-50 px-6 pb-6 pt-16 space-y-8 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">Trending Q&amp;As</h3>
          <TrendingUp className="w-5 h-5 text-brand" />
        </div>

        <div className="space-y-4">
          {qasLoading
            ? Array.from({ length: TRENDING_LIMIT }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-overlay animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3 w-full rounded bg-overlay animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded bg-overlay animate-pulse" />
                  </div>
                </div>
              ))
            : trendingQas.map((p, i) => (
                <Link key={p.id} href={`/qa/${p.id}`} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-fg-faint flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {compactNum(p.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {compactNum(p.comments)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
          {!qasLoading && trendingQas.length === 0 && (
            <p className="text-xs text-fg-muted">No trending questions yet.</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-lg mb-5">Helpful Contributors</h3>
        <div className="space-y-5">
          {isLoading
            ? Array.from({ length: CONTRIBUTORS_LIMIT }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-overlay animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-overlay animate-pulse" />
                    <div className="h-2.5 w-1/2 rounded bg-overlay animate-pulse" />
                  </div>
                </div>
              ))
            : contributors.map((c) => (
                <Link key={c.id} href={c.profileHref} className="flex items-center gap-3 group">
                  <ContributorAvatar c={c} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-brand transition-colors">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {c.topBadge && (
                        <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          {c.topBadge.label}
                        </span>
                      )}
                      <span className="text-[10px] text-fg-faint">{c.rating.toLocaleString()} pts</span>
                    </div>
                  </div>
                </Link>
              ))}
          {!isLoading && contributors.length === 0 && (
            <p className="text-xs text-fg-muted">No contributors yet.</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-lg mb-4">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 bg-brand/5 border border-brand/15 rounded-lg text-sm font-medium"
            >
              #{t}
            </span>
          ))}
          {!qasLoading && trendingTags.length === 0 && (
            <p className="text-xs text-fg-muted">No tags yet.</p>
          )}
        </div>
      </div>
    </aside>
  );
}

