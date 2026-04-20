"use client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";

export default function SignInPage() {
  return (
    <AuthCard title="Sign In" backHref="/">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Welcome Back.</h1>
        <p className="text-gray-500 text-sm">Stay connected with your local community.</p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="········"
          autoComplete="current-password"
          rightLabel={
            <Link href="/forgot-password" className="text-brand hover:text-brand-dark transition-colors text-xs font-medium">
              Forgot Password?
            </Link>
          }
        />

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-gray-600 text-xs uppercase tracking-widest">or continue with</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Phone CTA */}
      <Link href="/phone">
        <button className="w-full flex items-center justify-center gap-3 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 rounded-xl h-12 text-white text-sm font-semibold transition-colors">
          <Phone className="w-4 h-4 text-brand" />
          Continue with Phone Number
        </button>
      </Link>

      {/* Footer */}
      <p className="text-center text-gray-600 text-xs mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}