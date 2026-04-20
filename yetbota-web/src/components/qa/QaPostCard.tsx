"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import type { QaPost } from "@/lib/qaMockData";

export default function QaPostCard({ post }: { post: QaPost }) {
  return (
    <Link
      href={`/qa/${post.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl"
    >
      <article className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-2xl p-6 transition-transform hover:border-brand/30 hover:-translate-y-px cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 min-w-0">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 ring-2 ring-brand/20 shrink-0">
            <Image src={post.user.avatarUrl} alt={post.user.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">{post.user.name}</h3>
              <span className="bg-brand/10 text-brand text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-brand/20">
                {post.user.badge}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{post.locationAndTime}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-brand transition-colors" aria-label="More">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold leading-tight">{post.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{post.body}</p>

        {post.hasMapPreview && post.mapImageUrl && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 group">
            <Image
              src={post.mapImageUrl}
              alt="Map preview"
              fill
              className="object-cover grayscale-[0.3] dark:invert dark:brightness-75"
            />
            <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <MapPin className="w-10 h-10 text-brand drop-shadow-md" />
            </div>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-md uppercase tracking-wide"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full px-1 py-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors">
            <ArrowUp className="w-5 h-5" />
            <span className="font-bold text-brand">{post.upvotes}</span>
          </button>
          <div className="w-px h-6 bg-slate-300 dark:bg-neutral-600 mx-1" />
          <button className="flex items-center px-4 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors">
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comments}</span>
          </button>
          <button
            className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      </article>
    </Link>
  );
}

