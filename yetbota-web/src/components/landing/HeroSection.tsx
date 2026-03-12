"use client";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";

export default function HeroSection() {
  const t = useContent();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 bg-[#1AFF6B]/15 border border-[#1AFF6B]/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1AFF6B] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#1AFF6B]">
            {t.hero.badge}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          {t.hero.title}{" "}
          <span className="text-[#1AFF6B]">{t.hero.titleHighlight}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-[#1AFF6B] hover:bg-brand-dark text-black font-bold rounded-xl px-8 py-4 text-base w-full sm:w-auto"
          >
            {t.hero.ctaExplore}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8 py-4 text-base w-full sm:w-auto bg-white/5"
          >
            {t.hero.ctaContribute}
          </Button>
        </div>
      </div>
    </section>
  );
}