import { beforeEach, describe, expect, it } from "vitest";
import { getOrCreateDeviceId } from "@/lib/deviceId";

describe("getOrCreateDeviceId", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("generates and persists a stable id", () => {
    const id = getOrCreateDeviceId();
    expect(id).toBeTruthy();
    expect(window.localStorage.getItem("yetbota.deviceId")).toBe(id);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getOrCreateDeviceId();
    const second = getOrCreateDeviceId();
    expect(second).toBe(first);
  });

  it("reuses an existing stored id", () => {
    window.localStorage.setItem("yetbota.deviceId", "preexisting-id");
    expect(getOrCreateDeviceId()).toBe("preexisting-id");
  });
});
