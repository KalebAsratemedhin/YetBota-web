"use client";

import { useSyncExternalStore } from "react";
import { redirect } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { isAdminRole } from "@/lib/adminRole";

// Returns false on the server and during the first client render (so SSR and
// hydration agree), then true. Lets us safely branch on client-only state
// (localStorage) without a hydration mismatch — same pattern as use-theme.
const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

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

function PortalLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <span
        className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

/**
 * Confines admins to the admin portal. Admins should only ever see /admin, not
 * the user-facing features (feed, discovery, ask, profile, …); once `getMe`
 * confirms an ADMIN role we redirect to /admin during render.
 *
 * `authedSurface` controls how the gap before the role is known is handled:
 *
 * - `true` (auth-gated pages: the (app) shell, discovery, ask): there's no
 *   content an admin should ever see, so we render a loader from the very first
 *   paint until we confirm a non-admin (or no session). The loader is rendered
 *   identically on the server and the first client render, so an admin never
 *   flashes the page even on a hard load / direct URL — and there's no hydration
 *   mismatch. The persisted token is only read *after* hydration.
 *
 * - `false` (public landing): keep server-rendering the marketing content for
 *   signed-out visitors; only hold once Redux shows a signed-in user whose role
 *   is still pending.
 */
export default function RedirectAdminsToPortal({
  children,
  authedSurface = false,
}: {
  children?: React.ReactNode;
  authedSurface?: boolean;
}) {
  const isHydrated = useIsHydrated();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isError } = useGetMeQuery(undefined, { skip: !accessToken });

  // Confirmed admin → bounce before any user content paints.
  if (accessToken && data && isAdminRole(data.user.role)) {
    redirect("/admin");
  }

  if (authedSurface) {
    if (!isHydrated) return <PortalLoader />;
    // Treat a persisted token as "signed in" too, so we keep holding while
    // Redux finishes rehydrating instead of flashing the page.
    const signedIn = Boolean(accessToken) || hasPersistedAuth();
    if (signedIn && !data && !isError) return <PortalLoader />;
    return <>{children}</>;
  }

  // Public surface: render content unless we know it's a signed-in admin.
  if (accessToken && !data && !isError) return <PortalLoader />;
  return <>{children}</>;
}
