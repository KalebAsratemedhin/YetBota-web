import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveApiUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(resolveApiUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(resolveApiUrl("http://x.test/y")).toBe("http://x.test/y");
  });

  it("returns empty/whitespace input trimmed", () => {
    expect(resolveApiUrl("")).toBe("");
    expect(resolveApiUrl("   ")).toBe("");
  });

  it("prefixes relative paths with the configured base URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test/");
    expect(resolveApiUrl("/images/a.png")).toBe("http://api.test/images/a.png");
    expect(resolveApiUrl("images/a.png")).toBe("http://api.test/images/a.png");
  });

  it("returns the path unchanged when no base URL is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(resolveApiUrl("/images/a.png")).toBe("/images/a.png");
  });
});
