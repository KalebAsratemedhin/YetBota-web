"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logoutFromApp } from "@/store/authThunks";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Shared account menu panel (Profile / Notifications / Settings / Sign out).
// Renders only the panel chrome + items — callers position it via `className`
// and close it via `onClose` (fired on any navigation or sign-out).
export default function UserMenu({
  className,
  onClose,
}: {
  className?: string;
  onClose: () => void;
}) {
  const t = useContent();
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleSignOut() {
    onClose();
    logoutFromApp(dispatch);
    router.replace("/");
  }

  return (
    <div
      role="menu"
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface shadow-[0px_20px_60px_-20px_rgba(0,0,0,0.3)] p-2",
        className
      )}
    >
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          role="menuitem"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-fg hover:bg-overlay transition-colors"
        >
          <Icon className="w-4 h-4 text-fg-muted shrink-0" />
          {label}
        </Link>
      ))}
      <div className="h-px bg-border-subtle my-1" />
      <button
        type="button"
        role="menuitem"
        onClick={handleSignOut}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-fg hover:bg-overlay transition-colors"
      >
        <LogOut className="w-4 h-4 text-fg-muted shrink-0" />
        {t.nav.signOut}
      </button>
    </div>
  );
}
