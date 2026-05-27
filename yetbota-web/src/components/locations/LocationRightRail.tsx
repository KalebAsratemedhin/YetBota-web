"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useTopContributors } from "@/lib/useTopContributors";
import { renderBadgeIcon } from "@/lib/badges";

const OpenStreetMap = dynamic(() => import("@/components/maps/OpenStreetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-2xl border border-border-subtle bg-surface flex items-center justify-center text-fg-muted text-sm">
      Loading map…
    </div>
  ),
});

// Popular Guides = top community members by reputation, from the public user
// API (works for signed-out viewers too).
const GUIDES_LIMIT = 4;

export default function LocationRightRail({
  addressLine,
  location,
}: {
  addressLine: string;
  location: { latitude: number; longitude: number };
}) {
  const { contributors, isLoading } = useTopContributors(GUIDES_LIMIT);

  return (
    <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen space-y-8">
      <div className="bg-bg border border-border-subtle rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-4">Location</h3>
        <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-200 dark:bg-slate-800">
          <OpenStreetMap center={location} marker={location} zoom={14} className="h-48" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/20">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div>
        <p className="text-sm mt-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          {addressLine}
        </p>
      </div>

      <div className="bg-bg border border-border-subtle rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-4">Popular Guides</h3>
        <div className="space-y-4">
          {isLoading && contributors.length === 0 ? (
            [...Array(GUIDES_LIMIT)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-overlay animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-overlay rounded animate-pulse" />
                  <div className="h-2 w-16 bg-overlay rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : contributors.length === 0 ? (
            <p className="text-sm text-fg-muted">No guides yet.</p>
          ) : (
            contributors.map((g) => (
              <Link key={g.id} href={g.profileHref} className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-overlay shrink-0 flex items-center justify-center">
                  {g.avatarUrl ? (
                    <Image
                      alt={g.name}
                      src={g.avatarUrl}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-brand text-xs font-bold">{g.initials}</span>
                  )}
                  {g.topBadge ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-surface border border-border-subtle flex items-center justify-center">
                      {renderBadgeIcon(g.topBadge, "w-2.5 h-2.5 text-brand")}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate group-hover:text-brand transition-colors">{g.name}</p>
                  <p className="text-[10px] text-fg-faint uppercase tracking-tighter">
                    {g.topBadge?.label ?? "Contributor"} · {g.rating} pts
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

