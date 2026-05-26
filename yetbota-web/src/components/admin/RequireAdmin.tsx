"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { isAdminRole } from "@/lib/adminRole";

type RequireAdminProps = {
  children: React.ReactNode;
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

function AdminLoading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3 text-fg-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm">Checking access…</p>
      </div>
    </div>
  );
}

/**
 * Gates the admin area to signed-in users whose role passes `isAdminRole`.
 * Role lives on `getMe` (not the redux auth slice), so we fetch it here.
 * - No auth anywhere → redirect to /signin (deferred one tick during hydration).
 * - Authed but not an admin (or the lookup failed) → redirect home.
 * - While the role resolves → render a loading screen.
 */
export default function RequireAdmin({ children }: RequireAdminProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading, isFetching, isError } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  if (!accessToken) {
    // SSR can't see localStorage — defer the decision to the client.
    if (typeof window === "undefined") return null;
    // Redux may not have hydrated from localStorage yet; hold one tick.
    if (hasPersistedAuth()) return null;
    redirect("/signin");
  }

  // Authed; waiting for the role to come back.
  if (isLoading || isFetching) return <AdminLoading />;

  // Lookup failed or returned nothing — treat as no access.
  if (isError || !data) redirect("/");

  if (!isAdminRole(data.user.role)) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg px-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <ShieldX className="h-7 w-7" />
          </div>
          <h1 className="text-fg text-lg font-bold">Admins only</h1>
          <p className="text-fg-muted text-sm">
            Your account doesn&apos;t have access to the admin panel.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to Yet Bota
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
