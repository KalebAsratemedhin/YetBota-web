"use client";

import Image from "next/image";

export default function LocationHero({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) {
  return (
    <section className="p-6">
      <div className="rounded-3xl overflow-hidden aspect-video bg-slate-200 dark:bg-surface shadow-xl">
        <Image
          alt={title}
          src={imageUrl}
          width={1600}
          height={900}
          className="w-full h-full object-cover"
          priority={false}
        />
      </div>
    </section>
  );
}

