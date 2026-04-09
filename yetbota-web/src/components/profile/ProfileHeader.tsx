"use client";
import { Camera, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "@/lib/profileMockData";

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="shrink-0">
      {/* Cover */}
      <div className="relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f2a1a] via-[#0d3320] to-[#1a4a2e]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
      </div>

      {/* Avatar + info row */}
      <div className="flex items-center gap-4 px-2 -mt-8 relative z-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-[#e8b89a] border-4 border-[#080808] flex items-center justify-center">
            <span className="text-lg font-bold text-white/70">{initials}</span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand rounded-full flex items-center justify-center border-2 border-[#080808]">
            <Camera className="w-2.5 h-2.5 text-black" />
          </button>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pt-6">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h1 className="text-white font-bold text-lg leading-tight">{user.name}</h1>
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand bg-brand/15 border border-brand/30 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span><strong className="text-white">{user.followers}</strong> <span className="text-gray-500">Followers</span></span>
            <span><strong className="text-white">{user.following}</strong> <span className="text-gray-500">Following</span></span>
            <span className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-gray-600" />
              <span className="text-gray-500 text-[10px]">{user.location}</span>
            </span>
          </div>
        </div>

        {/* Edit button */}
        <Button
          size="sm"
          className="bg-brand hover:bg-[#16a34a] text-black font-semibold rounded-xl px-3 h-8 text-xs shrink-0 mt-6"
        >
          <Pencil className="w-3 h-3 mr-1" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}