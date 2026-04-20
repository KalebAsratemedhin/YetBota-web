"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Circle } from "lucide-react";
import ChatBubble from "@/components/assistant/ChatBubble";
import ChatInput from "@/components/assistant/ChatInput";
import QuickActions from "@/components/assistant/QuickActions";
import {
  INITIAL_MESSAGES,
  getMockResponse,
  RECENT_CHATS,
  SUGGESTED_TOPICS,
  type ChatMessage,
} from "@/lib/assistantMockData";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChat, setActiveChat] = useState("1");
  const [isTyping, setIsTyping] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);
    setTimeout(() => {
      const response = getMockResponse(text);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: response.text,
        placeCard: response.placeCard,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setMoreOpen(false);
  };

  const handleQuickAction = (label: string) => {
    handleSend(`Tell me about ${label.replace("#", "")}`);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#080808]">
      <aside className="hidden md:flex w-80 shrink-0 border-r border-white/5 bg-[#0d0d0d] flex-col">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-white text-sm font-semibold">Recent Chats</p>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">
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
                    ? "bg-brand/10 text-white border border-brand/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-sm shrink-0",
                    activeChat === chat.id ? "bg-brand" : "bg-gray-700"
                  )}
                />
                <span className="truncate text-xs">{chat.title}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mt-5 mb-2">
            Suggested Topics
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic.id}
                className="text-[10px] text-gray-500 hover:text-brand bg-white/5 hover:bg-brand/10 border border-white/8 hover:border-brand/30 px-2.5 py-1 rounded-full transition-colors"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#090909] shrink-0">
          <div className="flex items-center gap-2">
            <Circle className="w-2.5 h-2.5 fill-brand text-brand" />
            <span className="text-white text-sm font-semibold">Assistant Online</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-20 w-40">
                  <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
              <div className="bg-[#161616] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3 mt-6">
                <p className="text-gray-500 text-sm">Yet Bota is thinking...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 pb-5 pt-3 shrink-0 border-t border-white/5 bg-[#090909]">
          <QuickActions onSelect={handleQuickAction} />
          <ChatInput onSend={handleSend} disabled={isTyping} />
          <p className="text-center text-[10px] text-gray-700 uppercase tracking-widest mt-3">
            Powered by Yet Bota Community Engine
          </p>
        </div>
      </div>
    </div>
  );
}

