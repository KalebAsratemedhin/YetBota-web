import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "@/lib/authErrors";

const FALLBACK = "Something went wrong. Please try again.";

describe("getAuthErrorMessage", () => {
  it("extracts a string message from the error data object", () => {
    expect(getAuthErrorMessage({ status: 400, data: { message: "Invalid credentials" } })).toBe(
      "Invalid credentials",
    );
  });

  it("uses a plain-string error body", () => {
    expect(getAuthErrorMessage({ status: 500, data: "Server exploded" })).toBe("Server exploded");
  });

  it("falls back when the message is blank or whitespace", () => {
    expect(getAuthErrorMessage({ status: 400, data: { message: "   " } })).toBe(FALLBACK);
    expect(getAuthErrorMessage({ status: 400, data: "  " })).toBe(FALLBACK);
  });

  it("falls back for non-error shapes", () => {
    expect(getAuthErrorMessage(undefined)).toBe(FALLBACK);
    expect(getAuthErrorMessage(null)).toBe(FALLBACK);
    expect(getAuthErrorMessage(42)).toBe(FALLBACK);
    expect(getAuthErrorMessage({ status: 400, data: { code: 7 } })).toBe(FALLBACK);
  });
});
