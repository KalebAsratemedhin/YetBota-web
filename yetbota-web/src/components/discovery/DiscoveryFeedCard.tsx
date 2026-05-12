"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, Heart, Map, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import type { DiscoveryFeedItem } from "@/lib/discoveryMockData";

export default function DiscoveryFeedCard({ item }: { item: DiscoveryFeedItem }) {
  return (
    <article className="bg-white dark:bg-surface rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-slate-200 dark:border-white/5">
      <div className="p-5 flex items-center justify-between">
        {item.author.href ? (
          <Link
            href={item.author.href}
            className="flex items-center gap-4 min-w-0 rounded-full -m-1 p-1 hover:bg-slate-100 dark:hover:bg-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            aria-label={`View ${item.author.name}'s profile`}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
              <Image src={item.author.avatarUrl} alt={item.author.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate">{item.author.name}</h4>
              <p className="text-sm text-brand flex items-center gap-1 truncate">
                <span className="text-[10px]">●</span>
                {item.author.locationLabel}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
              <Image src={item.author.avatarUrl} alt={item.author.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate">{item.author.name}</h4>
              <p className="text-sm text-brand flex items-center gap-1 truncate">
                <span className="text-[10px]">●</span>
                {item.author.locationLabel}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          className="p-2 text-fg-muted hover:text-slate-600 dark:hover:text-fg transition-colors"
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="relative px-4">
        <Link
          href={`/locations/${item.id}`}
          className="block relative rounded-[2rem] overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <Image
            src={item.imageUrl}
            alt=""
            width={1200}
            height={900}
            className="w-full h-[500px] object-cover"
            priority={false}
          />
          {item.badgeLabel && (
            <span className="absolute top-6 left-6 px-3 py-1 bg-brand text-white text-[10px] font-bold tracking-widest rounded-lg uppercase shadow-lg">
              {item.badgeLabel}
            </span>
          )}
          <button
            type="button"
            className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          >
            <Map className="w-4 h-4 text-brand" />
            {item.showOnMapLabel}
          </button>
        </Link>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className={[
                "flex items-center gap-2 transition-colors",
                item.liked ? "text-brand" : "text-slate-600 dark:text-slate-400 hover:text-red-500",
              ].join(" ")}
            >
              <Heart className={`w-5 h-5 ${item.liked ? "fill-brand" : ""}`} />
              <span className="text-sm font-semibold">{item.likes}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{item.comments}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            className={[
              "transition-colors",
              item.bookmarked ? "text-brand" : "text-slate-600 dark:text-slate-400 hover:text-brand",
            ].join(" ")}
            aria-label="Bookmark"
          >
            <Bookmark className={`w-5 h-5 ${item.bookmarked ? "fill-brand" : ""}`} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.body}</p>
          <div className="flex flex-wrap gap-3">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-bold text-brand opacity-80 hover:opacity-100 cursor-pointer"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

