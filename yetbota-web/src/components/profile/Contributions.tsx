"use client";
import Image from "next/image";
import { MapPin, Eye, Star, SlidersHorizontal, Plus } from "lucide-react";
import { CONTRIBUTIONS, CATEGORY_COLORS, type Contribution } from "@/lib/profileMockData";

function ContributionCard({ item }: { item: Contribution }) {
  const categoryColor = CATEGORY_COLORS[item.category] ?? "bg-gray-700/80";
  return (
    <div className="relative rounded-xl overflow-hidden bg-[#161616] border border-white/5 group cursor-pointer hover:border-white/15 transition-colors flex flex-col">
      {/* Image */}
      <div className="relative flex-1 overflow-hidden min-h-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-2 right-2 z-10 text-[8px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full ${categoryColor}`}>
          {item.category}
        </span>
      </div>
      {/* Info below image */}
      <div className="p-2.5 shrink-0 bg-[#111111]">
        <p className="text-white text-xs font-semibold truncate mb-0.5">{item.name}</p>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-2.5 h-2.5 text-gray-600 shrink-0" />
          <span className="text-gray-500 text-[10px] truncate">{item.location}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-600">
          <span className="flex items-center gap-0.5">
            <Eye className="w-2.5 h-2.5" />{item.views}
          </span>
          <span className="flex items-center gap-0.5 text-yellow-400">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />{item.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContributionsGrid() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-brand rounded-sm" />
            ))}
          </div>
          <h3 className="text-white font-semibold text-sm">Your Contributions</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <SlidersHorizontal className="w-3 h-3 text-gray-400" />
          </button>
          <button className="w-7 h-7 bg-brand hover:bg-[#16a34a] rounded-full flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>

      {/* 2×2 grid filling remaining height */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 min-h-0">
        {CONTRIBUTIONS.slice(0, 4).map((item) => (
          <ContributionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}