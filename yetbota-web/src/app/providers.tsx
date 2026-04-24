"use client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { setCredentials, type AuthUserRef } from "@/store/authSlice";

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
      console.log("[local/auth] hydrated session from localStorage");
    } catch (e) {
      console.warn("[local/auth] failed to hydrate session", e);
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}