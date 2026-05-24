// Author score & badges — see score-badges-integration.md.
//
// Badges are served as slugs on the user object; the score is the `rating`
// field (Elo-style, starts at 1500). We reuse the existing badge icon images
// (lucide icons + tints) and label each tier with the backend's name.

export interface BadgeMeta {
  slug: string;
  label: string;
  minScore: number;
  icon: string; // lucide icon name (resolved by BadgesCard's ICON_MAP)
  tint: string; // existing tint classes from the original badge images
}

// Every user starts at 1500.
export const STARTING_SCORE = 1500;
// Bottom of the realistic score range (the doc notes scores converge down
// toward ~1100). Used as the lower anchor for progress toward the *first*
// badge so the bar is visible for users who haven't earned one yet — without
// it, a default-1500 account would read 0% all the way to 1600.
export const SCALE_FLOOR = 1100;

// The five score-based badges, in ascending tier order. Icons/tints are the
// project's current badge images, reassigned to the backend's tiers.
export const SCORE_BADGES: BadgeMeta[] = [
  { slug: "contributor", label: "Contributor", minScore: 1600, icon: "Compass", tint: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  { slug: "trusted_voice", label: "Trusted Voice", minScore: 1800, icon: "ShieldCheck", tint: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  { slug: "expert", label: "Expert", minScore: 2000, icon: "Map", tint: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { slug: "master", label: "Master", minScore: 2200, icon: "Camera", tint: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  { slug: "grandmaster", label: "Grandmaster", minScore: 2400, icon: "Heart", tint: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
];

export const BADGE_META: Record<string, BadgeMeta> = Object.fromEntries(
  SCORE_BADGES.map((b) => [b.slug, b]),
);

// Earned, recognized badges in ascending tier order. Unknown/reserved slugs
// are dropped so the UI never crashes on them.
export function earnedBadges(slugs: string[] | undefined): BadgeMeta[] {
  const set = new Set(slugs ?? []);
  return SCORE_BADGES.filter((b) => set.has(b.slug));
}

// The highest tier the user currently holds (for a title), or null.
export function topBadge(slugs: string[] | undefined): BadgeMeta | null {
  const earned = earnedBadges(slugs);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

// Progress toward the next badge tier for a given score. `next` is null once
// the top tier is reached (bar shown full).
export function tierProgress(score: number): { next: BadgeMeta | null; percent: number } {
  const nextIdx = SCORE_BADGES.findIndex((b) => score < b.minScore);
  if (nextIdx === -1) return { next: null, percent: 100 };
  const next = SCORE_BADGES[nextIdx];
  const floor = nextIdx === 0 ? SCALE_FLOOR : SCORE_BADGES[nextIdx - 1].minScore;
  const percent = Math.round(((score - floor) / (next.minScore - floor)) * 100);
  return { next, percent: Math.max(0, Math.min(100, percent)) };
}
