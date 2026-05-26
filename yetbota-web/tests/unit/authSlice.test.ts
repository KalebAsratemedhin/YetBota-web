import { describe, expect, it } from "vitest";
import authReducer, { logout, setCredentials, type AuthState } from "@/store/authSlice";

const initial: AuthState = { accessToken: null, refreshToken: null, user: null };

describe("authSlice", () => {
  it("stores credentials on setCredentials", () => {
    const state = authReducer(
      initial,
      setCredentials({
        accessToken: "a1",
        refreshToken: "r1",
        user: { username: "abebe" },
      }),
    );
    expect(state).toEqual({
      accessToken: "a1",
      refreshToken: "r1",
      user: { username: "abebe" },
    });
  });

  it("keeps the existing refresh token and user when omitted from the payload", () => {
    const seeded: AuthState = {
      accessToken: "old",
      refreshToken: "keep-me",
      user: { username: "abebe" },
    };
    const state = authReducer(seeded, setCredentials({ accessToken: "new" }));
    expect(state.accessToken).toBe("new");
    expect(state.refreshToken).toBe("keep-me");
    expect(state.user).toEqual({ username: "abebe" });
  });

  it("clears everything on logout", () => {
    const seeded: AuthState = {
      accessToken: "a1",
      refreshToken: "r1",
      user: { username: "abebe" },
    };
    expect(authReducer(seeded, logout())).toEqual(initial);
  });
});
