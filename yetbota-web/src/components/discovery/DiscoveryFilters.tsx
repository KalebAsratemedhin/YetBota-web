"use client";

import { useMemo } from "react";
import { LocateFixed, Search, TrendingUp } from "lucide-react";
import { DISCOVERY_FILTER_CHIPS } from "@/lib/discoveryMockData";
import { useTrendingPosts } from "@/lib/useTrendingPosts";

export type DiscoverySort = "proximity" | "trending" | null;

export interface DiscoveryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: DiscoverySort;
  onProximity: () => void;
  onTrending: () => void;
  tags: string[];
  onToggleTag: (tag: string) => void;
  geoError?: string | null;
}

export default function DiscoveryFilters({
  search,
  onSearchChange,
  sort,
  onProximity,
  onTrending,
  tags,
  onToggleTag,
  geoError,
}: DiscoveryFiltersProps) {
  const baseBtn = "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors";
  const activeBtn = "bg-brand text-white shadow-lg shadow-brand/20";
  const idleBtn = "hover:bg-brand/10";

  // Popular tags = the static chips plus tags surfaced from trending posts,
  // deduped (same RTK query as the right rail, so no extra request).
  const { posts: trendingPlaces } = useTrendingPosts({ isQuestion: false, limit: 4 });
  const popularTags = useMemo(
    () =>
      Array.from(
        new Set([
          ...DISCOVERY_FILTER_CHIPS.map((c) => c.id),
          ...trendingPlaces.flatMap((p) => p.tags ?? []),
        ])
      ),
    [trendingPlaces]
  );

  return (
    <div className="w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-brand transition-colors" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-bg border border-border-subtle rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all outline-none"
          placeholder="Search Ethiopian locations..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="bg-bg p-6 rounded-3xl border border-border-subtle space-y-6 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
            Discover
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onProximity}
              aria-pressed={sort === "proximity"}
              className={`${baseBtn} ${sort === "proximity" ? activeBtn : idleBtn}`}
            >
              <LocateFixed className="w-4 h-4" /> Proximity
            </button>
            <button
              type="button"
              onClick={onTrending}
              aria-pressed={sort === "trending"}
              className={`${baseBtn} ${sort === "trending" ? activeBtn : idleBtn}`}
            >
              <TrendingUp className="w-4 h-4" /> Trending
            </button>
          </div>
          {geoError ? <p className="mt-3 text-xs text-red-500">{geoError}</p> : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  aria-pressed={active}
                  className={
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors border " +
                    (active
                      ? "bg-brand text-white border-brand"
                      : "bg-brand/5 border-brand/15 hover:bg-brand/10 hover:text-brand")
                  }
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
