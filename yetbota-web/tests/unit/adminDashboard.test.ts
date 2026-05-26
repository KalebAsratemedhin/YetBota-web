import { describe, expect, it } from "vitest";
import {
  actorInitials,
  buildSparklinePaths,
  formatActivityTime,
  formatChangePct,
  trendTone,
} from "@/lib/adminDashboard";

describe("trendTone", () => {
  it("maps direction to an accent tone", () => {
    expect(trendTone("up")).toBe("brand");
    expect(trendTone("down")).toBe("red");
    expect(trendTone("flat")).toBe("slate");
    expect(trendTone(undefined)).toBe("slate");
  });
});

describe("formatChangePct", () => {
  it("signs positive values and leaves negatives/zero as-is", () => {
    expect(formatChangePct(12)).toBe("+12%");
    expect(formatChangePct(-5)).toBe("-5%");
    expect(formatChangePct(0)).toBe("0%");
  });

  it("returns undefined when there is no value", () => {
    expect(formatChangePct(undefined)).toBeUndefined();
    expect(formatChangePct(null as unknown as number)).toBeUndefined();
  });
});

describe("buildSparklinePaths", () => {
  it("returns empty paths for an empty series", () => {
    expect(buildSparklinePaths([])).toEqual({ line: "", area: "" });
  });

  it("draws a flat mid-line for a single point", () => {
    const { line, area } = buildSparklinePaths([5]);
    expect(line).toBe("M0,50.00 L400,50.00");
    expect(area).toBe("M0,50.00 L400,50.00 V100 H0 Z");
  });

  it("draws a closed area path for multiple points", () => {
    const { line, area } = buildSparklinePaths([0, 10], 400, 100);
    expect(line).toBe("M0.00,92.00 L400.00,8.00");
    expect(area.startsWith("M0.00,92.00")).toBe(true);
    expect(area.endsWith("Z")).toBe(true);
  });
});

describe("formatActivityTime", () => {
  it("returns an empty string for unparseable input", () => {
    expect(formatActivityTime("nope")).toBe("");
  });
});

describe("actorInitials", () => {
  it("takes initials from the first two words", () => {
    expect(actorInitials("John Doe")).toBe("JD");
    expect(actorInitials("a b c")).toBe("AB");
  });

  it("uses the first two letters of a single name", () => {
    expect(actorInitials("madonna")).toBe("MA");
  });

  it("falls back to ? for empty input", () => {
    expect(actorInitials("")).toBe("?");
    expect(actorInitials("   ")).toBe("?");
  });
});
