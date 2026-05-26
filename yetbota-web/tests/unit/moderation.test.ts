import { describe, expect, it } from "vitest";
import {
  CASE_STATUS_META,
  formatModerationDate,
  MODERATION_STATUS_META,
  REASON_META,
  severityPriority,
  shortCaseId,
} from "@/lib/moderation";

describe("severityPriority", () => {
  it("buckets the report count into a priority + tone", () => {
    expect(severityPriority(6)).toEqual({ label: "Critical", tone: "red" });
    expect(severityPriority(10)).toEqual({ label: "Critical", tone: "red" });
    expect(severityPriority(3)).toEqual({ label: "High", tone: "orange" });
    expect(severityPriority(5)).toEqual({ label: "High", tone: "orange" });
    expect(severityPriority(2)).toEqual({ label: "Low", tone: "slate" });
    expect(severityPriority(0)).toEqual({ label: "Low", tone: "slate" });
  });
});

describe("shortCaseId", () => {
  it("takes the first UUID segment, upper-cased", () => {
    expect(shortCaseId("1234abcd-5678-90ef-ghij-klmnopqrstuv")).toBe("1234ABCD");
  });

  it("handles ids without dashes", () => {
    expect(shortCaseId("abc")).toBe("ABC");
  });
});

describe("formatModerationDate", () => {
  it("returns an em dash for unparseable input", () => {
    expect(formatModerationDate("not-a-date")).toBe("—");
  });

  it("formats a valid ISO timestamp into a non-empty label", () => {
    const out = formatModerationDate("2024-03-15T10:30:00.000Z");
    expect(out).not.toBe("—");
    expect(out).toContain("2024");
  });
});

describe("enum metadata maps", () => {
  it("maps reasons, moderation status and case status to labels", () => {
    expect(REASON_META.SPAM.label).toBe("Spam");
    expect(MODERATION_STATUS_META.REMOVED.tone).toBe("red");
    expect(CASE_STATUS_META.REJECTED.label).toBe("Dismissed");
  });
});
