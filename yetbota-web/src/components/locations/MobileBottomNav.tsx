"use client";

import { Home, Compass, Plus, Bell, User } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 dark:bg-surface/90 backdrop-blur-xl border border-slate-200 dark:border-border-subtle rounded-2xl p-2 flex items-center justify-around shadow-2xl z-50">
      <button className="p-3 text-brand" aria-label="Home">
        <Home className="w-5 h-5" />
      </button>
      <button className="p-3 text-fg-muted" aria-label="Discover">
        <Compass className="w-5 h-5" />
      </button>
      <button className="p-4 bg-brand text-white rounded-xl -mt-10 shadow-lg shadow-brand/40" aria-label="Create">
        <Plus className="w-5 h-5" />
      </button>
      <button className="p-3 text-fg-muted" aria-label="Notifications">
        <Bell className="w-5 h-5" />
      </button>
      <button className="p-3 text-fg-muted" aria-label="Profile">
        <User className="w-5 h-5" />
      </button>
    </div>
  );
}

