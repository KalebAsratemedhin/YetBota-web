"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";

export default function DiscoveryTopBar() {
  const pathname = usePathname();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data } = useGetMeQuery(undefined, { skip: !accessToken });
  const avatarUrl = data?.user?.profile_url ? resolveApiUrl(data.user.profile_url) : null;
  const name = data?.user ? `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.username : null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/discovery" className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight truncate">Discover</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            className={
              "flex items-center gap-2 transition-colors " +
              (pathname === "/discovery"
                ? "text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
            }
            href="/discovery"
          >
            Explore
          </Link>
          <Link
            className={
              "flex items-center gap-2 transition-colors " +
              (pathname === "/qa"
                ? "text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
            }
            href="/qa"
          >
            Q&amp;A
          </Link>
          <Link
            className={
              "flex items-center gap-2 transition-colors " +
              (pathname === "/profile"
                ? "text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
            }
            href="/profile"
          >
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-white dark:border-[#050505]" />
          </button>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-200 to-amber-500 border-2 border-white dark:border-white/10 shadow-sm overflow-hidden"
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

