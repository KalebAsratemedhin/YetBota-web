"use client";

import { X } from "lucide-react";

export default function CreatePostHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="px-6 sm:px-8 h-20 flex items-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-overlay rounded-full transition-colors text-fg-muted hover:text-fg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-fg">{title}</h2>
      </div>
    </header>
  );
}
