"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Hash, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import { useTrendingPosts } from "@/lib/useTrendingPosts";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import type { Post } from "@/types/content";
import Reveal from "@/components/landing/Reveal";

// Pull the top trending places, then split them across their most common tags.
const TRENDING_LIMIT = 12;
const TOP_TAGS = 3;

// Tag slugs come in lowercase/kebab; present them as a readable heading.
function displayTag(tag: string): string {
  return tag.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TrendingPlaceCard({ post }: { post: Post }) {
  const title = post.title?.trim() || "Untitled place";
  const photo = post.photos?.[0]?.photo_url ? resolveApiUrl(post.photos[0].photo_url) : null;
  const likes = typeof post.likes === "number" && Number.isFinite(post.likes) ? post.likes : 0;
  const address = post.address?.trim() || "Ethiopia";

  return (
    <Link
      href={`/locations/${post.id}`}
      className="block h-full rounded-2xl overflow-hidden bg-bg border border-border-subtle group cursor-pointer hover:border-brand/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300"
    >
      <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            unoptimized
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#1b1b1b] to-[#0f0f0f]" />
        )}
        {/* Likes — top right */}
        <span className="absolute top-2 right-2 z-10 flex items-center gap-1 text-[9px] font-medium text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full leading-tight whitespace-nowrap">
          <Heart className="w-2.5 h-2.5 fill-current" />
          {likes}
        </span>
      </div>

      <div className="p-3">
        <p className="text-fg text-xs md:text-sm font-semibold mb-1 truncate">{title}</p>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-fg-faint shrink-0" />
          <span className="text-fg-faint text-[10px] truncate">{address}</span>
        </div>
      </div>
    </Link>
  );
}

function CategoryRow({ tag, posts }: { tag: string; posts: Post[] }) {
  return (
    <div className="mb-10">
      <div className="flex items-center mb-4">
        <Hash className="w-4 h-4 text-brand mr-2 shrink-0" />
        <h3 className="text-fg font-semibold text-sm md:text-base">{displayTag(tag)}</h3>
      </div>

      {/* 2 cols on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {posts.map((post, i) => (
          <Reveal key={post.id} direction="scale" delay={i * 90} className="h-full">
            <TrendingPlaceCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-10">
      {[...Array(2)].map((_, r) => (
        <div key={r}>
          <div className="h-5 w-40 bg-overlay rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-overlay border border-border-subtle h-52 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverySection() {
  const t = useContent();
  const { posts, isLoading } = useTrendingPosts({ isQuestion: false, limit: TRENDING_LIMIT });

  // Rank tags by how often they appear across the trending places, take the top
  // three, then assign each place to the highest-ranked tag it carries so the
  // rows stay distinct (no place repeated across sections).
  const groups = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of posts) {
      for (const raw of p.tags ?? []) {
        const tag = raw.trim();
        if (tag) freq.set(tag, (freq.get(tag) ?? 0) + 1);
      }
    }
    const topTags = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_TAGS)
      .map(([tag]) => tag);

    const buckets = new Map<string, Post[]>(topTags.map((tag) => [tag, []]));
    for (const p of posts) {
      const owner = topTags.find((tag) => (p.tags ?? []).some((x) => x.trim() === tag));
      if (owner) buckets.get(owner)!.push(p);
    }
    return topTags.map((tag) => ({ tag, posts: buckets.get(tag)! })).filter((g) => g.posts.length > 0);
  }, [posts]);

  // If places exist but none carry tags, fall back to a single ungrouped row so
  // the section never reads as empty when there's real content to show.
  const showFallback = !isLoading && groups.length === 0 && posts.length > 0;

  return (
    <section className="bg-brand/5 dark:bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <Reveal className="mb-10 text-center">
          <h2 className="text-fg text-xl md:text-2xl font-bold mb-1">{t.discovery.title}</h2>
          <p className="text-fg-faint text-sm">{t.discovery.subtitle}</p>
        </Reveal>

        {isLoading ? (
          <SkeletonRows />
        ) : groups.length > 0 ? (
          groups.map((g) => <CategoryRow key={g.tag} tag={g.tag} posts={g.posts} />)
        ) : showFallback ? (
          <CategoryRow tag="Popular places" posts={posts} />
        ) : (
          <p className="text-center text-fg-faint text-sm py-8">
            {t.discovery.subtitle}
          </p>
        )}

        <Reveal direction="scale" className="flex justify-center mt-8">
          <Button
            asChild
            className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-8 py-2.5 text-sm hover:scale-105 transition-transform"
          >
            <Link href="/discovery">{t.discovery.viewFeed} →</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
