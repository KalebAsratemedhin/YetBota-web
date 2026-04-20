import { MessageSquare, ThumbsUp, FileText, RefreshCw } from "lucide-react";
import { RECENT_ACTIVITY, type ActivityItem } from "@/lib/profileMockData";

const ACTIVITY_META: Record<ActivityItem["type"], { icon: React.ElementType; label: string; color: string }> = {
  answered: { icon: MessageSquare, label: "Answered a Question",  color: "text-[#22C55E]"  },
  liked:    { icon: ThumbsUp,      label: "Liked a Contribution", color: "text-blue-400"   },
  post:     { icon: FileText,      label: "New Post",             color: "text-purple-400" },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type];
  const Icon = meta.icon;
  return (
    <div className="bg-[#161616] border border-white/5 rounded-xl p-3 shrink-0">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3 h-3 ${meta.color} shrink-0`} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${meta.color}`}>
          {meta.label}
        </span>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{item.text}</p>
      <p className="text-gray-600 text-[10px] mt-1">{item.timeAgo}</p>
    </div>
  );
}

export default function RecentActivityCard() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex items-center gap-2 mb-2.5 shrink-0">
        <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
        <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
      </div>
      <div className="flex flex-col gap-2 overflow-hidden">
        {RECENT_ACTIVITY.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}