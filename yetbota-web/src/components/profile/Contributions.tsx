"use client";
import Image from "next/image";
import { MapPin, Eye, Star, SlidersHorizontal, Plus } from "lucide-react";
import { CONTRIBUTIONS, CATEGORY_COLORS, type Contribution } from "@/lib/profileMockData";

function ContributionCard({ item }: { item: Contribution }) {
  const categoryColor = CATEGORY_COLORS[item.category] ?? "bg-gray-700/80";
  return (
    <div className="bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden p-px group cursor-pointer hover:border-white/20 transition-colors flex flex-col">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 backdrop-blur-md bg-black/50 rounded-md px-2 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-white">
            {item.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-white text-lg font-bold leading-7 line-clamp-1">
          {item.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-300/60 shrink-0" />
          <span className="text-slate-300/70 text-xs truncate">{item.location}</span>
        </div>

        <div className="flex items-center justify-between pt-2.5 text-[10px]">
          <span className="text-slate-500">Added {item.addedDate}</span>
          <span className="flex items-center gap-3 text-slate-300/70">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-300/60" />
              {item.views}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {item.rating}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContributionsGrid() {
  return (
    <div className="bg-[#0f0f0f] border border-[#262626] rounded-2xl p-4 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-brand rounded-sm" />
            ))}
          </div>
          <h3 className="text-white font-semibold text-lg">Your Contributions</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-300/70" />
          </button>
          <button className="w-10 h-10 bg-brand hover:bg-[#16a34a] rounded-full flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* 2×2 grid filling remaining height */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
        {CONTRIBUTIONS.slice(0, 4).map((item) => (
          <ContributionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}