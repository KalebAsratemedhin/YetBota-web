"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { ArrowRight } from "lucide-react";  
import { clearSignUpDraft, readSignUpDraft, type SignUpDraft } from "@/lib/auth-draft";

export default function PhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signin";

  const [draft, setDraft] = useState<SignUpDraft | null>(null);
  const [manualProfile, setManualProfile] = useState<SignUpDraft>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [randomToken, setRandomToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAction, setLoadingAction] = useState<"" | "send" | "verify" | "register">("");

  const normalizedPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 9) {
      return `+251${digits}`;
    }
    return "";
  }, [phone]);

  useEffect(() => {
    if (mode !== "register") {
      return;
    }
    setDraft(readSignUpDraft());
  }, [mode]);

  const activeProfile = draft ?? manualProfile;
  const hasRegisterProfile =
    activeProfile.firstName.trim() &&
    activeProfile.lastName.trim() &&
    activeProfile.email.trim() &&
    activeProfile.password.length >= 8;

  const callApi = async <T,>(url: string, payload: Record<string, unknown>) => {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await resp.json()) as {
      code: string;
      success: boolean;
      message: string;
      data?: T;
    };
  };

  const sendOtp = async () => {
    if (mode !== "register") {
      setError("Phone login is not available yet. Use email/password sign in.");
      return;
    }
    if (!hasRegisterProfile) {
      setError("Provide first name, last name, email, and password first.");
      return;
    }
    if (!normalizedPhone) {
      setError("Enter a valid Ethiopian mobile number.");
      return;
    }

    setError("");
    setSuccess("");
    setOtpVerified(false);
    setLoadingAction("send");

    try {
      const mobileCheck = await callApi<boolean>("/api/identity/check-mobile", {
        mobile: normalizedPhone,
      });
      if (!mobileCheck.success) {
        setError(mobileCheck.message || "Unable to verify phone number.");
        return;
      }
      if (mobileCheck.data) {
        setError("This phone number is already registered.");
        return;
      }

      const random = crypto.randomUUID().replaceAll("-", "");
      const otpResp = await callApi("/api/identity/generate-mobile-otp", {
        mobile: normalizedPhone,
        random,
      });
      if (!otpResp.success) {
        setError(otpResp.message || "Unable to send OTP.");
        return;
      }

      setRandomToken(random);
      setOtpSent(true);
      setSuccess("OTP sent successfully.");
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoadingAction("");
    }
  };

  const verifyOtp = async () => {
    if (!otpSent || !randomToken) {
      setError("Send OTP first.");
      return;
    }
    if (!otp.trim()) {
      setError("Enter the OTP.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingAction("verify");

    try {
      const verifyResp = await callApi("/api/identity/validate-otp", {
        mobile: normalizedPhone,
        random: randomToken,
        otp: otp.trim(),
      });
      if (!verifyResp.success) {
        setError(verifyResp.message || "Invalid OTP.");
        setOtpVerified(false);
        return;
      }
      setOtpVerified(true);
      setSuccess("OTP verified. Complete your registration.");
    } catch {
      setError("Failed to verify OTP.");
      setOtpVerified(false);
    } finally {
      setLoadingAction("");
    }
  };

  const completeRegistration = async () => {
    if (!otpVerified || !randomToken) {
      setError("Verify OTP before registering.");
      return;
    }
    if (!hasRegisterProfile) {
      setError("Provide first name, last name, email, and password first.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingAction("register");

    try {
      const registerResp = await callApi("/api/identity/register", {
        id: crypto.randomUUID(),
        firstName: activeProfile.firstName.trim(),
        lastName: activeProfile.lastName.trim(),
        username: activeProfile.email.trim().toLowerCase(),
        mobile: normalizedPhone,
        password: activeProfile.password,
        random: randomToken,
      });

      if (!registerResp.success) {
        setError(registerResp.message || "Registration failed.");
        return;
      }

      clearSignUpDraft();
      setSuccess("Registration successful. Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 800);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <AuthCard title={mode === "register" ? "Phone Verification" : "Sign In"} backHref={mode === "register" ? "/signup" : "/signin"}>
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Yet Bota</h1>
        <p className="text-gray-500 text-sm max-w-55 mx-auto leading-relaxed">
          {mode === "register"
            ? "Verify your phone number to finish creating your account."
            : "Connect with your neighborhood and find local answers."}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {mode === "register" && !draft && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={manualProfile.firstName}
                  onChange={(e) =>
                    setManualProfile((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="John"
                  className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={manualProfile.lastName}
                  onChange={(e) =>
                    setManualProfile((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Doe"
                  className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={manualProfile.email}
                onChange={(e) =>
                  setManualProfile((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="name@example.com"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={manualProfile.password}
                onChange={(e) =>
                  setManualProfile((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Create a password"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm text-gray-300 font-medium mb-1.5 block">
            Phone Number
          </label>

          <div className="flex gap-2">
            {/* Fixed Ethiopia prefix */}
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/8 rounded-xl px-3 h-12 text-white text-sm font-semibold select-none shrink-0">
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
              className="flex-1 bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={sendOtp}
          disabled={phone.length < 9 || loadingAction !== "" || (mode === "register" && !hasRegisterProfile)}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl h-12 text-base inline-flex items-center gap-2"
        >
          {loadingAction === "send" ? "Sending OTP..." : "Send OTP"}
          <ArrowRight className="w-4 h-4" />
        </Button>

        {otpSent && (
          <>
            <div>
              <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter OTP"
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={verifyOtp}
                disabled={loadingAction !== ""}
                className="bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 text-white rounded-xl h-12 text-base"
              >
                {loadingAction === "verify" ? "Verifying..." : otpVerified ? "Verified" : "Verify OTP"}
              </Button>
              <Button
                type="button"
                onClick={sendOtp}
                disabled={loadingAction !== ""}
                className="bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 text-white rounded-xl h-12 text-base"
              >
                Resend OTP
              </Button>
            </div>

            {mode === "register" && (
              <Button
                type="button"
                onClick={completeRegistration}
                disabled={!otpVerified || loadingAction !== ""}
                className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl h-12 text-base"
              >
                {loadingAction === "register" ? "Creating Account..." : "Complete Registration"}
              </Button>
            )}
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
      </form>

      {/* Terms */}
      <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand hover:text-brand-dark transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* Footer */}
      {mode !== "register" && (
        <p className="text-center text-gray-600 text-xs mt-6">
          New to the community?{" "}
          <Link href="/signup" className="text-brand hover:text-brand-dark font-semibold transition-colors">
            Sign Up
          </Link>
        </p>
      )}
    </AuthCard>
  );
}