"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOP_TRAVELERS } from "@/lib/discoveryMockData";
import { useRouter } from "next/navigation";

export default function DiscoveryRightColumn() {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6">
        <h3 className="font-bold text-lg">Top Travelers</h3>
        <div className="space-y-4">
          {TOP_TRAVELERS.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  alt={t.name}
                  src={t.avatarUrl}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              <button className="text-xs font-bold text-brand hover:underline">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-linear-to-br from-brand/20 to-brand/5 p-6 rounded-3xl border border-brand/20">
        <h3 className="font-bold mb-2">Join the Community</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Connect with fellow travelers and share your unique experiences across Ethiopia.
        </p>
        <Button
          onClick={() => router.push("/create")}
          className="w-full py-3 bg-brand hover:bg-[#16a34a] text-white rounded-xl font-bold shadow-lg shadow-brand/30 active:scale-95 transition-transform"
        >
          Create Post
        </Button>
      </div>

      <button
        type="button"
        onClick={() => router.push("/create")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand/40 hover:scale-110 active:scale-90 transition-all z-50"
        aria-label="Create"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}

