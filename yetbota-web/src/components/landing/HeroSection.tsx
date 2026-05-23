"use client";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import Link from "next/link";
import Reveal from "@/components/landing/Reveal";
import { ChevronDown } from "lucide-react";

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
       

        {/* Heading */}
        <Reveal>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            {t.hero.title}{" "}
            <span className="text-brand">{t.hero.titleHighlight}</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={150}>
          <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-brand hover:bg-brand-dark text-black font-bold rounded-xl px-8 py-4 text-base w-full sm:w-auto"
          >
            <Link href="/discovery">{t.hero.ctaExplore}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-2 border-white bg-white text-black font-bold hover:bg-transparent hover:text-white rounded-xl px-8 py-4 text-base w-full sm:w-auto transition-colors duration-200"
          >
            <Link href="/create">{t.hero.ctaContribute}</Link>
          </Button>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-7 h-7 text-white/70" />
      </div>
    </section>
  );
}