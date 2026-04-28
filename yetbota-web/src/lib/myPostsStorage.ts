const KEY = "yetbota.myPostIds";

export function readMyPostIds(limit?: number): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const ids = parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    return typeof limit === "number" ? ids.slice(0, limit) : ids;
  } catch {
    return [];
  }
}

export function rememberMyPostId(id: string, max = 50) {
  if (typeof window === "undefined") return;
  const trimmed = id.trim();
  if (!trimmed) return;
  try {
    const existing = readMyPostIds();
    const next = [trimmed, ...existing.filter((x) => x !== trimmed)].slice(0, max);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

