import Image from "next/image";
import { Star } from "lucide-react";
import type { PlaceCard } from "@/lib/assistantMockData";

export default function AssistantPlaceCard({ place }: { place: PlaceCard }) {
  return (
    <div className="mt-3 bg-[#0d0d0d] border border-white/8 rounded-xl overflow-hidden flex gap-3 p-3">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <Image
          src={place.imageUrl}
          alt={place.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <p className="text-white text-sm font-bold leading-tight truncate">{place.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-yellow-400 text-xs font-semibold">{place.rating}</span>
            <span className="text-gray-500 text-xs">• {place.reviewCount} reviews</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs font-semibold ${place.isOpen ? "text-[#1AFF6B]" : "text-red-400"}`}>
              {place.isOpen ? "Open now" : "Closed"}
            </span>
            <span className="text-gray-600 text-xs">• {place.distance}</span>
          </div>
        </div>
        <a
          href={place.profileUrl}
          className="text-[#1AFF6B] text-xs font-bold uppercase tracking-wider hover:text-brand-dark transition-colors mt-1"
        >
          View Profile
        </a>
      </div>
    </div>
  );
}