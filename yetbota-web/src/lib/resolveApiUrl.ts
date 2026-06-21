import { IDENTITY_ORIGIN } from "@/lib/apiConfig";

export function resolveApiUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${IDENTITY_ORIGIN}${path}`;
}
