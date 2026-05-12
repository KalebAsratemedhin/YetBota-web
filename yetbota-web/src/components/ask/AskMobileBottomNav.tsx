"use client";

import { Bell, Home, Plus, Search, User } from "lucide-react";

export default function AskMobileBottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-bg/90 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 px-6 py-3 flex justify-between items-center z-50">
      <button type="button" className="flex flex-col items-center gap-1 text-fg-muted dark:text-zinc-500">
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
      </button>
      <button type="button" className="flex flex-col items-center gap-1 text-fg-muted dark:text-zinc-500">
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
      </button>
      <button
        type="button"
        className="bg-brand p-4 rounded-full -mt-10 border-4 border-bg shadow-xl active:scale-90 transition-transform"
        aria-label="Add"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>
      <button type="button" className="flex flex-col items-center gap-1 text-fg-muted dark:text-zinc-500">
        <Bell className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
      </button>
      <button type="button" className="flex flex-col items-center gap-1 text-brand">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
      </button>
    </div>
  );
}

