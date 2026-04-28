"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Settings } from "lucide-react";
import type { ProfileUser } from "@/lib/profileMockData";
import { useUploadMyProfileImageMutation } from "@/store/api/authApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { readFileAsBase64 } from "@/lib/readFileAsBase64";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type ProfileHeaderProps = {
  user: ProfileUser;
  onProfileImageUploaded?: () => void;
};

export default function ProfileHeader({ user, onProfileImageUploaded }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadProfileImage, { isLoading: isUploading }] = useUploadMyProfileImageMutation();
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please choose an image file.",
      });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please choose an image under 8 MB.",
      });
      return;
    }
    try {
      const image_base64 = await readFileAsBase64(file);
      await uploadProfileImage({ image_base64 }).unwrap();
      onProfileImageUploaded?.();
      toast({ title: "Profile photo updated" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: getAuthErrorMessage(err),
      });
    }
  }

  return (
    <div className="relative shrink-0">
      {/* Cover */}
      <div className="relative h-44 sm:h-56 lg:h-64 w-full rounded-2xl overflow-hidden bg-linear-to-br from-[#123b2a] via-[#0f2f23] to-[#0a0a0a]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse_at_50%_35%, rgba(255,255,255,0.10), transparent 55%),
              linear-gradient(90deg, rgba(255,255,255,0.08), transparent 55%),
              linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.65))
            `,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/35 to-transparent" />
      </div>

      {/* Avatar + info */}
      <div className="flex flex-col sm:flex-row sm:items-end items-start gap-4 sm:gap-6 px-4 sm:px-6 -mt-14 sm:-mt-18 lg:-mt-20 relative z-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-3xl bg-[#e8b89a] border-4 border-[#0a0a0a] flex items-center justify-center shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 160px, (min-width: 640px) 128px, 96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/60">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-9 h-9 sm:w-10 sm:h-10 bg-brand rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.35)] disabled:opacity-60"
            aria-label="Change profile photo"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pb-1 sm:pb-2 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
            <h1 className="text-white font-bold text-xl sm:text-2xl lg:text-[30px] leading-tight truncate max-w-full">
              {user.name}
            </h1>
            <span className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.12em] text-brand bg-brand/20 border border-brand/30 px-2.5 sm:px-3 py-1 rounded-xl">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="text-sm sm:text-base">
              <strong className="text-white">{user.followers}</strong>{" "}
              <span className="text-slate-300/70">Followers</span>
            </span>
            <span className="text-sm sm:text-base">
              <strong className="text-white">{user.following}</strong>{" "}
              <span className="text-slate-300/70">Following</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-300/60" />
              <span className="text-slate-300/70 text-sm truncate max-w-[18rem] sm:max-w-[24rem]">
                {user.location}
              </span>
            </span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />

        <Link
          href="/settings"
          className="sm:shrink-0 sm:mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#141414] text-gray-300 hover:text-white hover:bg-[#1c1c1c] transition-colors self-end sm:self-auto"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}