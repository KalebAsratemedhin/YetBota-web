"use client";

import { ChevronDown } from "lucide-react";
import type { QaDetailAnswer } from "@/lib/qaDetailMockData";
import QaAnswerCard from "@/components/qa/QaAnswerCard";

export default function QaAnswerList({
  answersCount,
  sortLabel,
  onChangeSort,
  answers,
}: {
  answersCount: number;
  sortLabel: string;
  onChangeSort: (next: string) => void;
  answers: QaDetailAnswer[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          {answersCount} Community Answers
        </h3>
        <button
          type="button"
          onClick={() => onChangeSort(sortLabel)}
          className="flex items-center gap-1 text-brand text-sm font-bold hover:opacity-80 transition-opacity"
        >
          {sortLabel} <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {answers.map((a) => (
          <QaAnswerCard key={a.id} answer={a} />
        ))}
      </div>
    </section>
  );
}

