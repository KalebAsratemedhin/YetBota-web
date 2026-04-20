"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AskQuestionTopNav from "@/components/ask/AskQuestionTopNav";
import AskGuidelinesCard from "@/components/ask/AskGuidelinesCard";
import AskQuestionForm from "@/components/ask/AskQuestionForm";
import AskTipsRail from "@/components/ask/AskTipsRail";
import AskMobileBottomNav from "@/components/ask/AskMobileBottomNav";

const ASK_TAGS = ["Recommendations", "LocalEvents", "Safety", "General"];
const ASK_TIPS = [
  "Be specific about the location if you're looking for local recommendations.",
  "Use relevant tags so the right people see your question.",
  "Avoid posting private information like phone numbers.",
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const tagOptions = useMemo(() => ASK_TAGS, []);
  const tips = useMemo(() => ASK_TIPS, []);

  return (
    <div className="bg-background-light dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <AskQuestionTopNav title="Ask a Question" onClose={() => router.back()} onPost={() => {}} />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AskGuidelinesCard />
            <AskQuestionForm
              question={question}
              onChangeQuestion={setQuestion}
              tags={tags}
              tagOptions={tagOptions}
              onToggleTag={(t) =>
                setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
              }
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <AskTipsRail tips={tips} />
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 dark:text-zinc-600 tracking-widest">YET BOTA © 2024</p>
            </div>
          </div>
        </div>
      </main>

      <AskMobileBottomNav />
    </div>
  );
}

