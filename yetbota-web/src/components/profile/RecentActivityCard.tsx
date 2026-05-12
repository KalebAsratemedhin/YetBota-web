import { MessageSquare, ThumbsUp, FileText, RefreshCw } from "lucide-react";
import { RECENT_ACTIVITY, type ActivityItem } from "@/lib/profileMockData";

const ACTIVITY_META: Record<ActivityItem["type"], { icon: React.ElementType; label: string; color: string }> = {
  answered: { icon: MessageSquare, label: "ANSWERED A QUESTION",  color: "text-fg-muted"  },
  liked:    { icon: ThumbsUp,      label: "LIKED A CONTRIBUTION", color: "text-fg-muted"  },
  post:     { icon: FileText,      label: "NEW POST",             color: "text-fg-muted"  },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type];
  const Icon = meta.icon;
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl px-3 sm:px-4 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3 h-3 ${meta.color} shrink-0`} />
        <span className={`text-[12px] font-bold uppercase ${meta.color}`}>
          {meta.label}
        </span>
      </div>
      <p className="text-fg text-sm leading-relaxed line-clamp-2">{item.text}</p>
      <p className="text-fg-muted text-[10px] mt-2">{item.timeAgo}</p>
    </div>
  );
}

export default function RecentActivityCard() {
  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex items-center gap-2 shrink-0">
        <RefreshCw className="w-4 h-4 text-brand" />
        <h3 className="text-fg font-semibold text-lg">Recent Activity</h3>
      </div>
      <div className="flex flex-col gap-4 min-h-0">
        {RECENT_ACTIVITY.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
      <button className="w-full rounded-xl border border-dashed border-border-subtle py-3 text-sm text-fg-faint hover:text-fg hover:border-overlay-strong transition-colors">
        Load More Activity
      </button>
    </div>
  );
}