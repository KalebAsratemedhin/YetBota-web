"use client";
import Image from "next/image";
import { MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useListPostsQuery, useListSavedPostsQuery } from "@/store/api/contentApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import type { Post } from "@/types/content";

type ContributionTab = "locations" | "questions" | "saved";

const PAGE_SIZE = 8;

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const title = typeof post.title === "string" && post.title.trim() ? post.title : "Untitled post";
  const cover = post.photos?.[0]?.photo_url;
  const lat = post.location?.latitude;
  const lon = post.location?.longitude;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  const trimmedAddress = post.address?.trim() ?? "";
  const locationLabel = trimmedAddress.length > 0
    ? trimmedAddress
    : hasCoords
      ? `${lat!.toFixed(4)}, ${lon!.toFixed(4)}`
      : "Unknown location";
  const likes = typeof post.likes === "number" && Number.isFinite(post.likes) ? post.likes : 0;
  const href = post.is_question ? `/qa/${encodeURIComponent(post.id)}` : `/locations/${encodeURIComponent(post.id)}`;
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="text-left bg-surface border border-border-subtle rounded-xl overflow-hidden group cursor-pointer hover:border-overlay-strong transition-colors flex flex-col"
      aria-label={`Open ${post.is_question ? "question" : "post"}: ${title}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#1b1b1b] to-[#0f0f0f]" />
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-fg text-sm font-semibold leading-snug line-clamp-1">
          {title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-fg-faint shrink-0" />
          <span className="text-fg-muted text-[11px] truncate">{locationLabel}</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 text-[10px]">
          <span className="text-fg-faint">{fmtDate(post.created_at)}</span>
          <span className="text-fg-muted">{likes} likes</span>
        </div>
      </div>
    </button>
  );
}

export default function ContributionsGrid({ userId: userIdProp }: { userId?: string } = {}) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const meId = me?.user?.id;
  const targetUserId = userIdProp ?? meId;
  const isSelf = !userIdProp || userIdProp === meId;

  const [tab, setTab] = useState<ContributionTab>("locations");

  const tabs = useMemo<{ key: ContributionTab; label: string }[]>(
    () => [
      { key: "locations", label: "Locations" },
      { key: "questions", label: "Q&A" },
      // Saved posts are the caller's own bookmarks — only meaningful on your profile.
      ...(isSelf ? [{ key: "saved" as const, label: "Saved" }] : []),
    ],
    [isSelf]
  );

  // Locations/Q&A both come from the post list, filtered by is_question.
  const postsArg = useMemo(
    () =>
      targetUserId && tab !== "saved"
        ? {
            user_id: targetUserId,
            is_question: tab === "questions",
            page: 1,
            page_size: PAGE_SIZE,
            sort_by: "created_at" as const,
            sort_dir: "desc" as const,
            resolution: "MOBILE" as const,
          }
        : undefined,
    [targetUserId, tab]
  );
  const { data: postsData, isFetching: postsFetching } = useListPostsQuery(postsArg ?? {}, {
    skip: !postsArg,
  });

  // Saved posts (self only) — GET /posts/?saved=true.
  const { data: savedData, isFetching: savedFetching } = useListSavedPostsQuery(
    { page: 1, page_size: PAGE_SIZE, resolution: "MOBILE" },
    { skip: tab !== "saved" || !isSelf }
  );

  const isSavedTab = tab === "saved";
  const posts = (isSavedTab ? savedData?.posts : postsData?.posts) ?? [];
  const loading = isSavedTab ? savedFetching : postsFetching;

  const emptyText = isSavedTab
    ? "You haven't saved any posts yet."
    : tab === "questions"
      ? isSelf
        ? "You haven't asked any questions yet."
        : "This user hasn't asked any questions."
      : isSelf
        ? "You haven't shared any location posts yet."
        : "This user hasn't shared any location posts.";

  return (
    <div className="bg-bg border border-border-subtle rounded-2xl p-4 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <h3 className="text-fg font-semibold text-lg">{isSelf ? "Your Contributions" : "Contributions"}</h3>
        {isSelf && (
          <Link
            href="/create"
            className="w-9 h-9 bg-brand hover:bg-brand-dark rounded-full flex items-center justify-center transition-colors shrink-0"
            aria-label="Create post"
          >
            <Plus className="w-5 h-5 text-black" />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-overlay rounded-xl p-1 mb-4 w-fit shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Compact responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        {loading && posts.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl aspect-[5/4] animate-pulse" />
          ))
        ) : posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-surface border border-border-subtle rounded-xl p-6 text-sm text-fg-muted flex items-center justify-between gap-4">
            <div>
              <div className="text-fg font-semibold">Nothing here yet</div>
              <div className="mt-1">{emptyText}</div>
            </div>
            {isSelf && !isSavedTab && (
              <Link
                href="/create"
                className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl bg-brand text-black font-bold hover:opacity-90"
              >
                Create post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
