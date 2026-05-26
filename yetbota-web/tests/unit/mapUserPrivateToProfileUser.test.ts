import { describe, expect, it } from "vitest";
import { mapUserPrivateToProfileUser } from "@/lib/mapUserPrivateToProfileUser";
import type { UserPrivate } from "@/types/auth";

function makeUser(overrides: Partial<UserPrivate> = {}): UserPrivate {
  return {
    id: "u1",
    first_name: "Abebe",
    last_name: "Kebede",
    username: "abebe",
    mobile: "+251911223344",
    rating: 1500,
    badges: ["contributor"],
    contributions: 10,
    followers: 1500,
    following: 42,
    status: "active",
    role: "Member",
    profile_url: "https://cdn.test/avatar.png",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    ...overrides,
  };
}

describe("mapUserPrivateToProfileUser", () => {
  it("builds the display name from first + last name", () => {
    expect(mapUserPrivateToProfileUser(makeUser()).name).toBe("Abebe Kebede");
  });

  it("falls back to the username when names are blank", () => {
    const user = makeUser({ first_name: "", last_name: "" });
    expect(mapUserPrivateToProfileUser(user).name).toBe("abebe");
  });

  it("ensures the username is @-prefixed exactly once", () => {
    expect(mapUserPrivateToProfileUser(makeUser({ username: "abebe" })).username).toBe("@abebe");
    expect(mapUserPrivateToProfileUser(makeUser({ username: "@abebe" })).username).toBe("@abebe");
  });

  it("formats follower counts compactly", () => {
    expect(mapUserPrivateToProfileUser(makeUser({ followers: 1_500_000 })).followers).toBe("1.5M");
    expect(mapUserPrivateToProfileUser(makeUser({ followers: 2500 })).followers).toBe("2.5k");
    expect(mapUserPrivateToProfileUser(makeUser({ followers: 999 })).followers).toBe("999");
  });

  it("derives the level from the rating, clamped to 1..99", () => {
    expect(mapUserPrivateToProfileUser(makeUser({ rating: 1500 })).level).toBe(76);
    expect(mapUserPrivateToProfileUser(makeUser({ rating: 0 })).level).toBe(1);
    expect(mapUserPrivateToProfileUser(makeUser({ rating: 99999 })).level).toBe(99);
  });

  it("passes through an absolute avatar URL and defaults badges to []", () => {
    const mapped = mapUserPrivateToProfileUser(makeUser({ badges: undefined }));
    expect(mapped.avatarUrl).toBe("https://cdn.test/avatar.png");
    expect(mapped.badges).toEqual([]);
  });
});
