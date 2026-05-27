"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import type { Post } from "@/types/content";

function areaLabel(post: Post): string {
  if (post.address && post.address.trim().length > 0) return post.address;
  if (
    post.location &&
    typeof post.location.latitude === "number" &&
    typeof post.location.longitude === "number"
  ) {
    return `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`;
  }
  return "Ethiopia";
}

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

// Compact preview of the post a question references (`attached_post_id`), linking
// to the full location detail. Shown only for questions that have an attachment.
export default function QaAttachedPostCard({ post }: { post: Post }) {
  const imageUrl = post.photos?.[0]?.photo_url
    ? resolveApiUrl(post.photos[0].photo_url)
    : "/images/profile/rock-hewn.webp";

  return (
    <section className="mb-12 pl-10 sm:pl-14">
      <p className="text-xs font-bold uppercase tracking-widest text-fg-muted mb-3">In reference to</p>
      <Link
        href={`/locations/${post.id}`}
        className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-3 hover:border-brand/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-overlay shrink-0">
          <Image src={imageUrl} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-fg truncate group-hover:text-brand transition-colors">{post.title}</h4>
          <p className="text-fg-faint text-xs truncate flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0 text-brand" />
            {areaLabel(post)}
          </p>
          <div className="flex items-center gap-4 mt-2 text-fg-muted text-xs">
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {compactNum(post.likes ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {compactNum(post.comments ?? 0)}
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
