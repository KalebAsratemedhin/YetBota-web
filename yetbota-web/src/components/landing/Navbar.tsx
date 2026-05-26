"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutFromApp } from "@/store/authThunks";
import { setLocale } from "@/store/localeSlice";
import type { Locale } from "@/types/landing";
import { useGetMeQuery } from "@/store/api/authApi";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import HeaderNavLink from "@/components/shared/HeaderNavLink";
import UserMenu from "@/components/shared/UserMenu";

function LocalePill({
  locale,
  size = "md",
  onLocaleChange,
}: {
  locale: Locale;
  size?: "sm" | "md";
  onLocaleChange: (l: Locale) => void;
}) {
  return (
    <div className="flex items-center bg-overlay rounded-full p-0.5">
      {(["en", "am"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onLocaleChange(l)}
          className={`rounded-full font-semibold transition-all ${
            size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          } ${locale === l ? "bg-overlay-strong text-fg" : "text-fg-faint hover:text-fg-muted"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const t = useContent();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.locale.locale);
  const isSignedIn = useAppSelector((s) => Boolean(s.auth.accessToken));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: me } = useGetMeQuery(undefined, { skip: !isSignedIn });

  const profileName = useMemo(() => {
    const u = me?.user;
    if (!u) return null;
    return `${u.first_name} ${u.last_name}`.trim() || u.username;
  }, [me?.user]);

  const avatarUrl = useMemo(() => {
    const url = me?.user?.profile_url;
    return url ? resolveApiUrl(url) : null;
  }, [me?.user?.profile_url]);

  const initials = useMemo(() => {
    const u = me?.user;
    if (!u) return "YB";
    const name = `${u.first_name} ${u.last_name}`.trim() || u.username;
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [me?.user]);

  useEffect(() => {
    if (!profileOpen) return;
    function onDocPointerDown(e: PointerEvent) {
      const el = profileRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  const navLinks = [
    { id: "explore", label: t.nav.explore, href: "/discovery" },
    { id: "map", label: t.nav.map, href: "/discovery" },
    { id: "assistant", label: t.nav.aiAssistant, href: "/assistant" },
    { id: "community", label: t.nav.community, href: "/qa" },
  ];

  function handleSignOut() {
    logoutFromApp(dispatch);
    setMobileOpen(false);
    router.replace("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/images/logo.jpg" alt="Yet Bota" width={40} height={40} className="rounded-lg" />

            <span className="text-fg font-bold text-lg tracking-tight">Yet Bota</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <HeaderNavLink key={link.id} href={link.href}>
                {link.label}
              </HeaderNavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LocalePill locale={locale} onLocaleChange={(l) => dispatch(setLocale(l))} />
            {isSignedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle bg-overlay hover:bg-overlay-strong transition-colors flex items-center justify-center"
                  aria-label="Open profile menu"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={profileName ? `${profileName} avatar` : "Profile avatar"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-fg">{initials}</span>
                  )}
                </button>

                {profileOpen && (
                  <UserMenu
                    className="absolute right-0 mt-2 w-52"
                    onClose={() => setProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <>
                <Link href="/signin" className="text-sm text-fg-muted hover:text-fg transition-colors">
                  {t.nav.signIn}
                </Link>
                <Button
                  size="sm"
                  asChild
                  className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-5 text-sm h-8"
                >
                  <Link href="/signup">{t.nav.joinCommunity}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile / tablet: locale + auth + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <LocalePill locale={locale} size="sm" onLocaleChange={(l) => dispatch(setLocale(l))} />
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle bg-overlay hover:bg-overlay-strong transition-colors flex items-center justify-center"
                aria-label="Open profile menu"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={profileName ? `${profileName} avatar` : "Profile avatar"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-[11px] font-bold text-fg">{initials}</span>
                )}
              </button>
            ) : (
              <Link href="/signin" className="text-sm text-fg-muted hover:text-fg transition-colors px-1">
                {t.nav.signIn}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle hover:border-fg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4 text-fg-muted" /> : <Menu className="w-4 h-4 text-fg-muted" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile profile dropdown */}
      {isSignedIn && profileOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-50 bg-surface border-b border-border-subtle px-4 py-3">
          <div className="flex flex-col gap-1">
            <Link
              href="/profile"
              onClick={() => {
                setProfileOpen(false);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg hover:bg-overlay px-3 py-2.5 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              href="/notifications"
              onClick={() => {
                setProfileOpen(false);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg hover:bg-overlay px-3 py-2.5 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Link>
            <Link
              href="/settings"
              onClick={() => {
                setProfileOpen(false);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg hover:bg-overlay px-3 py-2.5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg hover:bg-overlay px-3 py-2.5 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              {t.nav.signOut}
            </button>
          </div>
        </div>
      )}

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface border-t border-border-subtle px-4 pb-5 pt-3">
          <nav className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-fg-muted hover:text-fg hover:bg-overlay px-3 py-2.5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isSignedIn ? (
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="w-full h-10 text-sm border-border-subtle text-fg hover:bg-overlay hover:text-fg"
              >
                <Link href="/profile" onClick={() => setMobileOpen(false)}>
                  {t.nav.profile}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-10 text-sm border-border-subtle text-fg hover:bg-overlay hover:text-fg"
              >
                <Link href="/settings" onClick={() => setMobileOpen(false)}>
                  Settings
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border-border-subtle text-fg hover:bg-overlay hover:text-fg"
                onClick={handleSignOut}
              >
                {t.nav.signOut}
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl w-full h-10 text-sm"
            >
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                {t.nav.joinCommunity}
              </Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
