import type { ProfileUser } from "@/lib/profileMockData";
import type { UserPrivate } from "@/types/auth";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

function formatFollowersLabel(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function mapUserPrivateToProfileUser(user: UserPrivate): ProfileUser {
  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
  const uname = user.username.startsWith("@") ? user.username : `@${user.username}`;
  const rating = user.rating ?? 0;
  const contributions = user.contributions ?? 0;
  const level = Math.max(1, Math.min(99, 1 + Math.floor(rating / 20)));
  const xp = contributions * 40 + Math.floor(rating * 80);
  const xpToNext = 5000;
  const progressPercent = Math.min(99, Math.max(5, Math.floor((rating % 25) * 3 + (contributions % 7) * 5)));

  return {
    name,
    username: uname,
    role: user.role || "Member",
    location: user.mobile?.trim() ? user.mobile : "—",
    followers: formatFollowersLabel(user.followers ?? 0),
    following: user.following ?? 0,
    avatarUrl: user.profile_url ? resolveApiUrl(user.profile_url) : undefined,
    level,
    xp,
    xpToNext,
    progressPercent,
  };
}
