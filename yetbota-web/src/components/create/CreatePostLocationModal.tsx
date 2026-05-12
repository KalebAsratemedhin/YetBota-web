"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import OpenStreetMap from "@/components/maps/OpenStreetMap";

export default function CreatePostLocationModal({
  open,
  onClose,
  onConfirm,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  value: { latitude: number; longitude: number };
  onChange: (v: { latitude: number; longitude: number }) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overscroll-contain">
      <div className="bg-white dark:bg-surface w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-border-subtle flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold">Select Location</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <OpenStreetMap
            center={value}
            marker={value}
            zoom={14}
            mode="pick"
            onPick={onChange}
            className="h-120 sm:h-152"
            onOpenFullMap={(href) => {
              onClose();
              // Let the modal unmount before navigation so it doesn't overlay the map page.
              setTimeout(() => router.push(href), 0);
            }}
          />
        </div>

        <div className="p-4 sm:p-5 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 h-12 bg-brand text-black font-bold rounded-2xl hover:opacity-90"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

