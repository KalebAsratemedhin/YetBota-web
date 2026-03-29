"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Circle } from "lucide-react";
import AssistantSidebar from "@/components/assistant/AssistantSidebar";
import ChatBubble from "@/components/assistant/ChatBubble";
import ChatInput from "@/components/assistant/ChatInput";
import QuickActions from "@/components/assistant/QuickActions";
import {
  INITIAL_MESSAGES,
  getMockResponse,
  type ChatMessage,
} from "@/lib/assistantMockData";

const MOCK_USER = { name: "Alex Rivera", role: "Member" };

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChat, setActiveChat] = useState("1");
  const [isTyping, setIsTyping] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI typing delay
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
    <div className="flex h-screen bg-[#080808] overflow-hidden">

      {/* Sidebar */}
      <AssistantSidebar
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        user={MOCK_USER}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#090909] shrink-0">
          <div className="flex items-center gap-2">
            <Circle className="w-2.5 h-2.5 fill-[#1AFF6B] text-[#1AFF6B]" />
            <span className="text-white text-sm font-semibold">Assistant Online</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Clear history */}
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>

            {/* More options */}
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

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 bg-[#1AFF6B]/15 border border-[#1AFF6B]/30 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-[#1AFF6B] rounded-full animate-bounce"
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

        {/* Bottom input area */}
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