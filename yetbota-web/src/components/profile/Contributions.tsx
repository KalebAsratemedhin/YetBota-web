"use client";
import Image from "next/image";
import { MapPin, SlidersHorizontal, Plus } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useListMyPostsQuery } from "@/store/api/contentApi";
import type { Post } from "@/types/content";

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
  const likes = typeof post.likes === "number" && Number.isFinite(post.likes) ? post.likes : 0;
  const href = post.is_question ? `/qa/${encodeURIComponent(post.id)}` : `/locations/${encodeURIComponent(post.id)}`;
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="text-left bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden p-px group cursor-pointer hover:border-white/20 transition-colors flex flex-col"
      aria-label={`Open ${post.is_question ? "question" : "post"}: ${title}`}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
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
      <div className="p-4">
        <p className="text-white text-lg font-bold leading-7 line-clamp-1">
          {title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-300/60 shrink-0" />
          <span className="text-slate-300/70 text-xs truncate">
            {hasCoords ? `${lat!.toFixed(4)}, ${lon!.toFixed(4)}` : "Unknown location"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2.5 text-[10px]">
          <span className="text-slate-500">Added {fmtDate(post.created_at)}</span>
          <span className="text-slate-300/70">{likes} likes</span>
        </div>
      </div>
    </button>
  );
}

export default function ContributionsGrid() {
  const queryArg = useMemo(() => ({ limit: 4, page: 1, resolution: "MOBILE" as const }), []);
  const { data, isLoading } = useListMyPostsQuery(queryArg);
  const posts = data?.posts ?? [];

  return (
    <div className="bg-[#0f0f0f] border border-[#262626] rounded-2xl p-4 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-brand rounded-sm" />
            ))}
          </div>
          <h3 className="text-white font-semibold text-lg">Your Contributions</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-300/70" />
          </button>
          <Link
            href="/create"
            className="w-10 h-10 bg-brand hover:bg-[#16a34a] rounded-full flex items-center justify-center transition-colors"
            aria-label="Create post"
          >
            <Plus className="w-5 h-5 text-black" />
          </Link>
        </div>
      </div>

      {/* Responsive grid: 1 column on mobile, 2×2 on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4 flex-1 min-h-0">
        {isLoading ? (
          <>
            <div className="bg-[#171717] border border-[#262626] rounded-2xl h-48" />
            <div className="bg-[#171717] border border-[#262626] rounded-2xl h-48" />
          </>
        ) : posts.length > 0 ? (
          posts.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="col-span-1 sm:col-span-2 bg-[#171717] border border-[#262626] rounded-2xl p-6 text-sm text-gray-400 flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-semibold">No posts yet</div>
              <div className="mt-1">Create your first post and it will appear here.</div>
            </div>
            <Link
              href="/create"
              className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl bg-brand text-black font-bold hover:opacity-90"
            >
              Create post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}