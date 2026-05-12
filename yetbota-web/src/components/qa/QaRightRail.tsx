"use client";

import Image from "next/image";
import { Coffee, Landmark, Store, Trees, TrendingUp } from "lucide-react";
import {
  QA_CONTRIBUTORS,
  QA_TRENDING,
  QA_TRENDING_TAGS,
  type ContributorItem,
  type TrendingItem,
} from "@/lib/qaMockData";

const TRENDING_ICON: Record<TrendingItem["icon"], React.ElementType> = {
  coffee: Coffee,
  storefront: Store,
  museum: Landmark,
  park: Trees,
};

function ContributorBadge({ c }: { c: ContributorItem }) {
  const flair =
    c.flair === "verified"
      ? "bg-brand"
      : c.flair === "trophy"
        ? "bg-amber-500"
        : "bg-blue-500";

  return (
    <div className="relative">
      <Image
        alt={c.name}
        src={c.avatarUrl}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full border-2 border-brand/20 object-cover"
      />
      <span
        className={`absolute -bottom-1 -right-1 ${flair} w-4 h-4 rounded-full ring-2 ring-white dark:ring-[#0A0A0A] flex items-center justify-center text-[10px] leading-none text-fg`}
        aria-hidden="true"
      >
        ✓
      </span>
    </div>
  );
}

export default function QaRightRail() {
  return (
    <aside className="w-80 fixed inset-y-0 right-0 border-l border-brand/20 bg-bg hidden xl:flex flex-col z-50 p-6 space-y-8 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">Trending in Ethiopia</h3>
          <TrendingUp className="w-5 h-5 text-brand" />
        </div>

        <div className="space-y-4">
          {QA_TRENDING.map((t) => {
            const Icon = TRENDING_ICON[t.icon];
            return (
              <div key={t.id} className="group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand overflow-hidden">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm group-hover:text-brand transition-colors">
                      {t.title}
                    </p>
                    <p className="text-xs text-fg-faint">{t.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 py-2.5 text-sm font-semibold text-brand bg-brand/5 hover:bg-brand/10 rounded-xl transition-all">
          Explore More
        </button>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-lg mb-5">Helpful Contributors</h3>
        <div className="space-y-5">
          {QA_CONTRIBUTORS.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <ContributorBadge c={c} />
              <div className="flex-1">
                <p className="text-sm font-bold">{c.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold">
                    {c.badge}
                  </span>
                  <span className="text-[10px] text-fg-faint">{c.answers} Answers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <a className="inline-block mt-6 text-xs font-bold text-fg-muted hover:text-brand transition-colors" href="#">
          View full leaderboard
        </a>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-lg mb-4">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {QA_TRENDING_TAGS.map((t) => (
            <a
              key={t}
              className="px-3 py-1.5 bg-brand/5 border border-brand/15 rounded-lg text-sm font-medium hover:border-brand/50 hover:text-brand transition-colors"
              href="#"
            >
              {t}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

