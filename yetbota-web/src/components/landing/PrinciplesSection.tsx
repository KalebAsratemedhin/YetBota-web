"use client";
import { Users, Bot, HandCoins, Flag } from "lucide-react";
import { useContent } from "@/lib/useContent";
import Reveal from "@/components/landing/Reveal";
import { useInView } from "@/lib/useInView";

const PRINCIPLE_ICONS: Record<string, React.ElementType> = {
  people: Users,
  ai: Bot,
  fees: HandCoins,
  digital2030: Flag,
};

export default function PrinciplesSection() {
  const t = useContent();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="bg-bg py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <h2 className="text-fg text-4xl font-extrabold mb-3">{t.principles.title}</h2>
          <p className="text-fg-faint text-base">{t.principles.subtitle}</p>
        </Reveal>

        {/* Cards grid — 3D flip-up cascade */}
        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          style={{ perspective: "1200px" }}
        >
          {t.principles.items.map((item, i) => {
            const Icon = PRINCIPLE_ICONS[item.id] ?? Flag;
            return (
              <div
                key={item.id}
                style={{ transitionDelay: inView ? `${i * 130}ms` : "0ms" }}
                className={`origin-bottom transition-all duration-700 ease-out [transform-style:preserve-3d] ${
                  inView
                    ? "opacity-100 [transform:rotateX(0deg)_translateY(0)]"
                    : "opacity-0 [transform:rotateX(-55deg)_translateY(2.5rem)]"
                }`}
              >
                <div className="h-full bg-bg border border-border-subtle rounded-3xl p-6 hover:border-brand/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brand/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="w-6 h-6 text-brand group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-fg font-bold text-base mb-3">{item.title}</h3>
                  <p className="text-fg-faint text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
