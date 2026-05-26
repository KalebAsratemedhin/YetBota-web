"use client";
import Image from "next/image";
import { Star, Coffee, ShoppingBag, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/useContent";
import { COFFEE_HOUSES, HIDDEN_MARKETS, LOCAL_PARKS, type Place } from "@/lib/dummydata";
import Link from "next/link";
import Reveal from "@/components/landing/Reveal";

interface PlaceCardItemProps {
  place: Place;
  displayName: string;
  displayDescription: string;
  badgeLabel?: string;
  isCommunity?: boolean;
}

function PlaceCardItem({ place, displayName, displayDescription, badgeLabel, isCommunity }: PlaceCardItemProps) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-bg border border-border-subtle group cursor-pointer hover:border-brand/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300">
      <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden">
        <Image
          src={place.imageUrl}
          alt={displayName}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
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
              ? "bg-brand/20 text-brand border border-brand/30"
              : "bg-brand text-black"}
          `}>
            {isCommunity ? "COMMUNITY" : "CURATED"}
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-fg text-xs md:text-sm font-semibold mb-1 truncate">{displayName}</p>
        {place.rating ? (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-yellow-400 text-xs font-semibold">{place.rating}</span>
            <span className="text-fg-faint text-[10px] truncate">({place.reviewCount} reviews)</span>
          </div>
        ) : (
          <p className="text-fg-faint text-[10px] line-clamp-2 leading-tight">{displayDescription}</p>
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
        <h3 className="text-fg font-semibold text-sm md:text-base">{title}</h3>
      </div>

      {/* 2 cols on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {places.map((place, i) => {
          const isCommunity = place.badge === "community";
          const badgeLabel = isCommunity
            ? badgeLabels.communityContributed
            : place.badge === "curated" ? badgeLabels.curated : undefined;
          return (
            <Reveal key={place.id} direction="scale" delay={i * 90} className="h-full">
              <PlaceCardItem
                place={place}
                displayName={getPlaceName(place.nameKey)}
                displayDescription={getPlaceDesc(place.descriptionKey)}
                badgeLabel={badgeLabel}
                isCommunity={isCommunity}
              />
            </Reveal>
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
    <section className="bg-brand/5 dark:bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <Reveal className="mb-10 text-center">
          <h2 className="text-fg text-xl md:text-2xl font-bold mb-1">{t.discovery.title}</h2>
          <p className="text-fg-faint text-sm">{t.discovery.subtitle}</p>
        </Reveal>
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
        <Reveal direction="scale" className="flex justify-center mt-8">
          <Button
            asChild
            className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-full px-8 py-2.5 text-sm hover:scale-105 transition-transform"
          >
            <Link href="/discovery">{t.discovery.viewFeed} →</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}