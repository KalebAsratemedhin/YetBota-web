"use client";
import { Send, Pencil, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import Link from "next/link";

export default function AssistantSection() {
  const t = useContent();

  return (
    <section className="bg-bg py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Ask Assistant */}
        <div className="bg-bg border border-border-subtle rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-brand/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
            <h3 className="text-fg font-semibold text-lg">{t.assistant.title}</h3>
          </div>

          {/* Conversation */}
          <div className="space-y-4 mb-6">
            {/* User message */}
            <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
              <p className="text-fg text-sm">{t.assistant.exampleQuery}</p>
            </div>

            {/* AI response */}
            <div className="bg-brand/10 border border-brand/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">
                {t.assistant.label}
              </p>
              <p
                className="text-fg-muted text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t.assistant.exampleResponse.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-fg">$1</strong>'
                  ),
                }}
              />
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 bg-surface-2 border border-border-subtle rounded-2xl px-4 py-3">
            <input
              type="text"
              placeholder={t.assistant.placeholder}
              className="flex-1 bg-transparent text-sm text-fg-muted placeholder-gray-600 outline-none"
              readOnly
            />
            <Link
              href="/assistant"
              aria-label={t.nav.aiAssistant}
              className="w-8 h-8 bg-brand rounded-full flex items-center justify-center hover:bg-brand-dark transition-colors"
            >
              <Send className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>

        {/* Help the Community */}
        <div className="bg-bg border border-border-subtle rounded-3xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-brand/20 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-brand" />
            </div>
            <h3 className="text-fg font-semibold text-lg">{t.community.helpTitle}</h3>
          </div>

          {/* Question card */}
          <div className="flex-1 bg-surface-2 border border-border-subtle rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="text-fg text-sm font-semibold">{t.community.user}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand font-bold">
                  {t.community.trendingQuestion}
                </p>
              </div>
            </div>
            <p className="text-fg text-base leading-relaxed mb-4">
              {t.community.exampleQuestion}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {["B", "S"].map((initial) => (
                  <div
                    key={initial}
                    className="w-7 h-7 rounded-full bg-gray-600 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-fg"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                asChild
                className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-5 text-sm"
              >
                <Link href="/ask">
                  <Pencil className="w-3 h-3 mr-1.5" />
                  {t.community.helpOut}
                </Link>
              </Button>
            </div>
          </div>

          <Link href="/qa" className="text-sm text-fg-muted hover:text-fg transition-colors text-center">
            {t.community.browseQuestions} →
          </Link>
        </div>
      </div>
    </section>
  );
}