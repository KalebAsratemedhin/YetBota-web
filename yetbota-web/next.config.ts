import type { NextConfig } from "next";

// HTTP backend origins. The browser never talks to these directly — it hits the
// same-origin /proxy/* prefixes below, and Next rewrites (server-to-server, no
// mixed-content rule) forward to these. Override per-environment if the backend
// later moves or gets a domain/TLS.
function backendOrigin(value: string | undefined, fallback: string): string {
  let v = (value ?? "").trim();
  // Defensive: if a whole "KEY=value" line was pasted into an env var's value
  // field, keep only the value. Only strips when the part before the first "="
  // looks like an env key (UPPER_SNAKE), so real URLs with "?a=b" are untouched.
  const eq = v.indexOf("=");
  if (eq !== -1 && /^[A-Z0-9_]+$/.test(v.slice(0, eq))) v = v.slice(eq + 1).trim();
  v = v.replace(/\/+$/, "");
  return v || fallback;
}

const MAIN_ORIGIN = backendOrigin(process.env.BACKEND_MAIN_ORIGIN, "http://46.202.194.123:6699");
const CONTENT_ORIGIN = backendOrigin(process.env.BACKEND_CONTENT_ORIGIN, "http://46.202.194.123:9966");
const AI_ORIGIN = backendOrigin(process.env.BACKEND_AI_ORIGIN, "http://46.202.194.123:8080");

const nextConfig: NextConfig = {
  // The backend APIs use trailing slashes (/posts/, /feed/, /comments/). Next's
  // default behavior 308-redirects those to the slash-less form before the proxy
  // rewrite runs, which breaks the forwarded path. Disabling it lets /proxy/*
  // preserve the slash on the way to the backend.
  skipTrailingSlashRedirect: true,
  // Emit JS source maps for the production bundle so prod-only crashes (e.g.
  // React #310) decode to real component/file names instead of minified ids.
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yetbota.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // Use :path(.*) (regex capture) instead of :path* (segment matcher): the
    // segment matcher strips a trailing slash, but the backends require it
    // (/posts/, /feed/, /comments/). The regex preserves the path verbatim.
    return [
      { source: "/proxy/main/:path(.*)", destination: `${MAIN_ORIGIN}/:path` },
      { source: "/proxy/content/:path(.*)", destination: `${CONTENT_ORIGIN}/:path` },
      { source: "/proxy/ai/:path(.*)", destination: `${AI_ORIGIN}/:path` },
    ];
  },
};

export default nextConfig;
