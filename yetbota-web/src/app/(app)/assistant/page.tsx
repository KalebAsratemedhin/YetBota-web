"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Circle } from "lucide-react";
import ChatBubble from "@/components/assistant/ChatBubble";
import ChatInput from "@/components/assistant/ChatInput";
import QuickActions from "@/components/assistant/QuickActions";
import {
  INITIAL_MESSAGES,
  RECENT_CHATS,
  SUGGESTED_TOPICS,
  type ChatMessage,
} from "@/lib/assistantMockData";
import { useChatMutation } from "@/store/api/aiApi";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/api/authApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MAX_HISTORY_TURNS = 2;

function buildPromptWithHistory(history: ChatMessage[], newText: string): string {
  const turns = history.filter((m) => !m.error).slice(-MAX_HISTORY_TURNS * 2);
  if (turns.length === 0) return newText;

  const lines: string[] = [];
  for (const m of turns) {
    const role = m.role === "user" ? "User" : "Assistant";
    lines.push(`${role}: ${m.text}`);
  }
  lines.push(`User: ${newText}`);
  return lines.join("\n");
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChat, setActiveChat] = useState("1");
  const [moreOpen, setMoreOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: me } = useGetMeQuery(undefined, { skip: !accessToken });
  const userId = me?.user?.id;

  const [chat, { isLoading: isTyping }] = useChatMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    const history = messages;
    setMessages((prev) => [...prev, userMsg]);

    try {
      const prompt = buildPromptWithHistory(history, text);
      const res = await chat({ text: prompt, user_id: userId ?? null }).unwrap();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: res.answer,
        citations: res.citations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? (err as { status?: number | string }).status
          : undefined;
      const unavailable = status === 503 || status === 504 || status === "FETCH_ERROR";
      const description = unavailable
        ? "Assistant is temporarily unavailable. Please try again in a moment."
        : "Something went wrong. Please try again.";
      toast({ variant: "destructive", title: "Couldn't reach the assistant", description });
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: "ai",
          text: description,
          timestamp: new Date(),
          error: true,
        },
      ]);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setMoreOpen(false);
  };

  const handleQuickAction = (label: string) => {
    void handleSend(`Tell me about ${label.replace("#", "")}`);
  };

  return (
    <div className="flex h-full overflow-hidden bg-bg">
      <aside className="hidden md:flex w-80 shrink-0 border-r border-border-subtle bg-surface flex-col">
        <div className="px-5 py-4 border-b border-border-subtle">
          <p className="text-fg text-sm font-semibold">Recent Chats</p>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint px-3 mb-2">
            Recent Chats
          </p>
          <div className="space-y-0.5">
            {RECENT_CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-colors",
                  activeChat === chat.id
                    ? "bg-brand/10 text-fg border border-brand/20"
                    : "text-fg-muted hover:text-fg hover:bg-overlay"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-sm shrink-0",
                    activeChat === chat.id ? "bg-brand" : "bg-fg-faint"
                  )}
                />
                <span className="truncate text-xs">{chat.title}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-faint px-3 mt-5 mb-2">
            Suggested Topics
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleQuickAction(topic.label)}
                className="text-[10px] text-fg-faint hover:text-brand bg-overlay hover:bg-brand/10 border border-border-subtle hover:border-brand/30 px-2.5 py-1 rounded-full transition-colors"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border-subtle bg-bg shrink-0">
          <div className="flex items-center gap-2">
            <Circle className="w-2.5 h-2.5 fill-brand text-brand" />
            <span className="text-fg text-sm font-semibold">Assistant Online</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-xs text-fg-faint hover:text-fg-muted transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-overlay transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-fg-faint" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-xl z-20 w-40">
                  <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 bg-brand/15 border border-brand/30 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-brand rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-surface border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3 mt-6">
                <p className="text-fg-faint text-sm">Yet Bota is thinking...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 pb-5 pt-3 shrink-0 border-t border-border-subtle bg-bg">
          <QuickActions onSelect={handleQuickAction} />
          <ChatInput onSend={(t) => void handleSend(t)} disabled={isTyping} />
          <p className="text-center text-[10px] text-fg-faint uppercase tracking-widest mt-3">
            Powered by Yet Bota Community Engine
          </p>
        </div>
      </div>
    </div>
  );
}
