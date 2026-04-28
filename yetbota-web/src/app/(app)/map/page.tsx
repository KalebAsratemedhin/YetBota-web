"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import OpenStreetMap from "@/components/maps/OpenStreetMap";

function num(v: string | null, fallback: number): number {
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function MapPage() {
  const sp = useSearchParams();
  const latitude = num(sp.get("lat"), 9.03);
  const longitude = num(sp.get("lon"), 38.74);
  const zoom = num(sp.get("z"), 14);

  return (
    <div className="bg-[#0a0a0a] text-white h-[calc(100dvh-56px)] lg:h-dvh">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/create"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Map</h1>
            <p className="text-xs text-gray-500">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
        </div>

        <OpenStreetMap
          center={{ latitude, longitude }}
          marker={{ latitude, longitude }}
          zoom={zoom}
          mode="view"
          className="h-[70dvh] sm:h-[78dvh]"
          fullPageHref="/map"
        />
      </div>
    </div>
  );
}

