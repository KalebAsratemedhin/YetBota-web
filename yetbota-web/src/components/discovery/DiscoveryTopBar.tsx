"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import HeaderNavLink from "@/components/shared/HeaderNavLink";

export default function DiscoveryTopBar() {
  const pathname = usePathname();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data } = useGetMeQuery(undefined, { skip: !accessToken });
  const avatarUrl = data?.user?.profile_url ? resolveApiUrl(data.user.profile_url) : null;
  const name = data?.user ? `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.username : null;

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-8">
          <HeaderNavLink href="/discovery" active={pathname === "/discovery"}>
            Explore
          </HeaderNavLink>
          <HeaderNavLink href="/qa" active={pathname?.startsWith("/qa")}>
            Q&amp;A
          </HeaderNavLink>
          <HeaderNavLink href="/profile" active={pathname?.startsWith("/profile")}>
            Profile
          </HeaderNavLink>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <button
            className="relative p-2 text-fg-muted hover:text-fg hover:bg-overlay rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-bg" />
          </button>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-200 to-amber-500 border-2 border-border-subtle shadow-sm overflow-hidden"
          >
            <Image
              alt={name ? `${name} avatar` : "Profile avatar"}
              src={avatarUrl ?? "/images/profile/tomoca-coffee-on-cameroon.webp"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized={Boolean(avatarUrl)}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
