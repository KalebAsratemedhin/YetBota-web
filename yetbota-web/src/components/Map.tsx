'use client';

import { useEffect, useRef } from 'react';

// No top-level Leaflet import

export type MapLocation = {
  lat: number;
  lng: number;
  zoom?: number;
};

type MapProps = {
  location?: MapLocation;
  className?: string;
};

const DEFAULT_CENTER: MapLocation = { lat: 51.505, lng: -0.09, zoom: 13 };

export function Map({ location, className =  'w-[600px] h-[400px] rounded-lg' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const center = location ?? DEFAULT_CENTER;
  const zoom = center.zoom ?? 13;

  useEffect(() => {
    if (!mapRef.current) return;

    let mapInstance: L.Map | null = null;
    let marker: L.Marker | null = null;

    import('leaflet').then((L) => {
      const defaultIcon = L.default.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      mapInstance = L.default.map(mapRef.current!).setView([center.lat, center.lng], zoom);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapInstance);

      marker = L.default.marker([center.lat, center.lng], { icon: defaultIcon }).addTo(mapInstance);
      mapInstanceRef.current = mapInstance;
      markerRef.current = marker;
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  return <div ref={mapRef} className={className} />;
}