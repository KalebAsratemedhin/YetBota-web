"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useAppSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import { setCredentials } from "@/store/authSlice";

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

export default function SignUpPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileSubscriber9, setMobileSubscriber9] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = false;

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
        console.warn("[users/register] validation_error", parsed.error.flatten());
        toast({
          variant: "destructive",
          title: "Invalid details",
          description: firstIssue,
        });
        return;
      }

      const localUser = {
        username: parsed.data.username,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        mobileE164: parsed.data.mobile,
      };

      const session = {
        accessToken: `local_${Date.now()}`,
        refreshToken: null as null,
        user: localUser,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("yetbota.localAuth", JSON.stringify(session));
      }

      dispatch(
        setCredentials({
          accessToken: session.accessToken,
          refreshToken: null,
          user: localUser,
        })
      );

      console.log("[local/signup] user", localUser);
      toast({ title: "Account created", description: "Welcome to Yet Bota." });
      router.replace("/profile");
    } catch (err) {
      console.error("[local/signup] error", err);
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
    password.length >= 1;

  return (
    <AuthCard title="Sign Up" backHref="/">
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Join Yet Bota.</h1>
        <p className="text-gray-500 text-sm">Start exploring your local community today.</p>
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

            // Allow partial typing: keep only digits after removing possible 251/0 prefixes, max 9.
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
          disabled={isLoading || !canSubmit}
          className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2 disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Sign Up"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-gray-600 text-xs uppercase tracking-widest">or register with</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <Link href="/phone">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 rounded-xl h-12 text-white text-sm font-semibold transition-colors"
        >
          <Phone className="w-4 h-4 text-brand" />
          Continue with Phone Number
        </button>
      </Link>

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
