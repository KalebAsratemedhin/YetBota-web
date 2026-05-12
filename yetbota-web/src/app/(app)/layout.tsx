"use client";

import { useState } from "react";
import AppSidebar from "@/components/shared/AppSidebar";
import { MOCK_PROFILE_USER } from "@/lib/profileMockData";
import { Menu, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { mapUserPrivateToSidebarUser } from "@/lib/mapUserPrivateToSidebarUser";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data } = useGetMeQuery(undefined, { skip: !accessToken });
  const user = data?.user ? mapUserPrivateToSidebarUser(data.user) : { name: MOCK_PROFILE_USER.name, role: MOCK_PROFILE_USER.role, level: MOCK_PROFILE_USER.level };
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-bg overflow-hidden">
      <AppSidebar
        user={{ name: user.name, role: user.role, level: user.level, avatarUrl: user.avatarUrl }}
        className="hidden lg:flex"
      />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur border-b border-border-subtle">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-border-subtle text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-fg font-bold text-sm">Yet Bota</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-60">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw]">
            <AppSidebar
              user={{ name: user.name, role: user.role, level: user.level, avatarUrl: user.avatarUrl }}
              className="w-full"
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-hidden pt-14 lg:pt-0">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

