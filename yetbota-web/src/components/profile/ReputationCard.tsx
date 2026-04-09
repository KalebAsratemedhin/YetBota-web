import type { ProfileUser } from "@/lib/profileMockData";

export default function ReputationCard({ user }: { user: ProfileUser }) {
  const xpRemaining = user.xpToNext - user.xp;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          Reputation Status
        </p>
        <span className="text-[10px] font-bold text-brand bg-brand/15 border border-brand/20 px-2 py-0.5 rounded-full">
          {user.xp.toLocaleString()} XP
        </span>
      </div>
      <h3 className="text-white font-extrabold text-base mb-3">
        Level {user.level} Contributor
      </h3>
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs">Progress to Level {user.level + 1}</span>
          <span className="text-brand text-xs font-bold">{user.progressPercent}%</span>
        </div>
        <div className="w-full bg-[#1e1e1e] rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-brand transition-all"
            style={{ width: `${user.progressPercent}%` }}
          />
        </div>
      </div>
      <p className="text-gray-600 text-xs">
        {xpRemaining.toLocaleString()} XP until next level. Keep contributing!
      </p>
    </div>
  );
}