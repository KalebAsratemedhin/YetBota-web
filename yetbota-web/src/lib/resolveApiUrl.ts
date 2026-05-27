// Same-origin reverse-proxy prefix for the main backend (kept in sync with
// baseApi). Hardcoded — not read from env — so relative media URLs always
// resolve through the proxy instead of a raw backend IP.
const MAIN_PROXY_BASE = "/proxy/main";

export function resolveApiUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${MAIN_PROXY_BASE}${path}`;
}
