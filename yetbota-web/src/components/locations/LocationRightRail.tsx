"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

export interface PopularGuide {
  id: string;
  name: string;
  answersLabel: string;
  avatarUrl: string;
}

export default function LocationRightRail({
  mapImageUrl,
  addressLine,
  guides,
}: {
  mapImageUrl: string;
  addressLine: string;
  guides: PopularGuide[];
}) {
  return (
    <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen space-y-8">
      <div className="bg-slate-100 dark:bg-[#161616] rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-4">Location Map</h3>
        <div className="rounded-2xl overflow-hidden h-48 bg-slate-200 dark:bg-slate-800 relative">
          <Image
            alt="Map"
            src={mapImageUrl}
            width={640}
            height={360}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div>
        <p className="text-sm mt-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          {addressLine}
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-[#161616] rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-4">Popular Guides</h3>
        <div className="space-y-4">
          {guides.map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <Image
                alt={g.name}
                src={g.avatarUrl}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full bg-slate-200 object-cover"
              />
              <div>
                <p className="font-bold text-sm">{g.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {g.answersLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

