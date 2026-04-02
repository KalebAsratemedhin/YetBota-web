"use client";
import { Send, Pencil, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";

export default function AssistantSection() {
  const t = useContent();

  return (
    <section className="bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Ask Assistant */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-brand/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
            <h3 className="text-white font-semibold text-lg">{t.assistant.title}</h3>
          </div>

          {/* Conversation */}
          <div className="space-y-4 mb-6">
            {/* User message */}
            <div className="bg-[#1e1e1e] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
              <p className="text-white text-sm">{t.assistant.exampleQuery}</p>
            </div>

            {/* AI response */}
            <div className="bg-brand/10 border border-brand/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">
                {t.assistant.label}
              </p>
              <p
                className="text-gray-200 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t.assistant.exampleResponse.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-white">$1</strong>'
                  ),
                }}
              />
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3">
            <input
              type="text"
              placeholder={t.assistant.placeholder}
              className="flex-1 bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none"
              readOnly
            />
            <button className="w-8 h-8 bg-brand rounded-full flex items-center justify-center hover:bg-brand-dark transition-colors">
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* Help the Community */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-brand/20 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-brand" />
            </div>
            <h3 className="text-white font-semibold text-lg">{t.community.helpTitle}</h3>
          </div>

          {/* Question card */}
          <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{t.community.user}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand font-bold">
                  {t.community.trendingQuestion}
                </p>
              </div>
            </div>
            <p className="text-white text-base leading-relaxed mb-4">
              {t.community.exampleQuestion}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {["B", "S"].map((initial) => (
                  <div
                    key={initial}
                    className="w-7 h-7 rounded-full bg-gray-600 border-2 border-[#111111] flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-5 text-sm"
              >
                <Pencil className="w-3 h-3 mr-1.5" />
                {t.community.helpOut}
              </Button>
            </div>
          </div>

          <button className="text-sm text-gray-400 hover:text-white transition-colors text-center">
            {t.community.browseQuestions} →
          </button>
        </div>
      </div>
    </section>
  );
}