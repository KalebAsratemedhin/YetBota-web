"use client";

import { useState } from "react";
import DiscoveryFeedCard from "@/components/discovery/DiscoveryFeedCard";
import { useGetUserByIdQuery, useGetMeQuery } from "@/store/api/authApi";
import { useSavePostMutation, useUnsavePostMutation } from "@/store/api/contentApi";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import type { Post } from "@/types/content";

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default function DiscoveryPostCard({ post }: { post: Post }) {
  // GET /v1/users/{id} is a public profile read, so the author loads for
  // anonymous viewers too — no auth gate.
  const { data: authorRes } = useGetUserByIdQuery(
    { id: post.user_id, resolution: "WEB" },
    { skip: !post.user_id }
  );

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const meId = me?.user?.id;
  // Reporting requires a signed-in user who doesn't own the post (self-reports
  // are rejected server-side anyway).
  const canReport = Boolean(accessToken) && Boolean(post.user_id) && post.user_id !== meId;

  const { toast } = useToast();
  const [savePost, { isLoading: saving }] = useSavePostMutation();
  const [unsavePost, { isLoading: unsaving }] = useUnsavePostMutation();
  const [saved, setSaved] = useState(post.saved ?? false);

  async function toggleSave() {
    if (!accessToken) {
      toast({ title: "Sign in to save", description: "Create a free account to bookmark places." });
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const res = next
        ? await savePost({ id: post.id }).unwrap()
        : await unsavePost({ id: post.id }).unwrap();
      setSaved(res.saved);
    } catch {
      setSaved(!next); // revert
      toast({ variant: "destructive", title: "Couldn't update bookmark" });
    }
  }

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
          href: post.user_id ? `/users/${post.user_id}` : undefined,
          locationLabel:
            post.address && post.address.trim().length > 0
              ? post.address
              : typeof post.location?.latitude === "number" && typeof post.location?.longitude === "number"
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
        // Viewer state from the (authenticated) feed/list response; absent on
        // anonymous reads, in which case both default to off.
        liked: post.interaction === "like",
        bookmarked: post.saved ?? false,
      }}
      saved={saved}
      onToggleSave={toggleSave}
      saveLoading={saving || unsaving}
      sharePath={`/locations/${post.id}`}
      reportContentId={canReport ? post.id : undefined}
    />
  );
}
