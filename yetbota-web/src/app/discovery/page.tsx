"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/landing";
import DiscoveryFilters from "@/components/discovery/DiscoveryFilters";
import DiscoveryRightColumn from "@/components/discovery/DiscoveryRightColumn";
import { Coffee, LocateFixed, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLazyGetFeedQuery, useMarkFeedViewedMutation } from "@/store/api/contentApi";
import DiscoveryPostCard from "@/components/discovery/DiscoveryPostCard";
import { useAppSelector } from "@/store/hooks";
import type { Post } from "@/types/content";

const PAGE_SIZE = 15;

export default function DiscoveryPage() {
  const pathname = usePathname();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [triggerFeed, { isFetching, isError }] = useLazyGetFeedQuery();
  const [markViewed] = useMarkFeedViewedMutation();

  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [lastPageIds, setLastPageIds] = useState<string[]>([]);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const loadPage = useCallback(
    async (nextCursor?: string, viewedIds?: string[]) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        // Mark the page the user is leaving as seen so the feed advances and
        // doesn't repeat content on future loads.
        if (viewedIds && viewedIds.length > 0) {
          void markViewed({ post_ids: viewedIds }).unwrap().catch(() => {});
        }
        const res = await triggerFeed({ page_size: PAGE_SIZE, cursor: nextCursor }).unwrap();
        setPosts((prev) => (nextCursor ? [...prev, ...res.posts] : res.posts));
        setLastPageIds(res.posts.map((p) => p.id));
        setCursor(res.next_cursor || undefined);
        if (!res.next_cursor || res.posts.length === 0) setReachedEnd(true);
      } finally {
        setLoadedOnce(true);
        loadingRef.current = false;
      }
    },
    [triggerFeed, markViewed]
  );

  // Load the first feed page once auth is available; clear on sign-out.
  useEffect(() => {
    if (!accessToken) {
      setPosts([]);
      setCursor(undefined);
      setReachedEnd(false);
      setLoadedOnce(false);
      return;
    }
    void loadPage(undefined);
  }, [accessToken, loadPage]);

  const handleLoadMore = () => {
    if (!cursor || reachedEnd || isFetching) return;
    void loadPage(cursor, lastPageIds);
  };

  return (
    <div className="min-h-screen bg-bg text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <DiscoveryFilters />
        </aside>

        <section className="lg:col-span-6 space-y-8">
          {/* Mobile search + chips */}
          <div className="lg:hidden space-y-4">
            <input
              className="w-full px-4 py-3 bg-white dark:bg-surface border border-slate-200 dark:border-white/5 rounded-2xl"
              placeholder="Search locations..."
              type="text"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button className="flex-none px-4 py-2 bg-brand text-white rounded-full flex items-center gap-2">
                <LocateFixed className="w-4 h-4" /> Proximity
              </button>
              <button className="flex-none px-4 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-white/5 rounded-full flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trending
              </button>
              <button className="flex-none px-4 py-2 bg-white dark:bg-surface border border-slate-200 dark:border-white/5 rounded-full flex items-center gap-2">
                <Coffee className="w-4 h-4" /> Coffee Houses
              </button>
            </div>
          </div>

          {!mounted ? (
            <>
              <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
              <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
            </>
          ) : !accessToken ? (
            <div className="bg-overlay border border-border-subtle rounded-3xl p-8 text-center">
              <p className="text-fg font-semibold mb-1">Your feed is waiting</p>
              <p className="text-sm text-fg-muted mb-4">
                Sign in to see a personalized feed of locations from the community.
              </p>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors"
              >
                Sign in
              </Link>
            </div>
          ) : !loadedOnce ? (
            <>
              <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
              <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
            </>
          ) : isError && posts.length === 0 ? (
            <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
              Failed to load your feed.{" "}
              <button
                type="button"
                className="text-brand font-semibold"
                onClick={() => void loadPage(undefined)}
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
              Your feed is empty for now. Check back soon.
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <DiscoveryPostCard key={post.id} post={post} />
              ))}

              {!reachedEnd && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="h-11 px-8 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isFetching ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <DiscoveryRightColumn />
        </aside>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface border-t border-slate-200 dark:border-white/5 px-6 py-3 flex justify-between items-center z-40">
        <Link href="/discovery" className={pathname === "/discovery" ? "text-brand font-semibold" : "text-fg-muted"}>
          Home
        </Link>
        <Link href="/discovery" className={pathname === "/discovery" ? "text-brand font-semibold" : "text-fg-muted"}>
          Explore
        </Link>
        <Link href="/qa" className={pathname === "/qa" ? "text-brand font-semibold" : "text-fg-muted"}>
          Q&amp;A
        </Link>
        <Link
          href="/profile"
          className={pathname === "/profile" ? "text-brand font-semibold" : "text-fg-muted"}
        >
          Profile
        </Link>
      </div>
    </div>
  );
}
