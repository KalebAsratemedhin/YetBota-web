"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useTopContributors } from "@/lib/useTopContributors";
import { useTrendingPosts } from "@/lib/useTrendingPosts";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

const TOP_LIMIT = 4;
const TRENDING_LIMIT = 4;

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default function DiscoveryRightColumn() {
  const router = useRouter();
  const isSignedIn = useAppSelector((s) => Boolean(s.auth.accessToken));
  const { contributors, isLoading } = useTopContributors(TOP_LIMIT);
  const { posts: trendingPlaces, isLoading: placesLoading } = useTrendingPosts({
    isQuestion: false,
    limit: TRENDING_LIMIT,
  });

  return (
    <div className="w-full space-y-6">
      <div className="bg-bg p-6 rounded-3xl border border-border-subtle space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Trending Places</h3>
          <TrendingUp className="w-5 h-5 text-brand" />
        </div>
        <div className="space-y-4">
          {placesLoading
            ? Array.from({ length: TRENDING_LIMIT }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-overlay animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-overlay animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded bg-overlay animate-pulse" />
                  </div>
                </div>
              ))
            : trendingPlaces.map((p) => {
                const photo = p.photos?.[0]?.photo_url ? resolveApiUrl(p.photos[0].photo_url) : null;
                return (
                  <Link key={p.id} href={`/locations/${p.id}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand/10 border border-brand/20 shrink-0 flex items-center justify-center text-brand">
                      {photo ? (
                        <Image alt="" src={photo} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-brand transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-fg-faint flex items-center gap-1 truncate">
                        <Heart className="w-3 h-3 shrink-0" />
                        {compactNum(p.likes)} · {p.address?.trim() || "Ethiopia"}
                      </p>
                    </div>
                  </Link>
                );
              })}
          {!placesLoading && trendingPlaces.length === 0 && (
            <p className="text-xs text-fg-muted">No trending places yet.</p>
          )}
        </div>
      </div>

      <div className="bg-bg p-6 rounded-3xl border border-border-subtle space-y-6">
        <h3 className="font-bold text-lg">Top Travelers</h3>
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: TOP_LIMIT }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-overlay animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-overlay animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded bg-overlay animate-pulse" />
                  </div>
                </div>
              ))
            : contributors.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2">
                  <Link href={u.profileHref} className="flex items-center gap-3 min-w-0 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-brand/15 shrink-0 flex items-center justify-center">
                      {u.avatarUrl ? (
                        <Image
                          alt={u.name}
                          src={u.avatarUrl}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs font-bold text-brand">{u.initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-brand transition-colors">
                        {u.name}
                      </p>
                      <p className="text-xs text-fg-faint dark:text-slate-400 truncate">
                        {compactNum(u.rating)} pts
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
          {!isLoading && contributors.length === 0 && (
            <p className="text-xs text-fg-muted">No contributors yet.</p>
          )}
        </div>
      </div>

      {!isSignedIn && (
        <div className="bg-linear-to-br from-brand/20 to-brand/5 p-6 rounded-3xl border border-brand/20">
          <h3 className="font-bold mb-2">Join the Community</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Connect with fellow travelers and share your unique experiences across Ethiopia.
          </p>
          <Button
            onClick={() => router.push("/create")}
            className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 active:scale-95 transition-transform"
          >
            Create Post
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/create")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand/40 hover:scale-110 active:scale-90 transition-all z-50"
        aria-label="Create"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
