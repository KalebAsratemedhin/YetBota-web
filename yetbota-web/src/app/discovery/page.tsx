"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/landing";
import DiscoveryFilters from "@/components/discovery/DiscoveryFilters";
import type { DiscoverySort } from "@/components/discovery/DiscoveryFilters";
import DiscoveryRightColumn from "@/components/discovery/DiscoveryRightColumn";
import { Coffee, LocateFixed, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useLazyGetFeedQuery,
  useLazyListPostsQuery,
  useMarkFeedViewedMutation,
} from "@/store/api/contentApi";
import DiscoveryPostCard from "@/components/discovery/DiscoveryPostCard";
import { useAppSelector } from "@/store/hooks";
import type { GeoLocation, ListPostsQuery, Post } from "@/types/content";

const PAGE_SIZE = 15;
const PROXIMITY_RADIUS_KM = 25;

export default function DiscoveryPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  // "Select mode": entered from another page (e.g. the Ask form) to pick a post
  // to attach to a question. Selecting a post returns to `returnTo` with the id.
  const selectMode = searchParams.get("select") === "1";
  const returnTo = searchParams.get("returnTo") || "/ask";

  function handleSelectPost(id: string) {
    router.push(`${returnTo}?attached_post_id=${encodeURIComponent(id)}`);
  }
  function cancelSelect() {
    router.push(returnTo);
  }

  // ---- Filter inputs -------------------------------------------------------
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<DiscoverySort>(null);
  const [coords, setCoords] = useState<GeoLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const proximityActive = sort === "proximity" && coords !== null;
  // Any active filter switches us from the personalized feed to /v1/posts.
  const isFiltering = Boolean(debouncedSearch || tags.length > 0 || sort === "trending" || proximityActive);

  // ---- Personalized feed (/v1/feed, auth-only, cursor-paginated) -----------
  const [triggerFeed, { isFetching: feedFetching, isError: feedError }] = useLazyGetFeedQuery();
  const [markViewed] = useMarkFeedViewedMutation();

  const [mounted, setMounted] = useState(false);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [lastPageIds, setLastPageIds] = useState<string[]>([]);
  const [feedReachedEnd, setFeedReachedEnd] = useState(false);
  const [feedLoadedOnce, setFeedLoadedOnce] = useState(false);
  const feedLoadingRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const loadFeedPage = useCallback(
    async (nextCursor?: string, viewedIds?: string[]) => {
      if (feedLoadingRef.current) return;
      feedLoadingRef.current = true;
      try {
        // Mark the page being left as seen so the feed advances and doesn't
        // repeat content on future loads.
        if (viewedIds && viewedIds.length > 0) {
          void markViewed({ post_ids: viewedIds }).unwrap().catch(() => {});
        }
        const res = await triggerFeed({ page_size: PAGE_SIZE, cursor: nextCursor }).unwrap();
        setFeedPosts((prev) => (nextCursor ? [...prev, ...res.posts] : res.posts));
        setLastPageIds(res.posts.map((p) => p.id));
        setCursor(res.next_cursor || undefined);
        if (!res.next_cursor || res.posts.length === 0) setFeedReachedEnd(true);
      } finally {
        setFeedLoadedOnce(true);
        feedLoadingRef.current = false;
      }
    },
    [triggerFeed, markViewed]
  );

  // Load the first feed page once auth is available; clear on sign-out.
  useEffect(() => {
    if (!accessToken) {
      setFeedPosts([]);
      setCursor(undefined);
      setFeedReachedEnd(false);
      setFeedLoadedOnce(false);
      return;
    }
    void loadFeedPage(undefined);
  }, [accessToken, loadFeedPage]);

  // ---- Search / filter (/v1/posts, public, page-paginated) -----------------
  const [triggerList, { isFetching: listFetching, isError: listError }] = useLazyListPostsQuery();
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoadedOnce, setSearchLoadedOnce] = useState(false);
  const searchLoadingRef = useRef(false);

  const loadSearchPage = useCallback(
    async (page: number) => {
      if (searchLoadingRef.current) return;
      searchLoadingRef.current = true;
      try {
        const query: ListPostsQuery = {
          search: debouncedSearch || undefined,
          tags: tags.length ? tags : undefined,
          sort_by: sort === "trending" ? "likes" : undefined,
          sort_dir: sort === "trending" ? "desc" : undefined,
          page,
          page_size: PAGE_SIZE,
          resolution: "WEB",
        };
        if (sort === "proximity" && coords) {
          query.near_lat = coords.latitude;
          query.near_lon = coords.longitude;
          query.radius_km = PROXIMITY_RADIUS_KM;
        }
        const res = await triggerList(query).unwrap();
        setSearchPosts((prev) => (page > 1 ? [...prev, ...res.posts] : res.posts));
        setSearchTotal(typeof res.total === "number" ? res.total : 0);
        setSearchPage(page);
      } finally {
        setSearchLoadedOnce(true);
        searchLoadingRef.current = false;
      }
    },
    [triggerList, debouncedSearch, tags, sort, coords]
  );

  // Re-run from page 1 whenever the active filter set changes.
  useEffect(() => {
    if (!isFiltering) return;
    setSearchPosts([]);
    setSearchLoadedOnce(false);
    void loadSearchPage(1);
  }, [isFiltering, loadSearchPage]);

  const searchReachedEnd = searchPosts.length >= searchTotal;

  // ---- Filter handlers -----------------------------------------------------
  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function toggleTrending() {
    setSort((s) => (s === "trending" ? null : "trending"));
  }

  function requestProximity() {
    if (sort === "proximity") {
      setSort(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Location isn't available in this browser.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setSort("proximity");
      },
      () => setGeoError("Allow location access to sort by proximity."),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setTags([]);
    setSort(null);
    setGeoError(null);
  }

  // ---- Unified "load more" -------------------------------------------------
  function handleLoadMore() {
    if (isFiltering) {
      if (searchReachedEnd || listFetching) return;
      void loadSearchPage(searchPage + 1);
    } else {
      if (!cursor || feedReachedEnd || feedFetching) return;
      void loadFeedPage(cursor, lastPageIds);
    }
  }

  const skeletons = (
    <>
      <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
      <div className="h-[640px] rounded-3xl bg-overlay border border-border-subtle" />
    </>
  );

  function renderPostList(items: Post[], canLoadMore: boolean, loading: boolean) {
    return (
      <div className="space-y-8">
        {items.map((post) =>
          selectMode ? (
            <div key={post.id} className="relative group">
              <DiscoveryPostCard post={post} />
              <button
                type="button"
                onClick={() => handleSelectPost(post.id)}
                aria-label={`Select "${post.title}"`}
                className="absolute inset-0 z-20 rounded-3xl ring-2 ring-transparent hover:ring-brand hover:bg-brand/5 transition-all flex items-start justify-center p-6"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-white font-semibold text-sm shadow-lg">
                  Select this post
                </span>
              </button>
            </div>
          ) : (
            <DiscoveryPostCard key={post.id} post={post} />
          )
        )}
        {canLoadMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="h-11 px-8 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderFeedColumn() {
    if (isFiltering) {
      if (!searchLoadedOnce) return skeletons;
      if (listError && searchPosts.length === 0) {
        return (
          <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
            Failed to load results.{" "}
            <button type="button" className="text-brand font-semibold" onClick={() => void loadSearchPage(1)}>
              Retry
            </button>
          </div>
        );
      }
      if (searchPosts.length === 0) {
        return (
          <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
            No locations match your filters.{" "}
            <button type="button" className="text-brand font-semibold" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        );
      }
      return renderPostList(searchPosts, !searchReachedEnd, listFetching);
    }

    // Personalized feed (default)
    if (!accessToken) {
      return (
        <div className="bg-overlay border border-border-subtle rounded-3xl p-8 text-center">
          <p className="text-fg font-semibold mb-1">Your feed is waiting</p>
          <p className="text-sm text-fg-muted mb-4">
            Sign in to see a personalized feed — or search and filter locations below without an account.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors"
          >
            Sign in
          </Link>
        </div>
      );
    }
    if (!feedLoadedOnce) return skeletons;
    if (feedError && feedPosts.length === 0) {
      return (
        <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
          Failed to load your feed.{" "}
          <button type="button" className="text-brand font-semibold" onClick={() => void loadFeedPage(undefined)}>
            Retry
          </button>
        </div>
      );
    }
    if (feedPosts.length === 0) {
      return (
        <div className="bg-overlay border border-border-subtle rounded-3xl p-6 text-sm text-fg-muted">
          Your feed is empty for now. Check back soon.
        </div>
      );
    }
    return renderPostList(feedPosts, !feedReachedEnd, feedFetching);
  }

  return (
    <div className="min-h-screen bg-bg text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <DiscoveryFilters
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onProximity={requestProximity}
            onTrending={toggleTrending}
            tags={tags}
            onToggleTag={toggleTag}
            geoError={geoError}
          />
        </aside>

        <section className="lg:col-span-6 space-y-8">
          {/* Select-mode banner (picking a post to attach to a question) */}
          {selectMode ? (
            <div className="sticky top-24 z-30 flex items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 backdrop-blur-md">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-fg">Pick a post to attach</p>
                <p className="text-xs text-fg-muted truncate">Tap any post below to base your question on it.</p>
              </div>
              <button
                type="button"
                onClick={cancelSelect}
                className="flex-none inline-flex items-center gap-1 rounded-full border border-border-subtle px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          ) : null}

          {/* Mobile search + chips */}
          <div className="lg:hidden space-y-4">
            <input
              className="w-full px-4 py-3 bg-white dark:bg-surface border border-slate-200 dark:border-white/5 rounded-2xl"
              placeholder="Search locations..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={requestProximity}
                aria-pressed={sort === "proximity"}
                className={
                  "flex-none px-4 py-2 rounded-full flex items-center gap-2 " +
                  (sort === "proximity"
                    ? "bg-brand text-white"
                    : "bg-white dark:bg-surface border border-slate-200 dark:border-white/5")
                }
              >
                <LocateFixed className="w-4 h-4" /> Proximity
              </button>
              <button
                type="button"
                onClick={toggleTrending}
                aria-pressed={sort === "trending"}
                className={
                  "flex-none px-4 py-2 rounded-full flex items-center gap-2 " +
                  (sort === "trending"
                    ? "bg-brand text-white"
                    : "bg-white dark:bg-surface border border-slate-200 dark:border-white/5")
                }
              >
                <TrendingUp className="w-4 h-4" /> Trending
              </button>
              <button
                type="button"
                onClick={() => toggleTag("coffee")}
                aria-pressed={tags.includes("coffee")}
                className={
                  "flex-none px-4 py-2 rounded-full flex items-center gap-2 " +
                  (tags.includes("coffee")
                    ? "bg-brand text-white"
                    : "bg-white dark:bg-surface border border-slate-200 dark:border-white/5")
                }
              >
                <Coffee className="w-4 h-4" /> Coffee Houses
              </button>
            </div>
          </div>

          {/* Active-filter header */}
          {mounted && isFiltering ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-fg-muted">
                {searchLoadedOnce ? `${searchTotal} result${searchTotal === 1 ? "" : "s"}` : "Searching…"}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-fg-muted hover:text-brand font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            </div>
          ) : null}

          {!mounted ? skeletons : renderFeedColumn()}
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
