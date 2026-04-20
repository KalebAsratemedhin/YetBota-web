"use client";

import { Trees } from "lucide-react";

export default function QaDetailQuestionSection({
  title,
  body,
  tagLabel,
}: {
  title: string;
  body: string;
  tagLabel: string;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{title}</h2>
      <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">{body}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors border border-transparent dark:border-white/5"
        >
          <Trees className="w-4 h-4" />
          <span className="text-sm font-medium">{tagLabel}</span>
        </button>
      </div>
    </section>
  );
}

