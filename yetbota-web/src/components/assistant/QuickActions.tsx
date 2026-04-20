import { CirclePlus, BookOpen, MessageCircle } from "lucide-react";
import { QUICK_ACTIONS } from "@/lib/assistantMockData";

const ICON_MAP: Record<string, React.ElementType> = {
  CirclePlus,
  BookOpen,
  MessageCircle,
};

interface QuickActionsProps {
  onSelect: (label: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {QUICK_ACTIONS.map((action) => {
        const Icon = ICON_MAP[action.icon];
        return (
          <button
            key={action.id}
            onClick={() => onSelect(action.label)}
            className="flex items-center gap-1.5 bg-[#161616] hover:bg-[#1a1a1a] border border-white/8 hover:border-brand/30 text-gray-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-full transition-all"
          >
            <Icon className="w-3.5 h-3.5 text-brand" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}