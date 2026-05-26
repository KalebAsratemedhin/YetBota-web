import type { ProfileUser } from "@/lib/profileMockData";
import { topBadge, tierProgress } from "@/lib/badges";

export default function ReputationCard({ user }: { user: ProfileUser }) {
  const score = user.score;
  const title = topBadge(user.badges)?.label ?? "Newcomer";
  const { next, percent } = tierProgress(score);
  const ptsToNext = next ? Math.max(0, next.minScore - score) : 0;

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-fg-faint">
          Reputation Status
        </p>
        <span className="text-[10px] font-bold text-white bg-brand px-2 py-1 rounded-md">
          {score.toLocaleString()} pts
        </span>
      </div>
      <h3 className="text-fg font-extrabold text-lg mb-3">{title}</h3>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-fg-faint text-xs font-semibold">
            {next ? `Progress to ${next.label} (${next.minScore.toLocaleString()} pts)` : "Top tier reached"}
          </span>
          <span className="text-brand text-xs font-bold">{percent}%</span>
        </div>
        <div className="w-full bg-surface-3 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-brand transition-all shadow-[0px_0px_8px_0px_rgba(34,197,94,0.5)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <p className="text-fg-faint text-xs leading-relaxed">
        {next
          ? `${ptsToNext.toLocaleString()} pts until ${next.label}. Keep contributing to climb the ranks!`
          : "You've reached the highest reputation tier. 🎉"}
      </p>
    </div>
  );
}
