"use client";

import DiscoveryTopBar from "@/components/discovery/DiscoveryTopBar";
import DiscoveryFilters from "@/components/discovery/DiscoveryFilters";
import DiscoveryFeedCard from "@/components/discovery/DiscoveryFeedCard";
import DiscoveryRightColumn from "@/components/discovery/DiscoveryRightColumn";
import { DISCOVERY_FEED } from "@/lib/discoveryMockData";
import { Coffee, LocateFixed, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DiscoveryPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-900 dark:text-slate-100">
      <DiscoveryTopBar />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <DiscoveryFilters />
        </aside>

        <section className="lg:col-span-6 space-y-8">
          {/* Mobile search + chips */}
          <div className="lg:hidden space-y-4">
            <input
              className="w-full px-4 py-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-2xl"
              placeholder="Search locations..."
              type="text"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button className="flex-none px-4 py-2 bg-brand text-white rounded-full flex items-center gap-2">
                <LocateFixed className="w-4 h-4" /> Proximity
              </button>
              <button className="flex-none px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-full flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trending
              </button>
              <button className="flex-none px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-full flex items-center gap-2">
                <Coffee className="w-4 h-4" /> Coffee Houses
              </button>
            </div>
          </div>

          {DISCOVERY_FEED.map((item) => (
            <DiscoveryFeedCard key={item.id} item={item} />
          ))}
        </section>

        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <DiscoveryRightColumn />
        </aside>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E1E1E] border-t border-slate-200 dark:border-white/5 px-6 py-3 flex justify-between items-center z-40">
        <Link href="/discovery" className={pathname === "/discovery" ? "text-brand font-semibold" : "text-slate-400"}>
          Home
        </Link>
        <Link href="/discovery" className={pathname === "/discovery" ? "text-brand font-semibold" : "text-slate-400"}>
          Explore
        </Link>
        <Link href="/qa" className={pathname === "/qa" ? "text-brand font-semibold" : "text-slate-400"}>
          Q&amp;A
        </Link>
        <Link
          href="/profile"
          className={pathname === "/profile" ? "text-brand font-semibold" : "text-slate-400"}
        >
          Profile
        </Link>
      </div>
    </div>
  );
}

