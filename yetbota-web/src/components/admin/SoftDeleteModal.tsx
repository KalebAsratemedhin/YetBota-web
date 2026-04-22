"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SoftDeleteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-[#1a2332] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Soft-Delete Content?</h2>
          <p className="text-sm text-slate-400">
            The content will be hidden from the public feed but preserved in our
            database for 30 days for legal compliance.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Moderation Reason (Required)
            </label>
            <select className="w-full bg-[#0f1923] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option>Community Guideline Violation</option>
              <option>Spam / Scam</option>
              <option>Offensive Content</option>
              <option>Incorrect Information</option>
              <option>Other</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/20 bg-[#0f1923] text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-300">
              Notify @john_doe_22 of removal
            </span>
          </label>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-6">
          <Button
            variant="outline"
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 rounded-xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
            onClick={onClose}
          >
            Delete Content
          </Button>
        </div>
      </div>
    </div>
  );
}
