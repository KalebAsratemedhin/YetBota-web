"use client";
import Link from "next/link";
import Image from "next/image";
import { Globe, Share2 } from "lucide-react";
import { useContent } from "@/lib/useContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLocale } from "@/store/localeSlice";
import type { Locale } from "@/types/landing";

export default function Footer() {
  const t = useContent();
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.locale.locale);

  const navGroups = [
    t.footer.nav.discovery,
    t.footer.nav.community,
    t.footer.nav.strategy,
  ];

  return (
    <footer className="bg-bg border-t border-border-subtle pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
    <Image
      src="/images/logo.png"
      alt="Yet Bota"
      width={22}
      height={22}
      className="rounded-sm"
    />
  </div>

  <span className="text-fg font-bold text-lg">
    Yet Bota
  </span>
</div>
            <p className="text-fg-faint text-sm leading-relaxed mb-5 max-w-55">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 border border-border-subtle rounded-full flex items-center justify-center hover:border-border-subtle transition-colors">
                <Globe className="w-4 h-4 text-fg-faint" />
              </button>
              <button className="w-9 h-9 border border-border-subtle rounded-full flex items-center justify-center hover:border-border-subtle transition-colors">
                <Share2 className="w-4 h-4 text-fg-faint" />
              </button>
            </div>
          </div>

          {/* Nav groups */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-fg font-semibold text-sm mb-5">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link: string) => (
                  <li key={link}>
                  <Link
                    href="#"
                    className="relative inline-flex items-center text-fg-faint text-sm transition-colors hover:text-green-700 dark:hover:text-green-500 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-green-700 dark:after:bg-green-500 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link}
                  </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-fg-faint text-xs uppercase tracking-widest">
            {t.footer.copyright}
          </p>

          <div className="flex items-center gap-4">
           
            <div className="flex items-center gap-2 text-xs text-fg-faint">
              {(["en", "am"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch(setLocale(l))}
                  className={`hover:text-fg transition-colors ${
                    locale === l ? "text-fg font-semibold" : ""
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}