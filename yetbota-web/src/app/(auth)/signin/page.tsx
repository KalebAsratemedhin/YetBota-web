"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ username: username.trim(), password }).unwrap();
      console.log("[auth/login] response", res);
      toast({ title: "Signed in", description: "Welcome back." });
      router.replace("/");
    } catch (err) {
      console.error("[auth/login] error", err);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: getAuthErrorMessage(err),
      });
    }
  }

  return (
    <AuthCard title="Sign In" backHref="/">
      <div className="text-center mb-8">
        <h1 className="text-fg text-2xl font-bold mb-2">Welcome Back.</h1>
        <p className="text-fg-faint text-sm">Stay connected with your local community.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          label="Username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          disabled={isLoading}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="········"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={isLoading}
          rightLabel={
            <Link
              href="/forgot-password"
              className="text-brand hover:text-brand-dark transition-colors text-xs font-medium"
            >
              Forgot Password?
            </Link>
          }
        />

        <Button
          type="submit"
          disabled={isLoading || !username.trim() || !password}
          className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2 disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-overlay" />
        <span className="text-fg-faint text-xs uppercase tracking-widest">or continue with</span>
        <div className="flex-1 h-px bg-overlay" />
      </div>

      <Link href="/phone">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface-2 border border-border-subtle rounded-xl h-12 text-fg text-sm font-semibold transition-colors"
        >
          <Phone className="w-4 h-4 text-brand" />
          Continue with Phone Number
        </button>
      </Link>

      <p className="text-center text-fg-faint text-xs mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}
