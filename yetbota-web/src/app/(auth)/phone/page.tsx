"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenerateMobileOtpMutation, useValidateMobileOtpMutation } from "@/store/api/authApi";

function createRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function PhonePage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [random, setRandom] = useState<string | null>(null);
  const [step, setStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [sendOtp, { isLoading: isSendingOtp }] = useGenerateMobileOtpMutation();
  const [validateOtp, { isLoading: isValidatingOtp }] = useValidateMobileOtpMutation();

  async function handleSendOtp() {
    const r = createRandom();
    const mobile = `+251${phone}`;
    setRandom(r);
    try {
      await sendOtp({ mobile, random: r }).unwrap();
      setStep("enter_otp");
      toast({ title: "OTP sent", description: `We sent a code to ${mobile}.` });
    } catch (err) {
      console.error("[auth/otp/mobile] error", err);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: "Please try again.",
      });
    }
  }

  async function handleValidateOtp() {
    if (!random) return;
    const mobile = `+251${phone}`;
    try {
      await validateOtp({ mobile, random, otp: otp.trim() }).unwrap();
      toast({ title: "OTP verified", description: "Your phone number was verified." });
    } catch (err) {
      console.error("[auth/otp/validate] error", err);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please check the code and try again.",
      });
    }
  }

  return (
    <AuthCard title="Sign In" backHref="/signin">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-fg text-2xl font-bold mb-2">Yet Bota</h1>
        <p className="text-fg-faint text-sm max-w-55 mx-auto leading-relaxed">
          Connect with your neighborhood and find local answers.
        </p>
      </div>

      {/* Form */}
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "enter_phone") void handleSendOtp();
          else void handleValidateOtp();
        }}
      >
        <div>
          <label className="text-sm text-fg-muted font-medium mb-1.5 block">
            Phone Number
          </label>

          <div className="flex gap-2">
            {/* Fixed Ethiopia prefix */}
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border-subtle rounded-xl px-3 h-12 text-fg text-sm font-semibold select-none shrink-0">
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
              className="flex-1 bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              disabled={isSendingOtp || isValidatingOtp || step === "enter_otp"}
            />
          </div>
        </div>

        {step === "enter_otp" && (
          <div>
            <label className="text-sm text-fg-muted font-medium mb-1.5 block">OTP Code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              disabled={isSendingOtp || isValidatingOtp}
            />

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-fg-muted hover:text-fg transition-colors"
                onClick={() => {
                  setStep("enter_phone");
                  setOtp("");
                  setRandom(null);
                }}
                disabled={isSendingOtp || isValidatingOtp}
              >
                Change phone number
              </button>

              <button
                type="button"
                className="text-xs text-fg-muted hover:text-fg transition-colors"
                onClick={() => void handleSendOtp()}
                disabled={isSendingOtp || isValidatingOtp || phone.length < 9}
              >
                {isSendingOtp ? "Sending…" : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={
            phone.length < 9 ||
            isSendingOtp ||
            isValidatingOtp ||
            (step === "enter_otp" && otp.trim().length < 4)
          }
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl h-12 text-base inline-flex items-center gap-2"
        >
          {step === "enter_phone" ? (isSendingOtp ? "Sending…" : "Send OTP") : isValidatingOtp ? "Verifying…" : "Verify OTP"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Terms */}
      <p className="text-center text-fg-faint text-xs mt-6 leading-relaxed">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-fg-muted underline underline-offset-2 hover:text-fg transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand hover:text-brand-dark transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-fg-faint text-xs mt-6">
        New to the community?{" "}
        <Link href="/signup" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}