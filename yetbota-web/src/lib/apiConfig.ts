function trimOrigin(value: string | undefined, fallback: string): string {
  const v = (value ?? fallback).trim().replace(/\/+$/, "");
  return v || fallback;
}

export const API_ORIGIN = trimOrigin(process.env.NEXT_PUBLIC_API_URL, "http://localhost:8080");

export const IDENTITY_API_BASE = `${API_ORIGIN}/proxy/main/v1`;
export const CONTENT_API_BASE = `${API_ORIGIN}/proxy/content/v1`;
export const AI_API_BASE = `${API_ORIGIN}/proxy/ai/v1`;
export const IDENTITY_ORIGIN = `${API_ORIGIN}/proxy/main`;
