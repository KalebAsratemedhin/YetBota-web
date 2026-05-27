import { describe, expect, it } from "vitest";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

describe("resolveApiUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(resolveApiUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(resolveApiUrl("http://x.test/y")).toBe("http://x.test/y");
  });

  it("returns empty/whitespace input trimmed", () => {
    expect(resolveApiUrl("")).toBe("");
    expect(resolveApiUrl("   ")).toBe("");
  });

  it("prefixes relative paths with the same-origin main proxy base", () => {
    // The base is hardcoded to /proxy/main (not read from env) so relative
    // media URLs always resolve through the reverse proxy.
    expect(resolveApiUrl("/images/a.png")).toBe("/proxy/main/images/a.png");
    expect(resolveApiUrl("images/a.png")).toBe("/proxy/main/images/a.png");
  });
});
