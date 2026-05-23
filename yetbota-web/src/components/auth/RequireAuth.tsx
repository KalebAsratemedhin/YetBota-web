"use client";

import { redirect } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

type RequireAuthProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

function hasPersistedAuth(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("yetbota.localAuth");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { accessToken?: unknown };
    return typeof parsed.accessToken === "string" && parsed.accessToken.length > 0;
  } catch {
    return false;
  }
}

export default function RequireAuth({ children, redirectTo = "/signin" }: RequireAuthProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  if (accessToken) return <>{children}</>;

  // SSR: can't see localStorage. Render null and defer the decision to the client.
  if (typeof window === "undefined") return null;

  // Redux hasn't hydrated yet — Providers populates it from localStorage in a
  // useEffect that runs after this component mounts. If there IS a persisted
  // token, hold off for that one tick instead of bouncing a signed-in user.
  if (hasPersistedAuth()) return null;

  // No auth anywhere — redirect during render so the protected page never paints.
  redirect(redirectTo);
}
