import { Compass, ShieldCheck, Map, Camera, Heart } from "lucide-react";
import { EARNED_BADGES, type Badge } from "@/lib/profileMockData";

const ICON_MAP: Record<string, React.ElementType> = {
  Compass, ShieldCheck, Map, Camera, Heart,
};

const TINT_MAP: Record<string, string> = {
  "bg-emerald-600": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  "bg-yellow-600": "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  "bg-blue-600": "bg-blue-500/10 border-blue-500/20 text-blue-400",
  "bg-purple-600": "bg-purple-500/10 border-purple-500/20 text-purple-400",
  "bg-rose-600": "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

function BadgeItem({ badge }: { badge: Badge }) {
  const Icon = ICON_MAP[badge.icon] ?? Compass;
  const tint = TINT_MAP[badge.color] ?? "bg-overlay border-border-subtle text-fg-muted";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${tint}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-fg-faint">
        {badge.label}
      </span>
    </div>
  );
}

export default function BadgesCard() {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl px-4 sm:px-6 py-7 sm:py-9">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-fg font-semibold text-lg">Earned Badges</h3>
        <button className="text-brand text-xs font-bold hover:text-brand-dark transition-colors">
          View All
        </button>
      </div>
      <div className="-mx-2 px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start gap-6 min-w-max">
          {EARNED_BADGES.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}