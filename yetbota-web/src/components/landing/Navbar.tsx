"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLocale } from "@/store/localeSlice";
import type { Locale } from "@/types/landing";
import Image from "next/image";

export default function Navbar() {
  const t = useContent();
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.locale.locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.explore,     href: "/explore" },
    { label: t.nav.map,         href: "/map" },
    { label: t.nav.aiAssistant, href: "/assistant" },
    { label: t.nav.community,   href: "/community" },
  ];

  const LocalePill = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <div className="flex items-center bg-white/5 rounded-full p-0.5">
      {(["en", "am"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => dispatch(setLocale(l))}
          className={`rounded-full font-semibold transition-all ${
            size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          } ${locale === l ? "bg-white/15 text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.jpg"
              alt="Yet Bota"
              width={36}
              height={36}
              className="rounded-lg"
            />

            <span className="text-white font-bold text-lg tracking-tight">
              Yet Bota
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <LocalePill />
            <Link href="/signin" className="text-sm text-gray-300 hover:text-white transition-colors">
              {t.nav.signIn}
            </Link>
            <Button size="sm" asChild
              className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-5 text-sm h-8">
              <Link href="/signup">{t.nav.joinCommunity}</Link>
            </Button>
          </div>

          {/* Mobile: locale + Sign In + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LocalePill size="sm" />
            <Link href="/signin" className="text-sm text-gray-300 hover:text-white transition-colors px-1">
              {t.nav.signIn}
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X className="w-4 h-4 text-gray-300" />
                : <Menu className="w-4 h-4 text-gray-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-white/5 px-4 pb-5 pt-3">
          <nav className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl w-full h-10 text-sm">
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              {t.nav.joinCommunity}
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}