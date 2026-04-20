"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

export interface SimilarPlace {
  id: string;
  name: string;
  area: string;
  rating: number;
  imageUrl: string;
}

export default function SimilarPlacesGrid({ places }: { places: SimilarPlace[] }) {
  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Similar Places in Ethiopia</h2>
        <button className="text-brand font-bold text-sm">View All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((p) => (
          <div key={p.id} className="group cursor-pointer">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-3">
              <Image
                alt={p.name}
                src={p.imageUrl}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                <MapPin className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium">{p.name}</span>
              </div>
            </div>
            <h4 className="font-bold">{p.name}</h4>
            <p className="text-xs text-slate-500">
              {p.area} • {p.rating.toFixed(1)} ⭐
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

