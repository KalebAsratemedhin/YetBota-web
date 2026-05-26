"use client";

import { useListUsersQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import { topBadge, type BadgeMeta } from "@/lib/badges";

export interface TopContributor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  initials: string;
  profileHref: string;
  rating: number;
  badges: string[];
  topBadge: BadgeMeta | null;
}

// Top community members by reputation score, shared across the discovery rail,
// the landing "Champions" section, and the Q&A "Helpful Contributors" rail.
//
// GET /v1/users/ is public and defaults to sort_direction=desc, so passing
// sort_field=rating yields highest-scored first. role=USER excludes admins
// server-side — the public user shape omits `role`, so it can't be filtered
// after the fact.
export function useTopContributors(limit = 5) {
  const { data, isLoading, isError } = useListUsersQuery({
    sort_field: "rating",
    role: "USER",
    limit,
    resolution: "WEB",
  });

  const contributors: TopContributor[] = (data?.users ?? []).map((u) => {
    const name = `${u.first_name} ${u.last_name}`.trim() || u.username;
    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";
    return {
      id: u.id,
      name,
      username: u.username,
      avatarUrl: u.profile_url ? resolveApiUrl(u.profile_url) : null,
      initials,
      profileHref: `/users/${u.id}`,
      rating: u.rating ?? 0,
      badges: u.badges ?? [],
      topBadge: topBadge(u.badges),
    };
  });

  return { contributors, isLoading, isError };
}
