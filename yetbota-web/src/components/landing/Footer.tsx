"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Globe, Share2 } from "lucide-react";
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
    <footer className="bg-[#070707] border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
    <Image
      src="/images/logo.jpg"
      alt="Yet Bota"
      width={22}
      height={22}
      className="rounded-sm"
    />
  </div>

  <span className="text-white font-bold text-lg">
    Yet Bota
  </span>
</div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-55">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center hover:border-white/30 transition-colors">
                <Globe className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center hover:border-white/30 transition-colors">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Nav groups */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold text-sm mb-5">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link: string) => (
                  <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-500 text-sm hover:text-white transition-colors"
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
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            {t.footer.copyright}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-[#1AFF6B] text-xs font-bold uppercase tracking-widest">
              {t.footer.alignment}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {(["en", "am"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch(setLocale(l))}
                  className={`hover:text-white transition-colors ${
                    locale === l ? "text-white font-semibold" : ""
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