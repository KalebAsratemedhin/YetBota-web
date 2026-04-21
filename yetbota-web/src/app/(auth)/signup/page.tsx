"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useRegisterMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

export default function SignUpPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }).unwrap();
      router.replace("/");
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    }
  }

  const canSubmit =
    firstName.trim() && lastName.trim() && email.trim() && password.length >= 1;

  return (
    <AuthCard title="Sign Up" backHref="/">
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Join Yet Bota.</h1>
        <p className="text-gray-500 text-sm">Start exploring your local community today.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {formError ? <p className="text-red-400 text-sm text-center">{formError}</p> : null}

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
          label="Email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
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
