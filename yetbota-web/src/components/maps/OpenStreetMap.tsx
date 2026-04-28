"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as L from "leaflet";

type LatLng = { latitude: number; longitude: number };

function isLatLng(v: unknown): v is LatLng {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.latitude === "number" && Number.isFinite(r.latitude) && typeof r.longitude === "number" && Number.isFinite(r.longitude);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function parseLatLng(text: string): LatLng | null {
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(/[,\s]+/).filter(Boolean);
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { latitude: lat, longitude: lon };
}

export type OpenStreetMapProps = {
  center: LatLng;
  zoom?: number;
  marker?: LatLng;
  className?: string;
  mode?: "view" | "pick";
  onPick?: (value: LatLng) => void;
  fullPageHref?: string;
  onOpenFullMap?: (href: string) => void;
};

export default function OpenStreetMap({
  center,
  zoom = 14,
  marker,
  className,
  mode = "view",
  onPick,
  fullPageHref = "/map",
  onOpenFullMap,
}: OpenStreetMapProps) {
  const z = clamp(Math.round(zoom), 1, 19);
  const raw = marker ?? center;
  const hasValidCenter = isLatLng(raw);
  const m: LatLng = hasValidCenter ? raw : { latitude: 0, longitude: 0 };

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const markerIcon = useMemo(() => {
    // Leaflet's real default marker icon (blue pin).
    // In Next/Webpack, we must explicitly provide URLs for the images.
    const iconRetinaUrl = new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString();
    const iconUrl = new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString();
    const shadowUrl = new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString();

    return new L.Icon.Default({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, []);

  const fullMapHref = useMemo(() => {
    const url = new URL(fullPageHref, "http://local");
    url.searchParams.set("lat", String(m.latitude));
    url.searchParams.set("lon", String(m.longitude));
    url.searchParams.set("z", String(z));
    return url.pathname + url.search;
  }, [fullPageHref, m.latitude, m.longitude, z]);

  const [coordText, setCoordText] = useState(() =>
    mode === "pick" ? `${m.latitude.toFixed(6)}, ${m.longitude.toFixed(6)}` : ""
  );

  const parsed = mode === "pick" ? parseLatLng(coordText) : null;

  useEffect(() => {
    if (mode !== "pick") return;
    if (!onPick) return;
    if (!parsed) return;
    onPick(parsed);
  }, [mode, onPick, parsed]);

  useEffect(() => {
    if (!hasValidCenter) return;
    const el = mapElRef.current;
    if (!el) return;

    if (!mapRef.current) {
      // On mobile, the browser can steal swipe gestures for page scroll/back-swipe.
      // Prevent default on touchmove so Leaflet gets the full drag gesture.
      const stopTouchMove = (e: TouchEvent) => {
        // Only block single-finger panning; allow pinch zoom gestures to behave normally.
        if (e.touches.length === 1) e.preventDefault();
      };
      el.addEventListener("touchmove", stopTouchMove, { passive: false });

      const map = L.map(el, {
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const initial = L.latLng(m.latitude, m.longitude);
      map.setView(initial, z);
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();

      // In pick mode, keep the marker non-interactive so swipe/drag pans the map reliably.
      // Location changes happen via map taps/clicks (not by dragging the marker).
      const mk = L.marker(initial, {
        icon: markerIcon,
        draggable: false,
        interactive: mode !== "pick",
        keyboard: mode !== "pick",
      });
      mk.addTo(map);

      if (mode === "pick") {
        map.on("click", (e: L.LeafletMouseEvent) => {
          const ll = e.latlng;
          mk.setLatLng(ll);
          setCoordText(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
        });
      }

      mapRef.current = map;
      markerRef.current = mk;

      // When rendered in a modal, Leaflet often needs a size recalculation
      // after layout to allow panning/zooming immediately.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          map.invalidateSize(true);
        });
      });
      // Some mobile browsers/layouts still need a delayed invalidate.
      setTimeout(() => {
        map.invalidateSize(true);
      }, 150);
      map.whenReady(() => {
        map.invalidateSize(true);
      });

      // Clean up touch listener when map unmounts.
      (map as unknown as { __yetbotaStopTouchMove?: (e: TouchEvent) => void }).__yetbotaStopTouchMove = stopTouchMove;
    }

    return () => {
      const map = mapRef.current;
      if (map) {
        const stopTouchMove = (map as unknown as { __yetbotaStopTouchMove?: (e: TouchEvent) => void }).__yetbotaStopTouchMove;
        if (stopTouchMove) {
          el.removeEventListener("touchmove", stopTouchMove as (e: Event) => void);
        }
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCenter, markerIcon]);

  useEffect(() => {
    if (!hasValidCenter) return;
    const map = mapRef.current;
    const mk = markerRef.current;
    if (!map || !mk) return;

    const ll = L.latLng(m.latitude, m.longitude);
    mk.setLatLng(ll);
    map.setView(ll, z, { animate: false });
  }, [hasValidCenter, m.latitude, m.longitude, z]);

  useEffect(() => {
    if (!hasValidCenter) return;
    const mk = markerRef.current;
    if (!mk) return;
    // Marker dragging is intentionally disabled; panning should always work.
    mk.dragging?.disable?.();
  }, [hasValidCenter, mode]);

  useEffect(() => {
    if (!hasValidCenter) return;
    if (mode !== "pick") return;
    const ll = parsed ? L.latLng(parsed.latitude, parsed.longitude) : null;
    const map = mapRef.current;
    const mk = markerRef.current;
    if (!ll || !map || !mk) return;
    mk.setLatLng(ll);
    map.panTo(ll, { animate: true });
  }, [hasValidCenter, mode, parsed]);

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] flex-1 min-h-0">
        {hasValidCenter ? (
          <div
            ref={mapElRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{
              // Fully hand gestures to Leaflet (prevents browser scrolling/back-swipe stealing the drag).
              touchAction: "none",
              overscrollBehavior: "none",
              WebkitTouchCallout: "none" as const,
            }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Map unavailable
          </div>
        )}
        <Link
          href={fullMapHref}
          onClick={(e) => {
            if (!onOpenFullMap) return;
            e.preventDefault();
            onOpenFullMap(fullMapHref);
          }}
          className="absolute top-3 right-3 z-20 pointer-events-auto text-[11px] font-semibold px-3 py-1.5 rounded-full bg-black/60 text-white hover:bg-black/75 transition-colors"
        >
          Open full map
        </Link>
      </div>

      {mode === "pick" ? (
        <div className="mt-3 shrink-0">
          <label className="text-sm text-gray-300 font-medium mb-1.5 block">Coordinates</label>
          <input
            value={coordText}
            onChange={(e) => setCoordText(e.target.value)}
            placeholder="latitude, longitude"
            className="w-full bg-[#1a1a1a] border border-white/8 rounded-2xl px-5 h-14 text-white placeholder-gray-600 text-base outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            inputMode="decimal"
          />
          <p className="mt-2 text-xs text-gray-500">Paste coords from OpenStreetMap (lat, lon).</p>
        </div>
      ) : (
        <div className="mt-3 shrink-0" />
      )}
    </div>
  );
}

