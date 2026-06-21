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
import { useLoginMutation, useRegisterMutation } from "@/store/api/authApi";

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

function parseEthiopiaSubscriber9(raw: string): string | null {
  const d = digitsOnly(raw);
  if (!d) return null;

  if (d.startsWith("251")) {
    const rest = d.slice(3);
    if (/^[79]\d{8}$/.test(rest)) return rest;
    return null;
  }

  if (d.startsWith("0")) {
    const rest = d.slice(1);
    if (/^[79]\d{8}$/.test(rest)) return rest;
    return null;
  }

  if (/^[79]\d{8}$/.test(d)) return d;
  return null;
}

function normalizeEthiopiaInput(raw: string): string {
  let d = digitsOnly(raw);
  if (d.startsWith("251")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 9);
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
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignUpPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileSubscriber9, setMobileSubscriber9] = useState("");
  const [password, setPassword] = useState("");

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const isLoading = isRegistering || isLoggingIn;

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  async function handleSubmit(e: React.FormEvent) {
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
        toast({
          variant: "destructive",
          title: "Invalid details",
          description: firstIssue,
        });
        return;
      }

      await register({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        username: parsed.data.username,
        mobile: parsed.data.mobile,
        password: parsed.data.password,
      }).unwrap();

      await login({
        username: parsed.data.username,
        password: parsed.data.password,
      }).unwrap();

      toast({ title: "Account created", description: "Welcome to Yet Bota." });
      router.replace("/profile");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: getAuthErrorMessage(err),
      });
    }
  }

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    username.trim() &&
    mobileSubscriber9.trim().length === 9 &&
    password.length >= 8;

  return (
    <AuthCard title="Sign Up" backHref="/">
      <div className="text-center mb-8">
        <h1 className="text-fg text-2xl font-bold mb-2">Join Yet Bota.</h1>
        <p className="text-fg-faint text-sm">Start exploring your local community today.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <div>
          <label className="text-sm text-fg-muted font-medium mb-1.5 block">Mobile</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border-subtle rounded-xl px-3 h-12 text-fg text-sm font-semibold select-none shrink-0">
              <span>Et</span>
              <span>+251</span>
            </div>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="912 345 678"
              value={mobileSubscriber9}
              onChange={(ev) => setMobileSubscriber9(normalizeEthiopiaInput(ev.target.value))}
              className="flex-1 bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all disabled:opacity-60"
              disabled={isLoading}
            />
          </div>
        </div>

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
          disabled={isLoading || !canSubmit}
          className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2 disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-fg-faint text-xs mt-5 leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="text-fg-muted underline underline-offset-2 hover:text-fg transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-fg-muted underline underline-offset-2 hover:text-fg transition-colors">
          Privacy Policy
        </Link>
      </p>

      <p className="text-center text-fg-faint text-xs my-4">
        Already have an account?{" "}
        <Link href="/signin" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
