"use client";
import { Users, Bot, HandCoins, Flag } from "lucide-react";
import { useContent } from "@/lib/useContent";

const PRINCIPLE_ICONS: Record<string, React.ElementType> = {
  people: Users,
  ai: Bot,
  fees: HandCoins,
  digital2030: Flag,
};

export default function PrinciplesSection() {
  const t = useContent();

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-white text-4xl font-extrabold mb-3">{t.principles.title}</h2>
          <p className="text-gray-500 text-base">{t.principles.subtitle}</p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.principles.items.map((item) => {
            const Icon = PRINCIPLE_ICONS[item.id] ?? Flag;
            return (
              <div
                key={item.id}
                className="bg-[#111111] border border-white/5 rounded-3xl p-6 hover:border-brand/20 transition-colors group"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brand/20 transition-colors">
                  <Icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-white font-bold text-base mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}