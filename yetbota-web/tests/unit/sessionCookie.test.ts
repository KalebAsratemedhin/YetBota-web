import { beforeEach, describe, expect, it } from "vitest";
import { clearSessionCookie, SESSION_COOKIE_NAME, setSessionCookie } from "@/lib/sessionCookie";

describe("session cookie", () => {
  beforeEach(() => {
    // Clear any cookie left by a previous test.
    clearSessionCookie();
  });

  it("sets the session cookie", () => {
    setSessionCookie();
    expect(document.cookie).toContain(`${SESSION_COOKIE_NAME}=1`);
  });

  it("clears the session cookie", () => {
    setSessionCookie();
    expect(document.cookie).toContain(SESSION_COOKIE_NAME);
    clearSessionCookie();
    expect(document.cookie).not.toContain(`${SESSION_COOKIE_NAME}=1`);
  });
});
