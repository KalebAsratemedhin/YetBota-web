"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";

export default function AskGuidelinesCard() {
  return (
    <section className="bg-brand/5 border border-brand/30 rounded-xl p-6 flex gap-4 items-start">
      <div className="bg-brand/20 p-2 rounded-lg text-brand">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white mb-1">Community Guidelines</h2>
        <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
          Stay respectful and avoid spam to keep our community helpful. We want to ensure &apos;Yet Bota&apos;
          remains a safe place for everyone to explore Ethiopia.
        </p>
        <a className="inline-flex items-center text-brand text-sm font-semibold mt-3 hover:underline" href="#">
          Read Rules <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </section>
  );
}

