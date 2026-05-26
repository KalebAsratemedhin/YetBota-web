"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import HeaderNavLink from "@/components/shared/HeaderNavLink";

export default function AskQuestionTopNav({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-fg">{title}</h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <HeaderNavLink href="/discovery" active={pathname === "/discovery"}>
              Home
            </HeaderNavLink>
            <HeaderNavLink href="/discovery" active={pathname === "/explore"}>
              Explore
            </HeaderNavLink>
            <HeaderNavLink href="/qa" active={pathname?.startsWith("/qa")}>
              Q&amp;A
            </HeaderNavLink>
          </div>

          <div className="w-10 md:w-24" aria-hidden />
        </div>
      </div>
    </nav>
  );
}
