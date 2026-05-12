"use client";

import { CheckCircle2 } from "lucide-react";

export default function AskTipsRail({ tips }: { tips: string[] }) {
  return (
    <div className="bg-bg border border-border-subtle rounded-xl p-6 sticky top-24">
      <h3 className="font-bold text-lg mb-4">Tips for a good post</h3>
      <ul className="space-y-4">
        {tips.map((t) => (
          <li key={t} className="flex gap-3 items-start text-sm text-slate-600 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <hr className="my-6 border-border-subtle" />

      <div className="space-y-2">
        <p className="text-xs font-bold text-fg-faint dark:text-zinc-500 uppercase">Draft Status</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Autosaved</span>
          <span className="text-xs text-fg-muted dark:text-zinc-600">Just now</span>
        </div>
      </div>
    </div>
  );
}

