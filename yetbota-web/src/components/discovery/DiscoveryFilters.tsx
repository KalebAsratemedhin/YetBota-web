"use client";

import { Coffee, LocateFixed, Search, TrendingUp } from "lucide-react";
import { DISCOVERY_FILTER_CHIPS } from "@/lib/discoveryMockData";

export default function DiscoveryFilters() {
  return (
    <div className="w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-brand transition-colors" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-bg border border-border-subtle rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all outline-none"
          placeholder="Search Ethiopian locations..."
          type="text"
        />
      </div>

      <div className="bg-bg p-6 rounded-3xl border border-border-subtle space-y-6 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
            Discover
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 bg-brand text-white rounded-xl font-medium shadow-lg shadow-brand/20">
              <LocateFixed className="w-4 h-4" /> Proximity
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-brand/10 rounded-xl transition-colors">
              <TrendingUp className="w-4 h-4" /> Trending
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-brand/10 rounded-xl transition-colors">
              <Coffee className="w-4 h-4" /> Coffee Houses
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_FILTER_CHIPS.map((chip) => (
              <span
                key={chip.id}
                className="px-3 py-1 bg-brand/5 border border-brand/15 rounded-full text-sm font-medium hover:bg-brand/10 hover:text-brand cursor-pointer transition-colors"
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

