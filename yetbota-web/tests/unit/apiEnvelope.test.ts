import { describe, expect, it } from "vitest";
import { envelopeHttpStatus, isApiEnvelope, unwrapEnvelope } from "@/store/api/apiEnvelope";

describe("isApiEnvelope", () => {
  it("accepts v1 (success-only) and legacy (code + success) envelopes", () => {
    expect(isApiEnvelope({ success: true })).toBe(true);
    expect(isApiEnvelope({ code: "4000", success: false, message: "bad", data: null })).toBe(true);
  });

  it("rejects non-envelope values", () => {
    expect(isApiEnvelope(null)).toBe(false);
    expect(isApiEnvelope("string")).toBe(false);
    expect(isApiEnvelope({})).toBe(false);
    expect(isApiEnvelope({ success: "yes" })).toBe(false);
  });
});

describe("envelopeHttpStatus", () => {
  it("maps a 4-digit code to its leading HTTP status", () => {
    expect(envelopeHttpStatus("4001")).toBe(400);
    expect(envelopeHttpStatus("4040")).toBe(404);
    expect(envelopeHttpStatus("5031")).toBe(503);
  });

  it("defaults to 500 for non 4-digit codes", () => {
    expect(envelopeHttpStatus("abc")).toBe(500);
    expect(envelopeHttpStatus("200")).toBe(500);
  });
});

describe("unwrapEnvelope", () => {
  it("returns the data on success", () => {
    expect(unwrapEnvelope({ success: true, data: { id: 1 } })).toEqual({ data: { id: 1 } });
  });

  it("returns undefined data when success has no data", () => {
    expect(unwrapEnvelope({ success: true })).toEqual({ data: undefined });
  });

  it("maps a failed legacy envelope's code to an HTTP status", () => {
    const result = unwrapEnvelope({ success: false, code: "4040", message: "not found" });
    expect(result.error?.status).toBe(404);
    expect(result.data).toBeUndefined();
  });

  it("uses 400 for a failed envelope without a code", () => {
    expect(unwrapEnvelope({ success: false }).error?.status).toBe(400);
  });

  it("returns a 500 error for a non-envelope response", () => {
    expect(unwrapEnvelope("garbage").error?.status).toBe(500);
  });
});
