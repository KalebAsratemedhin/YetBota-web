import { describe, expect, it } from "vitest";
import { earnedBadges, topBadge, tierProgress, SCALE_FLOOR } from "@/lib/badges";

describe("earnedBadges", () => {
  it("returns recognized badges in ascending tier order, ignoring input order", () => {
    const result = earnedBadges(["expert", "contributor"]);
    expect(result.map((b) => b.slug)).toEqual(["contributor", "expert"]);
  });

  it("drops unknown/reserved slugs", () => {
    const result = earnedBadges(["contributor", "totally_unknown"]);
    expect(result.map((b) => b.slug)).toEqual(["contributor"]);
  });

  it("returns [] for undefined or empty input", () => {
    expect(earnedBadges(undefined)).toEqual([]);
    expect(earnedBadges([])).toEqual([]);
  });
});

describe("topBadge", () => {
  it("returns the highest tier earned", () => {
    expect(topBadge(["contributor", "expert", "trusted_voice"])?.slug).toBe("expert");
  });

  it("returns null when nothing recognized is earned", () => {
    expect(topBadge([])).toBeNull();
    expect(topBadge(["nope"])).toBeNull();
  });
});

describe("tierProgress", () => {
  it("measures progress toward the first badge from the scale floor", () => {
    // floor 1100, next (contributor) 1600 → (1500-1100)/500 = 80%
    expect(tierProgress(1500)).toEqual({
      next: expect.objectContaining({ slug: "contributor" }),
      percent: 80,
    });
  });

  it("measures progress between two tiers using the lower tier as the floor", () => {
    // floor 1600 (contributor), next (trusted_voice) 1800 → (1700-1600)/200 = 50%
    expect(tierProgress(1700)).toEqual({
      next: expect.objectContaining({ slug: "trusted_voice" }),
      percent: 50,
    });
  });

  it("returns a full, next-less bar once the top tier is reached", () => {
    expect(tierProgress(2400)).toEqual({ next: null, percent: 100 });
    expect(tierProgress(9999)).toEqual({ next: null, percent: 100 });
  });

  it("clamps to 0 below the scale floor", () => {
    expect(SCALE_FLOOR).toBe(1100);
    expect(tierProgress(1000).percent).toBe(0);
  });
});
