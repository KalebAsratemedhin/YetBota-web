import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import AssistantPlaceCard from "./AssistantPlaceCard";
import type { ChatMessage } from "@/lib/assistantMockData";
import Image from "next/image";
interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const isAI = message.role === "ai";

  if (!isAI) {
    return (
      <div className="flex justify-end items-start gap-2.5 mb-6">
        <div className="max-w-[70%]">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-right mb-1.5">You</p>
          <div className="bg-brand text-black rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm font-medium leading-relaxed">{message.text}</p>
          </div>
        </div>
        {/* User avatar */}
        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0 mt-5">
          <span className="text-black text-xs font-bold">A</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      {/* AI avatar */}
      <Image
              src="/images/logo.jpg"
              alt="Yet Bota"
              width={36}
              height={36}
              className="rounded-lg"
            />

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Yet Bota AI</p>

        {/* Message bubble */}
        <div className="bg-[#161616] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
          <p
            className="text-gray-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
          {message.placeCard && <AssistantPlaceCard place={message.placeCard} />}
        </div>

        {/* Feedback buttons */}
        <div className="flex items-center gap-2 mt-2 ml-1">
          <button
            onClick={() => setFeedback("up")}
            className={`p-1.5 rounded-lg transition-colors ${
              feedback === "up"
                ? "text-brand bg-brand/10"
                : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFeedback("down")}
            className={`p-1.5 rounded-lg transition-colors ${
              feedback === "down"
                ? "text-red-400 bg-red-400/10"
                : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}