"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { saveSignUpDraft } from "@/lib/auth-draft";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const continueToPhoneVerification = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);
    saveSignUpDraft({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    router.push("/phone?mode=register");
  };

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
            value={form.firstName}
            onChange={(e) => updateForm("firstName", e.target.value)}
          />
          <AuthInput
            label="Last Name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => updateForm("lastName", e.target.value)}
          />
        </div>

        <AuthInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => updateForm("password", e.target.value)}
        />

        <Button
          type="button"
          onClick={continueToPhoneVerification}
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base mt-2"
        >
          Continue to Phone Verification
        </Button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-gray-600 text-xs uppercase tracking-widest">or register with</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Phone CTA */}
      <Link href="/phone?mode=register">
        <button className="w-full flex items-center justify-center gap-3 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 rounded-xl h-12 text-white text-sm font-semibold transition-colors">
          <Phone className="w-4 h-4 text-brand" />
          Register with Phone Number
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
        <Link href="/signin" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}