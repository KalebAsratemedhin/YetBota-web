import type { ProfileUser } from "@/lib/profileMockData";

export default function ReputationCard({ user }: { user: ProfileUser }) {
  const xpRemaining = user.xpToNext - user.xp;

  return (
    <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          Reputation Status
        </p>
        <span className="text-[10px] font-bold text-white bg-brand px-2 py-1 rounded-md">
          {user.xp.toLocaleString()} XP
        </span>
      </div>
      <h3 className="text-white font-extrabold text-lg mb-4">
        Level {user.level} Contributor
      </h3>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-300/60 text-xs font-semibold">
            Progress to Level {user.level + 1}
          </span>
          <span className="text-brand text-xs font-bold">{user.progressPercent}%</span>
        </div>
        <div className="w-full bg-[#262626] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-brand transition-all shadow-[0px_0px_8px_0px_rgba(34,197,94,0.5)]"
            style={{ width: `${user.progressPercent}%` }}
          />
        </div>
      </div>
      <p className="text-slate-500 text-xs leading-relaxed">
        {xpRemaining.toLocaleString()} XP until next level. Keep contributing to earn more!
      </p>
    </div>
  );
}