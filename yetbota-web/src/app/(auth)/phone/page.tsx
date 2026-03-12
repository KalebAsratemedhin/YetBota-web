"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { ArrowRight } from "lucide-react";  

export default function PhonePage() {
  const [phone, setPhone] = useState("");

  return (
    <AuthCard title="Sign In" backHref="/signin">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Yet Bota</h1>
        <p className="text-gray-500 text-sm max-w-55 mx-auto leading-relaxed">
          Connect with your neighborhood and find local answers.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-sm text-gray-300 font-medium mb-1.5 block">
            Phone Number
          </label>

          <div className="flex gap-2">
            {/* Fixed Ethiopia prefix */}
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/8 rounded-xl px-3 h-12 text-white text-sm font-semibold select-none shrink-0">
              <span>Et</span>
              <span>+251</span>
            </div>

            {/* Number input */}
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                // Only allow digits, max 9 digits (Ethiopian mobile format)
                const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                setPhone(val);
              }}
              placeholder="912 345 678"
              className="flex-1 bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-[#1AFF6B]/50 focus:ring-1 focus:ring-[#1AFF6B]/20 transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={phone.length < 9}
          className="w-full bg-[#1AFF6B] hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl h-12 text-base inline-flex items-center gap-2"
        >
          Send OTP
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Terms */}
      <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#1AFF6B] hover:text-brand-dark transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-gray-600 text-xs mt-6">
        New to the community?{" "}
        <Link href="/signup" className="text-[#1AFF6B] hover:text-brand-dark font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}