import { Compass, ShieldCheck, Map, Camera, Heart } from "lucide-react";
import { EARNED_BADGES, type Badge } from "@/lib/profileMockData";

const ICON_MAP: Record<string, React.ElementType> = {
  Compass, ShieldCheck, Map, Camera, Heart,
};

function BadgeItem({ badge }: { badge: Badge }) {
  const Icon = ICON_MAP[badge.icon] ?? Compass;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 ${badge.color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
        {badge.label}
      </span>
    </div>
  );
}

export default function BadgesCard() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Earned Badges</h3>
        <button className="text-brand text-xs font-semibold hover:text-[#00e05a] transition-colors">
          View All
        </button>
      </div>
      <div className="flex items-center gap-4">
        {EARNED_BADGES.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}