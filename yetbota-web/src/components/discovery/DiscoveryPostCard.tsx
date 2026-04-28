"use client";

import DiscoveryFeedCard from "@/components/discovery/DiscoveryFeedCard";
import { useGetUserByIdQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import type { Post } from "@/types/content";

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default function DiscoveryPostCard({ post }: { post: Post }) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: authorRes } = useGetUserByIdQuery(
    { id: post.user_id, resolution: "WEB" },
    { skip: !accessToken || !post.user_id }
  );

  const authorName = authorRes?.user
    ? `${authorRes.user.first_name} ${authorRes.user.last_name}`.trim() || authorRes.user.username
    : "Unknown";
  const authorAvatarUrl = authorRes?.user?.profile_url
    ? resolveApiUrl(authorRes.user.profile_url)
    : "/images/profile/tomoca-coffee-on-cameroon.webp";

  return (
    <DiscoveryFeedCard
      item={{
        id: post.id,
        author: {
          name: authorName,
          avatarUrl: authorAvatarUrl,
          locationLabel:
            typeof post.location?.latitude === "number" && typeof post.location?.longitude === "number"
              ? `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`
              : "ETHIOPIA",
        },
        imageUrl: post.photos?.[0]?.photo_url ?? "/images/profile/rock-hewn.webp",
        badgeLabel: post.is_question ? "Question" : undefined,
        showOnMapLabel: "Show on Map",
        body: post.description ?? "",
        tags: post.tags ?? [],
        likes: compactNum(post.likes ?? 0),
        comments: compactNum(post.comments ?? 0),
      }}
    />
  );
}

