import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as FetchBaseQueryError).data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const msg = (data as { message: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    if (typeof data === "string" && data.trim()) return data;
  }
  return "Something went wrong. Please try again.";
}
