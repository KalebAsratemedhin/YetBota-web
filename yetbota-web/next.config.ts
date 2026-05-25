import type { NextConfig } from "next";

// HTTP backend origins. The browser never talks to these directly — it hits the
// same-origin /proxy/* prefixes below, and Next rewrites (server-to-server, no
// mixed-content rule) forward to these. Override per-environment if the backend
// later moves or gets a domain/TLS.
const MAIN_ORIGIN = process.env.BACKEND_MAIN_ORIGIN ?? "http://46.202.194.123:6699";
const CONTENT_ORIGIN = process.env.BACKEND_CONTENT_ORIGIN ?? "http://46.202.194.123:9966";
const AI_ORIGIN = process.env.BACKEND_AI_ORIGIN ?? "http://46.202.194.123:8080";

const nextConfig: NextConfig = {
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
    return [
      { source: "/proxy/main/:path*", destination: `${MAIN_ORIGIN}/:path*` },
      { source: "/proxy/content/:path*", destination: `${CONTENT_ORIGIN}/:path*` },
      { source: "/proxy/ai/:path*", destination: `${AI_ORIGIN}/:path*` },
    ];
  },
};

export default nextConfig;
