"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useContent } from "@/lib/useContent";
import { useTopContributors, type TopContributor } from "@/lib/useTopContributors";
import { renderBadgeIcon } from "@/lib/badges";
import Reveal from "@/components/landing/Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const CHAMPIONS_LIMIT = 8;

const AVATAR_COLORS = [
  "bg-purple-700",
  "bg-teal-700",
  "bg-indigo-700",
  "bg-rose-700",
];

const ROLE_COLORS = [
  "text-yellow-400",
  "text-brand",
  "text-blue-400",
  "text-orange-400",
];

function ChampionItem({ champion, index }: { champion: TopContributor; index: number }) {
  const colorIdx = index % AVATAR_COLORS.length;
  const roleLabel = champion.topBadge?.label ?? "Contributor";

  return (
    <Link href={champion.profileHref} className="flex flex-col items-center text-center px-2 group">
      {/* Avatar with badge icon */}
      <div className="relative mb-4">
        <div
          className={`w-20 h-20 ${AVATAR_COLORS[colorIdx]} rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-white border-2 border-brand/40 group-hover:scale-110 group-hover:border-brand transition-all duration-300`}
        >
          {champion.avatarUrl ? (
            <Image
              src={champion.avatarUrl}
              alt={champion.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            champion.initials
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-bg border border-border-subtle rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {renderBadgeIcon(champion.topBadge, "w-4 h-4 text-brand")}
        </div>
      </div>

      {/* Name */}
      <p className="text-fg font-bold text-base mb-0.5 group-hover:text-brand transition-colors">
        {champion.name}
      </p>

      {/* Top badge / role */}
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${ROLE_COLORS[colorIdx]}`}>
        {roleLabel}
      </p>

      {/* Points */}
      <div className="inline-flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
        <span className="text-fg-muted text-sm font-semibold">{champion.rating.toLocaleString()} pts</span>
      </div>
    </Link>
  );
}

export default function ChampionsSection() {
  const t = useContent();
  const autoScroll = useRef(
    AutoScroll({ speed: 1, startDelay: 0, stopOnInteraction: false, playOnInit: true })
  );
  const { contributors, isLoading } = useTopContributors(CHAMPIONS_LIMIT);

  // Duplicate so there's always overflow for a continuous loop.
  const slides = [...contributors, ...contributors];

  return (
    <section className="bg-stone-100 dark:bg-bg py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-12">
          <h2 className="text-fg text-4xl font-extrabold mb-3">{t.champions.title}</h2>
          <p className="text-fg-faint text-base">{t.champions.subtitle}</p>
        </Reveal>

        {isLoading ? (
          <div className="flex justify-center gap-8 py-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-overlay animate-pulse" />
                <div className="h-3 w-20 rounded bg-overlay animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-overlay animate-pulse" />
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <p className="text-center text-fg-muted text-sm py-6">No champions to show yet.</p>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[autoScroll.current]}
            className="w-full max-w-4xl mx-auto"
            onMouseEnter={() => autoScroll.current.stop()}
            onMouseLeave={() => autoScroll.current.play()}
          >
            <CarouselContent className="py-6">
              {slides.map((champion, i) => (
                <CarouselItem key={`${champion.id}-${i}`} className="basis-1/2 md:basis-1/4">
                  <ChampionItem champion={champion} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:inline-flex bg-bg" />
            <CarouselNext className="hidden sm:inline-flex bg-bg" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
