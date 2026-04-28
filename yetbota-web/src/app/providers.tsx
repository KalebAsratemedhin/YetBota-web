"use client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { setCredentials, type AuthUserRef } from "@/store/authSlice";
import type { RootState } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("yetbota.localAuth");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { accessToken?: unknown; refreshToken?: unknown; user?: unknown };
      if (typeof parsed.accessToken !== "string") return;
      const user =
        typeof parsed.user === "object" && parsed.user !== null ? (parsed.user as AuthUserRef) : null;
      store.dispatch(
        setCredentials({
          accessToken: parsed.accessToken,
          refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : null,
          user,
        })
      );
      console.log("[local/auth] hydrated session from localStorage", {
        hasAccessToken: true,
        username: user?.username ?? null,
      });
    } catch (e) {
      console.warn("[local/auth] failed to hydrate session", e);
    }
  }, []);

  useEffect(() => {
    let prev: { accessToken: string | null; refreshToken: string | null; user: unknown } | null = null;
    const unsubscribe = store.subscribe(() => {
      const s = store.getState() as RootState;
      const next = { accessToken: s.auth.accessToken, refreshToken: s.auth.refreshToken, user: s.auth.user };

      if (
        prev &&
        prev.accessToken === next.accessToken &&
        prev.refreshToken === next.refreshToken &&
        JSON.stringify(prev.user) === JSON.stringify(next.user)
      ) {
        return;
      }

      prev = next;

      try {
        if (!next.accessToken) {
          window.localStorage.removeItem("yetbota.localAuth");
          return;
        }
        window.localStorage.setItem("yetbota.localAuth", JSON.stringify(next));
      } catch (e) {
        console.warn("[local/auth] failed to persist session", e);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}