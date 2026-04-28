export function resolveApiUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
