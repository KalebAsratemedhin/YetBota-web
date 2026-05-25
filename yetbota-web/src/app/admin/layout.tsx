"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { mapUserPrivateToSidebarUser } from "@/lib/mapUserPrivateToSidebarUser";

function AdminShell({ children }: { children: React.ReactNode }) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data } = useGetMeQuery(undefined, { skip: !accessToken });
  const user = data?.user
    ? mapUserPrivateToSidebarUser(data.user)
    : { name: "Admin", role: "Admin" };
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarUser = { name: user.name, role: user.role, avatarUrl: user.avatarUrl };

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <AdminSidebar user={sidebarUser} className="hidden lg:flex" />

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-border-subtle bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-fg text-sm font-bold">Yet Bota Admin</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute bottom-0 left-0 top-0 w-72 max-w-[85vw]">
            <AdminSidebar
              user={sidebarUser}
              className="w-full"
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-hidden pt-14 lg:pt-0">
        <div className="h-full overflow-y-auto scrollbar-themed">
          <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
