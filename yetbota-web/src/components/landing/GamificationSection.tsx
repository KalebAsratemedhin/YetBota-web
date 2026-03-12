"use client";
import { Trophy, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/useContent";

export default function GamificationSection() {
  const t = useContent();

  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <p className="text-[#1AFF6B] text-xs font-bold uppercase tracking-widest mb-4">
            {t.gamification.badge}
          </p>
          <h2 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t.gamification.title}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            {t.gamification.description}
          </p>

          {/* Badge pills */}
          <div className="flex flex-wrap gap-2">
            {t.gamification.badges.map((b) => (
              <Badge
                key={b}
                className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-xs px-4 py-1.5 rounded-full hover:border-[#1AFF6B]/40 hover:text-white transition-colors cursor-default"
              >
                {b}
              </Badge>
            ))}
          </div>
        </div>

        {/* Level card */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Current level */}
            <div className="bg-[#0a0a0a] rounded-2xl p-5 flex flex-col items-center text-center">
              <Trophy className="w-8 h-8 text-[#1AFF6B] mb-3" />
              <p className="text-white font-bold text-base mb-1">{t.gamification.levels.current}</p>
              <p className="text-gray-500 text-sm">{t.gamification.levels.currentXp}</p>
            </div>

            {/* Next level */}
            <div className="bg-[#0a0a0a] rounded-2xl p-5 flex flex-col items-center text-center">
              <Award className="w-8 h-8 text-gray-500 mb-3" />
              <p className="text-white font-bold text-base mb-3">{t.gamification.levels.next}</p>
              {/* Progress bar */}
              <div className="w-full bg-[#1e1e1e] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-[#1AFF6B]"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}