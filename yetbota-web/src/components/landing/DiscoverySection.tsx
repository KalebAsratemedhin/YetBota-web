"use client";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Coffee, ShoppingBag, Trees, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import { COFFEE_HOUSES, HIDDEN_MARKETS, LOCAL_PARKS, type Place } from "@/lib/dummydata";

interface PlaceCardItemProps {
  place: Place;
  displayName: string;
  displayDescription: string;
  badgeLabel?: string;
  isCommunity?: boolean;
}

function PlaceCardItem({ place, displayName, displayDescription, badgeLabel, isCommunity }: PlaceCardItemProps) {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#111111] border border-white/5 group cursor-pointer hover:border-white/20 transition-colors">
      <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden">
        <Image
          src={place.imageUrl}
          alt={displayName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
        />
        {/* Distance — top left */}
        <span className="absolute top-2 left-2 z-10 text-[9px] font-medium text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full leading-tight whitespace-nowrap">
          {place.distance} KM AWAY
        </span>
        {/* Badge — top right */}
        {badgeLabel && (
          <span className={`
            absolute top-2 right-2 z-10
            text-[8px] font-bold uppercase tracking-wide
            px-2 py-0.5 rounded-full leading-tight whitespace-nowrap
            ${isCommunity
              ? "bg-[#1AFF6B]/20 text-[#1AFF6B] border border-[#1AFF6B]/30"
              : "bg-[#1AFF6B] text-black"}
          `}>
            {isCommunity ? "COMMUNITY" : "CURATED"}
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-white text-xs md:text-sm font-semibold mb-1 truncate">{displayName}</p>
        {place.rating ? (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-yellow-400 text-xs font-semibold">{place.rating}</span>
            <span className="text-gray-500 text-[10px] truncate">({place.reviewCount} reviews)</span>
          </div>
        ) : (
          <p className="text-gray-500 text-[10px] line-clamp-2 leading-tight">{displayDescription}</p>
        )}
      </div>
    </div>
  );
}

interface CategoryRowProps {
  title: string;
  places: Place[];
  icon: React.ReactNode;
  getPlaceName: (key: string) => string;
  getPlaceDesc: (key: string) => string;
  badgeLabels: { curated: string; communityContributed: string };
}

function CategoryRow({ title, places, icon, getPlaceName, getPlaceDesc, badgeLabels }: CategoryRowProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center mb-4">
        <span className="text-base mr-2">{icon}</span>
        <h3 className="text-white font-semibold text-sm md:text-base">{title}</h3>
        <div className="flex gap-1 ml-auto">
          <button className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 2 cols on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {places.map((place) => {
          const isCommunity = place.badge === "community";
          const badgeLabel = isCommunity
            ? badgeLabels.communityContributed
            : place.badge === "curated" ? badgeLabels.curated : undefined;
          return (
            <PlaceCardItem
              key={place.id}
              place={place}
              displayName={getPlaceName(place.nameKey)}
              displayDescription={getPlaceDesc(place.descriptionKey)}
              badgeLabel={badgeLabel}
              isCommunity={isCommunity}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function DiscoverySection() {
  const t = useContent();

  const getPlaceName = (key: string): string => {
    const places = t.places as Record<string, { name: string; description: string }>;
    return places[key]?.name ?? key;
  };
  const getPlaceDesc = (key: string): string => {
    const places = t.places as Record<string, { name: string; description: string }>;
    return places[key]?.description ?? "";
  };

  return (
    <section className="bg-[#0a0a0a] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-10 text-center">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-1">{t.discovery.title}</h2>
          <p className="text-gray-500 text-sm">{t.discovery.subtitle}</p>
        </div>
        <CategoryRow
          icon={<Coffee className="w-4 h-4" />}
          title={t.discovery.categories.coffeeHouses}
          places={COFFEE_HOUSES}
          getPlaceName={getPlaceName}
          getPlaceDesc={getPlaceDesc}
          badgeLabels={t.discovery.badges}
        />
        <CategoryRow
          icon={<ShoppingBag className="w-4 h-4" />}
          title={t.discovery.categories.hiddenMarkets}
          places={HIDDEN_MARKETS}
          getPlaceName={getPlaceName}
          getPlaceDesc={getPlaceDesc}
          badgeLabels={t.discovery.badges}
        />
        <CategoryRow
          icon={<Trees className="w-4 h-4" />}
          title={t.discovery.categories.localParks}
          places={LOCAL_PARKS}
          getPlaceName={getPlaceName}
          getPlaceDesc={getPlaceDesc}
          badgeLabels={t.discovery.badges}
        />
        <div className="flex justify-center mt-8">
          <Button className="bg-[#1AFF6B] hover:bg-brand-dark text-black font-semibold rounded-full px-8 py-2.5 text-sm">
            {t.discovery.viewFeed} →
          </Button>
        </div>
      </div>
    </section>
  );
}