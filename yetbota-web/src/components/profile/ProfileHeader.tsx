"use client";
import { Camera, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "@/lib/profileMockData";

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="relative shrink-0">
      {/* Cover */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-linear-to-br from-[#123b2a] via-[#0f2f23] to-[#0a0a0a]">
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
      <div className="flex items-end gap-6 px-6 -mt-20 relative z-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-3xl bg-[#e8b89a] border-4 border-[#0a0a0a] flex items-center justify-center shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden">
            <span className="text-3xl font-bold text-white/60">{initials}</span>
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.35)]"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-white font-bold text-[30px] leading-[36px]">{user.name}</h1>
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-brand bg-brand/20 border border-brand/30 px-3 py-1 rounded-xl">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-base">
              <strong className="text-white">{user.followers}</strong>{" "}
              <span className="text-slate-300/70">Followers</span>
            </span>
            <span className="text-base">
              <strong className="text-white">{user.following}</strong>{" "}
              <span className="text-slate-300/70">Following</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-300/60" />
              <span className="text-slate-300/70 text-sm">{user.location}</span>
            </span>
          </div>
        </div>

        {/* Edit Profile button */}
        <Button
          size="sm"
          className="bg-brand hover:bg-[#16a34a] text-white font-semibold rounded-xl px-6 h-11 text-base shrink-0 mb-2"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}