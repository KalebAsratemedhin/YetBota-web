"use client";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useContent } from "@/lib/useContent";

export default function NavigationSection() {
  const t = useContent();

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <p className="text-[#1AFF6B] text-xs font-bold uppercase tracking-widest mb-4">
            {t.navigation.badge}
          </p>
          <h2 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t.navigation.title}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            {t.navigation.description}
          </p>
          <ul className="space-y-3">
            {t.navigation.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1AFF6B] shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden border border-white/5">
            <Image
              src="/images/navigation-feature.jpg"
              alt="Local navigation"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}