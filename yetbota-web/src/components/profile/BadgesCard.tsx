import { Compass, ShieldCheck, Map, Camera, Heart, Award } from "lucide-react";
import { earnedBadges, type BadgeMeta } from "@/lib/badges";

const ICON_MAP: Record<string, React.ElementType> = {
  Compass, ShieldCheck, Map, Camera, Heart,
};

function BadgeItem({ badge }: { badge: BadgeMeta }) {
  const Icon = ICON_MAP[badge.icon] ?? Compass;
  return (
    <div className="flex flex-col items-center gap-1 w-20">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${badge.tint}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-fg-faint text-center leading-tight">
        {badge.label}
      </span>
    </div>
  );
}

export default function BadgesCard({ badges }: { badges: string[] }) {
  const earned = earnedBadges(badges);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl px-4 sm:px-6 py-4 sm:py-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fg font-semibold text-lg">Earned Badges</h3>
        {earned.length > 0 ? (
          <span className="text-fg-faint text-xs font-bold">{earned.length} earned</span>
        ) : null}
      </div>

      {earned.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-border-subtle bg-overlay text-fg-muted">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-fg-faint text-sm">No badges yet</p>
          <p className="text-fg-faint text-xs max-w-xs">
            Earn badges as your reputation score climbs — the first arrives at 1600.
          </p>
        </div>
      ) : (
        <div className="-mx-2 px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-start gap-6 min-w-max">
            {earned.map((badge) => (
              <BadgeItem key={badge.slug} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
