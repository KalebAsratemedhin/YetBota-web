"use client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";

export default function SignUpPage() {
  return (
    <AuthCard title="Sign Up" backHref="/">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Join Yet Bota.</h1>
        <p className="text-gray-500 text-sm">Start exploring your local community today.</p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            label="First Name"
            type="text"
            placeholder="John"
            autoComplete="given-name"
          />
          <AuthInput
            label="Last Name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>

        <AuthInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full bg-[#1AFF6B] hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2"
        >
          Sign Up
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-gray-600 text-xs uppercase tracking-widest">or register with</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Phone CTA */}
      <Link href="/phone">
        <button className="w-full flex items-center justify-center gap-3 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 rounded-xl h-12 text-white text-sm font-semibold transition-colors">
          <Phone className="w-4 h-4 text-[#1AFF6B]" />
          Continue with Phone Number
        </button>
      </Link>

      {/* Terms */}
      <p className="text-center text-gray-600 text-xs mt-5 leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-gray-600 text-xs my-4">
        Already have an account?{" "}
        <Link href="/signin" className="text-[#1AFF6B] hover:text-brand-dark font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}