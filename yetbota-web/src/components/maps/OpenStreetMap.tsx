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
  // Hide the "Open full map" shortcut — e.g. on the full-map page itself.
  hideFullMapLink?: boolean;
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
  hideFullMapLink = false,
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

  const parsed = useMemo(
    () => (mode === "pick" ? parseLatLng(coordText) : null),
    [mode, coordText]
  );

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

      // In pick mode the marker is draggable; map panning still works for
      // anywhere off the marker. Off-marker clicks reposition the marker too.
      const mk = L.marker(initial, {
        icon: markerIcon,
        draggable: mode === "pick",
        keyboard: true,
      });
      mk.addTo(map);

      if (mode === "pick") {
        map.on("click", (e: L.LeafletMouseEvent) => {
          const ll = e.latlng;
          mk.setLatLng(ll);
          setCoordText(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
        });

        mk.on("dragend", () => {
          const ll = mk.getLatLng();
          setCoordText(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
        });
      }

      mapRef.current = map;
      markerRef.current = mk;

      // Recalculate size once the map signals it's ready — covers modal / lazy mount.
      map.whenReady(() => {
        map.invalidateSize(true);
      });

      // Keep size in sync if the container ever resizes (modal open/close, layout shifts).
      const ro = new ResizeObserver(() => {
        map.invalidateSize(true);
      });
      ro.observe(el);
      (map as unknown as { __yetbotaResizeObserver?: ResizeObserver }).__yetbotaResizeObserver = ro;
    }

    return () => {
      const map = mapRef.current;
      if (map) {
        const ro = (map as unknown as { __yetbotaResizeObserver?: ResizeObserver }).__yetbotaResizeObserver;
        ro?.disconnect();
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCenter, markerIcon]);

  // Sync marker position when props update (e.g., external state changes).
  // We intentionally don't call map.setView here — that would fight the user's
  // own panning every time onPick echoes through the parent and back as props.
  useEffect(() => {
    if (!hasValidCenter) return;
    const mk = markerRef.current;
    if (!mk) return;
    const ll = L.latLng(m.latitude, m.longitude);
    mk.setLatLng(ll);
  }, [hasValidCenter, m.latitude, m.longitude]);

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
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface flex-1 min-h-0">
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
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-fg-muted text-sm">
            Map unavailable
          </div>
        )}
        {!hideFullMapLink && (
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
        )}
      </div>

      {mode === "pick" ? (
        <div className="mt-3 shrink-0">
          <label className="text-sm text-fg-muted font-medium mb-1.5 block">Coordinates</label>
          <input
            value={coordText}
            onChange={(e) => setCoordText(e.target.value)}
            placeholder="latitude, longitude"
            className="w-full bg-surface-2 border border-border-subtle rounded-2xl px-5 h-14 text-fg placeholder-gray-600 text-base outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            inputMode="decimal"
          />
          <p className="mt-2 text-xs text-fg-faint">Paste coords from OpenStreetMap (lat, lon).</p>
        </div>
      ) : (
        <div className="mt-3 shrink-0" />
      )}
    </div>
  );
}

