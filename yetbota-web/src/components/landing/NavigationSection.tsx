"use client";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useContent } from "@/lib/useContent";
import Reveal from "@/components/landing/Reveal";

export default function NavigationSection() {
  const t = useContent();

  return (
    <section className="bg-brand/5 dark:bg-surface py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <Reveal direction="left">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-4">
            {t.navigation.badge}
          </p>
          <h2 className="text-fg text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t.navigation.title}
          </h2>
          <p className="text-fg-muted text-base leading-relaxed mb-8">
            {t.navigation.description}
          </p>
          <ul className="space-y-3">
            {t.navigation.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                <span className="text-fg-muted text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Image */}
        <Reveal direction="right" delay={150} className="relative">
          <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden border border-border-subtle group">
            <Image
              src="/images/navigation-feature.jpg"
              alt="Local navigation"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}