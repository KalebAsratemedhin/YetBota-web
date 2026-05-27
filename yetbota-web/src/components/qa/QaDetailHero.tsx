"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

export default function QaDetailHero({
  imageUrl,
  badgeLabel,
  askedLabel,
}: {
  imageUrl?: string | null;
  badgeLabel: string;
  askedLabel: string;
}) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full aspect-21/9 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-brand/10">
      <Image
        alt="Question hero"
        src={imageUrl}
        fill
        className="object-cover brightness-75 dark:brightness-50"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-brand drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-sm rounded-full" />
        </div>
      </div>

      <div className="absolute top-6 left-6 flex gap-2">
        <span className="px-3 py-1.5 bg-brand/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
          {badgeLabel}
        </span>
        <span className="px-3 py-1.5 bg-black/40 text-white text-[10px] font-medium rounded-full backdrop-blur-sm">
          {askedLabel}
        </span>
      </div>
    </div>
  );
}
