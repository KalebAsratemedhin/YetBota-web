"use client";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  backHref?: string;
}

export default function AuthCard({ title, children, backHref = "/" }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 mt-3">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <span className="text-white font-semibold text-sm">{title}</span>
        <div className="w-14" /> {/* spacer to center title */}
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#1AFF6B] rounded-2xl flex items-center justify-center mb-1 shadow-[0_0_40px_#1AFF6B33]">
          <MapPin className="w-8 h-8 text-black" strokeWidth={2.5} />
        </div>
      </div>

      {children}
    </div>
  );
}