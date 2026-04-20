"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";

export default function CreatePostPhotoDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className="w-full aspect-21/9 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161616]/30 flex flex-col items-center justify-center gap-4 hover:border-brand/50 transition-colors cursor-pointer group overflow-hidden relative"
      aria-label="Add photos"
    >
      {previewUrl ? (
        <Image alt="Selected photo" src={previewUrl} fill className="object-cover" />
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
            <Camera className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Add Photos</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Share the beauty of the landscape (Optional)
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }}
      />
    </div>
  );
}

