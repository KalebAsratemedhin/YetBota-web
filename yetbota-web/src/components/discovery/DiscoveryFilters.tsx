"use client";

import { Coffee, LocateFixed, Search, TrendingUp } from "lucide-react";
import { DISCOVERY_FILTER_CHIPS } from "@/lib/discoveryMockData";

export default function DiscoveryFilters() {
  return (
    <div className="w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all outline-none"
          placeholder="Search Ethiopian locations..."
          type="text"
        />
      </div>

      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Discover
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 bg-brand text-white rounded-xl font-medium shadow-lg shadow-brand/20">
              <LocateFixed className="w-4 h-4" /> Proximity
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <TrendingUp className="w-4 h-4" /> Trending
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <Coffee className="w-4 h-4" /> Coffee Houses
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_FILTER_CHIPS.map((chip) => (
              <span
                key={chip.id}
                className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-sm font-medium hover:text-brand cursor-pointer transition-colors"
              >
                #{chip.id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

