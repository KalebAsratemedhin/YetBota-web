"use client";

import { X } from "lucide-react";

export default function CreatePostLocationModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#161616] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-[#262626] flex items-center justify-between">
          <h3 className="text-xl font-bold">Select Location</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-96 bg-slate-200 dark:bg-slate-900 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 select-none">
            <span className="text-6xl font-black">MAP</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-brand text-5xl font-black">⌖</div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <input
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-xl border-none focus:ring-2 focus:ring-brand"
              placeholder="Search for a location..."
              type="text"
            />
          </div>
        </div>

        <div className="p-6 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="px-8 py-3 bg-brand text-black font-bold rounded-full hover:opacity-90"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

