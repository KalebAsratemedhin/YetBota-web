"use client";
import { Camera, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "@/lib/profileMockData";

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="relative shrink-0">
      {/* Cover */}
      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-linear-to-br from-[#0a1f12] via-[#0d2e1a] to-[#0f3d20]">
        {/* Grid lines */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-[#080808] to-transparent" />
      </div>

      {/* Avatar + info */}
      <div className="flex items-end gap-4 px-2 -mt-10 relative z-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-[#e8b89a] border-4 border-[#080808] flex items-center justify-center shadow-xl">
            <span className="text-xl font-bold text-white/60">{initials}</span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand rounded-full flex items-center justify-center border-2 border-[#080808]">
            <Camera className="w-3 h-3 text-black" />
          </button>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-white font-bold text-xl leading-tight">{user.name}</h1>
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand bg-brand/15 border border-brand/30 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm"><strong className="text-white">{user.followers}</strong> <span className="text-gray-500">Followers</span></span>
            <span className="text-sm"><strong className="text-white">{user.following}</strong> <span className="text-gray-500">Following</span></span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-600" />
              <span className="text-gray-500 text-xs">{user.location}</span>
            </span>
          </div>
        </div>

        {/* Edit Profile button */}
        <Button
          size="sm"
          className="bg-brand hover:bg-[#16a34a] text-black font-semibold rounded-xl px-4 h-9 text-sm shrink-0 mb-1"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}