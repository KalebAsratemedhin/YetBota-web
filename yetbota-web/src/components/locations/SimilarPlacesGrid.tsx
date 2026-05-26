"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Post } from "@/types/content";

function areaLabel(post: Post): string {
  if (post.address && post.address.trim().length > 0) return post.address;
  if (
    post.location &&
    typeof post.location.latitude === "number" &&
    typeof post.location.longitude === "number"
  ) {
    return `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`;
  }
  return "Ethiopia";
}

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

// Neutralizes the default absolute positioning so the arrows sit inline in the header.
const inlineNav = "static left-auto right-auto top-auto translate-x-0 translate-y-0";

export default function SimilarPlacesGrid({ posts, loading }: { posts: Post[]; loading?: boolean }) {
  // Nothing to suggest and not loading — hide the whole section.
  if (!loading && posts.length === 0) return null;

  return (
    <section className="p-6">
      <Carousel opts={{ align: "start" }}>
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold">Similar Places in Ethiopia</h2>
          <div className="flex items-center gap-2">
            <CarouselPrevious className={inlineNav} />
            <CarouselNext className={inlineNav} />
            <Link href="/discovery" className="text-brand font-bold text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>

        <CarouselContent>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <CarouselItem key={i} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="animate-pulse">
                    <div className="aspect-4/3 rounded-2xl bg-overlay mb-3" />
                    <div className="h-4 w-2/3 bg-overlay rounded mb-2" />
                    <div className="h-3 w-1/2 bg-overlay rounded" />
                  </div>
                </CarouselItem>
              ))
            : posts.map((p) => {
                const imageUrl = p.photos?.[0]?.photo_url ?? "/images/profile/rock-hewn.webp";
                const area = areaLabel(p);
                return (
                  <CarouselItem key={p.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <Link
                      href={`/locations/${p.id}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-2xl"
                    >
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-overlay">
                        <Image
                          alt={p.title}
                          src={imageUrl}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white">
                          <MapPin className="w-4 h-4 text-brand shrink-0" />
                          <span className="text-xs font-medium truncate">{area}</span>
                        </div>
                      </div>
                      <h4 className="font-bold truncate group-hover:text-brand transition-colors">{p.title}</h4>
                      <p className="text-xs text-fg-faint flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {compactNum(p.likes ?? 0)} likes
                      </p>
                    </Link>
                  </CarouselItem>
                );
              })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
