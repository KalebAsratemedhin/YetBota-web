"use client";

import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const OpenStreetMap = dynamic(() => import("@/components/maps/OpenStreetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-fg-muted text-sm">
      Loading map…
    </div>
  ),
});

function num(v: string | null, fallback: number): number {
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function MapView() {
  const router = useRouter();
  const sp = useSearchParams();
  const latitude = num(sp.get("lat"), 9.03);
  const longitude = num(sp.get("lon"), 38.74);
  const zoom = num(sp.get("z"), 14);

  return (
    <div className="bg-bg text-fg h-[calc(100dvh-56px)] lg:h-dvh">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border-subtle text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Map</h1>
            <p className="text-xs text-fg-faint">
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
          hideFullMapLink
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-bg text-fg h-[calc(100dvh-56px)] lg:h-dvh flex items-center justify-center text-fg-muted text-sm">
          Loading map…
        </div>
      }
    >
      <MapView />
    </Suspense>
  );
}

