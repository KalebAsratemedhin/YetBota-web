"use client";
import { Trophy, ShieldCheck, Camera, MessageSquare, Star } from "lucide-react";
import { useContent } from "@/lib/useContent";
import { CHAMPIONS, type Champion } from "@/lib/dummydata";

// TODO: Replace with RTK Query when backend is ready:
// const { data: champions } = useGetChampionsQuery();

const BADGE_ICONS = {
  mapper: Trophy,
  guide:  ShieldCheck,
  lens:   Camera,
  qa:     MessageSquare,
};

const AVATAR_COLORS = [
  "bg-purple-700",
  "bg-teal-700",
  "bg-indigo-700",
  "bg-rose-700",
];

const ROLE_COLORS = [
  "text-yellow-400",
  "text-brand",
  "text-blue-400",
  "text-orange-400",
];

function ChampionCard({ champion, index }: { champion: Champion; index: number }) {
  const initials = champion.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const BadgeIcon = BADGE_ICONS[champion.badgeIcon];

  return (
    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 flex flex-col items-start hover:border-brand/20 transition-colors">
      {/* Avatar with badge icon */}
      <div className="relative mb-4">
        <div className={`w-16 h-16 ${AVATAR_COLORS[index]} rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-brand/40`}>
          {initials}
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center">
          <BadgeIcon className="w-3.5 h-3.5 text-brand" />
        </div>
      </div>

      {/* Name */}
      <p className="text-white font-bold text-base mb-0.5">{champion.name}</p>

      {/* Role */}
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${ROLE_COLORS[index]}`}>
        {champion.roleKey}
      </p>

      {/* Points pill */}
      <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/8 rounded-full px-3 py-1.5">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />

        <span className="text-gray-300 text-xs font-semibold">{champion.points.toLocaleString()} pts</span>
      </div>
    </div>
  );
}

export default function ChampionsSection() {
  const t = useContent();

  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl font-extrabold mb-3">{t.champions.title}</h2>
          <p className="text-gray-500 text-base">{t.champions.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CHAMPIONS.map((champion, i) => (
            <ChampionCard key={champion.id} champion={champion} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}