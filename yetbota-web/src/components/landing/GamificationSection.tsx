"use client";
import { Trophy, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/useContent";

export default function GamificationSection() {
  const t = useContent();

  return (
    <section className="bg-bg py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-4">
            {t.gamification.badge}
          </p>
          <h2 className="text-fg text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t.gamification.title}
          </h2>
          <p className="text-fg-muted text-base leading-relaxed mb-8">
            {t.gamification.description}
          </p>

          {/* Badge pills */}
          <div className="flex flex-wrap gap-2">
            {t.gamification.badges.map((b) => (
              <Badge
                key={b}
                className="bg-surface-2 border border-border-subtle text-fg-muted text-xs px-4 py-1.5 rounded-full hover:border-brand/40 hover:text-fg transition-colors cursor-default"
              >
                {b}
              </Badge>
            ))}
          </div>
        </div>

        {/* Level card */}
        <div className="bg-bg border border-border-subtle rounded-3xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Current level */}
            <div className="bg-bg rounded-2xl p-5 flex flex-col items-center text-center">
              <Trophy className="w-8 h-8 text-brand mb-3" />
              <p className="text-fg font-bold text-base mb-1">{t.gamification.levels.current}</p>
              <p className="text-fg-faint text-sm">{t.gamification.levels.currentXp}</p>
            </div>

            {/* Next level */}
            <div className="bg-bg rounded-2xl p-5 flex flex-col items-center text-center">
              <Award className="w-8 h-8 text-fg-faint mb-3" />
              <p className="text-fg font-bold text-base mb-3">{t.gamification.levels.next}</p>
              {/* Progress bar */}
              <div className="w-full bg-surface rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-brand"
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