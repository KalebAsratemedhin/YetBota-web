"use client";

import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot Password" backHref="/signin">
      <div className="text-center mb-8">
        <h1 className="text-fg text-2xl font-bold mb-2">Reset unavailable</h1>
        <p className="text-fg-faint text-sm">
          Password reset is not available yet. If you are signed in, change your password in Settings.
        </p>
      </div>
      <Button asChild className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12">
        <Link href="/signin">Back to sign in</Link>
      </Button>
    </AuthCard>
  );
}
