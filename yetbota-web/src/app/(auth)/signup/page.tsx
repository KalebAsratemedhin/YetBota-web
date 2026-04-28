"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateMobileOtpMutation,
  useLoginMutation,
  useRegisterMutation,
  useValidateMobileOtpMutation,
} from "@/store/api/authApi";

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

/**
 * Returns the 9-digit Ethiopian subscriber number (starts with 7 or 9),
 * or null if the input can't be understood.
 *
 * Accepts:
 * - +2519xxxxxxxx / +2517xxxxxxxx
 * - 2519xxxxxxxx / 2517xxxxxxxx
 * - 09xxxxxxxx / 07xxxxxxxx
 * - 9xxxxxxxx / 7xxxxxxxx (optional convenience)
 */
function parseEthiopiaSubscriber9(raw: string): string | null {
  const d = digitsOnly(raw);
  if (!d) return null;

  // +251XXXXXXXXX or 251XXXXXXXXX
  if (d.startsWith("251")) {
    const rest = d.slice(3);
    if (/^[79]\d{8}$/.test(rest)) return rest;
    return null;
  }

  // 0XXXXXXXXX
  if (d.startsWith("0")) {
    const rest = d.slice(1);
    if (/^[79]\d{8}$/.test(rest)) return rest;
    return null;
  }

  // XXXXXXXXX (subscriber)
  if (/^[79]\d{8}$/.test(d)) return d;
  return null;
}

function formatEthiopiaE164(subscriber9: string): string {
  // +251 9xx xxx xxx
  const a = subscriber9.slice(0, 3);
  const b = subscriber9.slice(3, 6);
  const c = subscriber9.slice(6, 9);
  return `+251 ${a} ${b} ${c}`;
}

function createRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z.string().trim().min(1, "Username is required"),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile is required")
    .transform((v, ctx) => {
      const subscriber9 = parseEthiopiaSubscriber9(v);
      if (!subscriber9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Mobile must be Ethiopian format like "+251 9xx xxx xxx" / "+251 7xx xxx xxx" (recommended) or "09xxxxxxxx" / "07xxxxxxxx".',
        });
        return z.NEVER;
      }
      return `+251${subscriber9}`;
    }),
  password: z.string().min(1, "Password is required"),
});

type PendingSignup = {
  first_name: string;
  last_name: string;
  username: string;
  mobile: string;
  password: string;
  random: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileSubscriber9, setMobileSubscriber9] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [otp, setOtp] = useState("");

  const [sendOtp, { isLoading: isSendingOtp }] = useGenerateMobileOtpMutation();
  const [validateOtp, { isLoading: isValidatingOtp }] = useValidateMobileOtpMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const isLoading =
    step === "form" ? isSendingOtp : isValidatingOtp || isRegistering || isLoggingIn;

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  function resetToForm() {
    setStep("form");
    setPendingSignup(null);
    setOtp("");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = signUpSchema.safeParse({
        firstName,
        lastName,
        username,
        mobile: `+251${mobileSubscriber9}`,
        password,
      });

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
        console.warn("[signup] validation_error", parsed.error.flatten());
        toast({
          variant: "destructive",
          title: "Invalid details",
          description: firstIssue,
        });
        return;
      }

      const random = createRandom();
      await sendOtp({ mobile: parsed.data.mobile, random }).unwrap();

      setPendingSignup({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        username: parsed.data.username,
        mobile: parsed.data.mobile,
        password: parsed.data.password,
        random,
      });
      setOtp("");
      setStep("otp");
      toast({
        title: "OTP sent",
        description: `We sent a code to ${parsed.data.mobile}.`,
      });
    } catch (err) {
      console.error("[auth/otp/mobile] error", err);
      toast({
        variant: "destructive",
        title: "Could not send OTP",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingSignup) return;
    try {
      await validateOtp({
        mobile: pendingSignup.mobile,
        random: pendingSignup.random,
        otp: otp.trim(),
      }).unwrap();

      await register({
        first_name: pendingSignup.first_name,
        last_name: pendingSignup.last_name,
        username: pendingSignup.username,
        mobile: pendingSignup.mobile,
        password: pendingSignup.password,
        random: pendingSignup.random,
      }).unwrap();

      await login({
        username: pendingSignup.username,
        password: pendingSignup.password,
      }).unwrap();

      toast({ title: "Account created", description: "Welcome to Yet Bota." });
      router.replace("/profile");
    } catch (err) {
      console.error("[signup/otp or register] error", err);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleResendOtp() {
    if (!pendingSignup) return;
    try {
      await sendOtp({ mobile: pendingSignup.mobile, random: pendingSignup.random }).unwrap();
      toast({ title: "OTP resent", description: `We sent a new code to ${pendingSignup.mobile}.` });
    } catch (err) {
      console.error("[auth/otp/mobile] resend error", err);
      toast({
        variant: "destructive",
        title: "Could not resend OTP",
        description: getAuthErrorMessage(err),
      });
    }
  }

  const canSubmitForm =
    firstName.trim() &&
    lastName.trim() &&
    username.trim() &&
    mobileSubscriber9.trim().length === 9 &&
    password.length >= 1;

  return (
    <AuthCard title={step === "otp" ? "Verify your phone" : "Sign Up"} backHref="/">
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">
          {step === "otp" ? "Enter the code" : "Join Yet Bota."}
        </h1>
        <p className="text-gray-500 text-sm">
          {step === "otp" && pendingSignup
            ? `We sent a verification code to ${pendingSignup.mobile}.`
            : "Start exploring your local community today."}
        </p>
      </div>

      {step === "form" ? (
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <AuthInput
              label="First Name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              value={firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              disabled={isLoading}
            />
            <AuthInput
              label="Last Name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              value={lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              disabled={isLoading}
            />
          </div>

          <AuthInput
            label="Username"
            type="text"
            placeholder="Choose a username"
            autoComplete="username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            disabled={isLoading}
          />

          <AuthInput
            label="Mobile"
            type="tel"
            placeholder='e.g. "+251 9xx xxx xxx"'
            autoComplete="tel"
            inputMode="tel"
            value={mobileSubscriber9 ? formatEthiopiaE164(mobileSubscriber9) : "+251 "}
            onChange={(ev) => {
              const subscriber9 = parseEthiopiaSubscriber9(ev.target.value);
              if (subscriber9) {
                setMobileSubscriber9(subscriber9.slice(0, 9));
                return;
              }

              const d = digitsOnly(ev.target.value);
              let rest = d;
              if (rest.startsWith("251")) rest = rest.slice(3);
              if (rest.startsWith("0")) rest = rest.slice(1);
              rest = rest.slice(0, 9);
              setMobileSubscriber9(rest);
            }}
            disabled={isLoading}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={isLoading || !canSubmitForm}
            className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2 disabled:opacity-60"
          >
            {isSendingOtp ? "Sending code…" : "Sign Up"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleOtpSubmit}>
          <div>
            <label className="text-sm text-gray-300 font-medium mb-1.5 block">OTP code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Enter code"
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => resetToForm()}
              disabled={isLoading}
            >
              Edit details
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => void handleResendOtp()}
              disabled={isLoading || isSendingOtp}
            >
              {isSendingOtp ? "Sending…" : "Resend OTP"}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.trim().length < 4}
            className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2 disabled:opacity-60"
          >
            {isValidatingOtp || isRegistering || isLoggingIn ? "Creating account…" : "Verify & create account"}
          </Button>
        </form>
      )}

      <p className="text-center text-gray-600 text-xs mt-5 leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
        >
          Privacy Policy
        </Link>
      </p>

      <p className="text-center text-gray-600 text-xs my-4">
        Already have an account?{" "}
        <Link href="/signin" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
