import { ThumbsUp, ThumbsDown, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AssistantPlaceCard from "./AssistantPlaceCard";
import type { ChatMessage } from "@/lib/assistantMockData";
import type { Citation } from "@/store/api/aiApi";

interface ChatBubbleProps {
  message: ChatMessage;
}

function citationHref(c: Citation): string {
  if (c.kind === "answer") return `/qa/${encodeURIComponent(c.source_id)}`;
  if (c.kind === "question") return `/qa/${encodeURIComponent(c.source_id)}`;
  return `/locations/${encodeURIComponent(c.source_id)}`;
}

function CitationsList({ citations }: { citations: Citation[] }) {
  const [open, setOpen] = useState(false);
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted hover:text-fg transition-colors"
      >
        Sources ({citations.length})
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {citations.map((c, i) => (
            <li
              key={`${c.source_id}-${i}`}
              className="border border-border-subtle rounded-lg p-2.5 bg-bg"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <Link
                  href={citationHref(c)}
                  className="text-[10px] uppercase tracking-wider font-bold text-brand hover:underline"
                >
                  {c.kind}
                </Link>
                <span className="text-[10px] text-fg-faint tabular-nums">
                  {Math.round(c.score * 100)}% match
                </span>
              </div>
              <p className="text-xs text-fg-muted leading-relaxed line-clamp-3">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const isAI = message.role === "ai";

  if (!isAI) {
    return (
      <div className="flex justify-end items-start gap-2.5 mb-6">
        <div className="max-w-[70%]">
          <p className="text-[10px] text-fg-faint uppercase tracking-widest text-right mb-1.5">You</p>
          <div className="bg-brand text-black rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0 mt-5">
          <span className="text-black text-xs font-bold">A</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      <Image
        src="/images/logo.jpg"
        alt="Yet Bota"
        width={36}
        height={36}
        className="rounded-lg shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint">Yet Bota AI</p>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-1.5 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            AI-generated
          </span>
        </div>

        <div
          className={
            "rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] " +
            (message.error
              ? "bg-red-500/10 border border-red-500/30"
              : "bg-surface border border-border-subtle")
          }
        >
          <p className="text-fg-muted text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          {message.placeCard && <AssistantPlaceCard place={message.placeCard} />}
          {message.citations && message.citations.length > 0 && (
            <CitationsList citations={message.citations} />
          )}
        </div>

        {!message.error && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            <button
              onClick={() => setFeedback("up")}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === "up"
                  ? "text-brand bg-brand/10"
                  : "text-fg-faint hover:text-fg-muted hover:bg-overlay"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFeedback("down")}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === "down"
                  ? "text-red-400 bg-red-400/10"
                  : "text-fg-faint hover:text-fg-muted hover:bg-overlay"
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
