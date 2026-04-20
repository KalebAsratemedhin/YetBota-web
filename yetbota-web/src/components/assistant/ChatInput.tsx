"use client";
import { useState, type KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 bg-[#111111] border border-white/8 rounded-2xl px-4 py-3 focus-within:border-brand/30 transition-colors">
      <button className="text-gray-600 hover:text-gray-400 transition-colors mb-1.5 shrink-0">
        <Paperclip className="w-4 h-4 -rotate-45" />
      </button>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Yet Bota AI..."
        rows={1}
        className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none resize-none leading-relaxed"
        style={{ minHeight: "24px", maxHeight: "120px" }}
        disabled={disabled}
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="w-9 h-9 bg-brand hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center shrink-0 transition-colors"
      >
        <Send className="w-5 h-5 text-black rotate-45 mr-0.5" />
      </button>
    </div>
  );
}