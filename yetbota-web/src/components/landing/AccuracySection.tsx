"use client";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useContent } from "@/lib/useContent";

export default function AccuracySection() {
  const t = useContent();

  return (
    <section className="bg-bg py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image with overlay badge */}
        <div className="relative">
          <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden border border-border-subtle">
            <Image
              src="/images/accuracy-feature.jpeg"
              alt="Crowdsourced accuracy"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Verified badge overlay */}
          <div className="absolute bottom-4 left-4 bg-bg/95 border border-border-subtle rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-fg text-sm font-semibold">{t.accuracy.verifiedBy}</p>
              <p className="text-fg-faint text-xs">{t.accuracy.lastChecked}</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-4">
            {t.accuracy.badge}
          </p>
          <h2 className="text-fg text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t.accuracy.title}
          </h2>
          <p className="text-fg-muted text-base leading-relaxed mb-8">
            {t.accuracy.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg border border-border-subtle rounded-2xl p-5">
              <p className="text-brand text-3xl font-extrabold mb-1">
                {t.accuracy.stats.verifiedSpots}
              </p>
              <p className="text-fg-faint text-xs font-semibold uppercase tracking-wider">
                {t.accuracy.stats.verifiedSpotsLabel}
              </p>
            </div>
            <div className="bg-bg border border-border-subtle rounded-2xl p-5">
              <p className="text-brand text-3xl font-extrabold mb-1">
                {t.accuracy.stats.communityLed}
              </p>
              <p className="text-fg-faint text-xs font-semibold uppercase tracking-wider">
                {t.accuracy.stats.communityLedLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}