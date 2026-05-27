"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateMobileOtpMutation,
  useValidateMobileOtpMutation,
  useNewPasswordMutation,
} from "@/store/api/authApi";
import type { OtpLimits } from "@/types/auth";

const MIN_PASSWORD_LENGTH = 8;

function createRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// The OTP counters live on successful responses, but the backend also echoes
// them on rate-limit errors. Pull them off whatever shape we're handed.
function readOtpLimits(payload: unknown): OtpLimits | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.otp_req_count === "number" &&
    typeof p.max_otp_req === "number" &&
    typeof p.otp_err_count === "number" &&
    typeof p.max_otp_err === "number"
  ) {
    return p as unknown as OtpLimits;
  }
  if ("data" in p) return readOtpLimits(p.data);
  return null;
}

type Step = "phone" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Generated once when the flow starts and reused as the OTP session key across
  // all three calls. Losing it (e.g. a reload) restarts the flow at step 1.
  const [random, setRandom] = useState<string | null>(null);
  const [limits, setLimits] = useState<OtpLimits | null>(null);

  const [sendOtp, { isLoading: isSendingOtp }] = useGenerateMobileOtpMutation();
  const [validateOtp, { isLoading: isValidatingOtp }] = useValidateMobileOtpMutation();
  const [setNewPassword, { isLoading: isSettingPassword }] = useNewPasswordMutation();

  const mobile = `+251${phone}`;
  const requestsExhausted = limits ? limits.otp_req_count >= limits.max_otp_req : false;
  const errorsExhausted = limits ? limits.otp_err_count >= limits.max_otp_err : false;
  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  async function handleSendOtp() {
    // Reuse the session key on resend; only mint a new one on a fresh request.
    const r = random ?? createRandom();
    setRandom(r);
    try {
      const res = await sendOtp({ mobile, random: r }).unwrap();
      setLimits(readOtpLimits(res));
      setStep("otp");
      toast({ title: "OTP sent", description: `We sent a code to ${mobile}.` });
    } catch (err) {
      const recovered = readOtpLimits((err as { data?: unknown })?.data);
      if (recovered) setLimits(recovered);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleValidateOtp() {
    if (!random) return;
    try {
      const res = await validateOtp({ mobile, random, otp: otp.trim() }).unwrap();
      setLimits(readOtpLimits(res));
      setStep("password");
      toast({ title: "Code verified", description: "Choose a new password." });
    } catch (err) {
      const recovered = readOtpLimits((err as { data?: unknown })?.data);
      if (recovered) setLimits(recovered);
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: getAuthErrorMessage(err),
      });
    }
  }

  async function handleSetPassword() {
    if (!random) return;
    if (password.length < MIN_PASSWORD_LENGTH || password !== confirm) return;
    try {
      await setNewPassword({ mobile, random, password }).unwrap();
      setStep("done");
      toast({ title: "Password updated", description: "You can now sign in." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't update password",
        description: getAuthErrorMessage(err),
      });
    }
  }

  function restart() {
    setStep("phone");
    setOtp("");
    setPassword("");
    setConfirm("");
    setRandom(null);
    setLimits(null);
  }

  const requestsLeft = limits ? Math.max(0, limits.max_otp_req - limits.otp_req_count) : null;
  const errorsLeft = limits ? Math.max(0, limits.max_otp_err - limits.otp_err_count) : null;

  return (
    <AuthCard title="Reset Password" backHref="/signin">
      <div className="text-center mb-8">
        <h1 className="text-fg text-2xl font-bold mb-2">
          {step === "done" ? "All set." : "Reset your password"}
        </h1>
        <p className="text-fg-faint text-sm max-w-65 mx-auto leading-relaxed">
          {step === "phone" && "Enter your phone number and we'll text you a verification code."}
          {step === "otp" && `Enter the 6-digit code we sent to ${mobile}.`}
          {step === "password" && "Choose a new password for your account."}
          {step === "done" && "Your password has been updated successfully."}
        </p>
      </div>

      {step === "done" ? (
        <div className="flex flex-col items-center gap-6">
          <CheckCircle2 className="w-14 h-14 text-brand" />
          <Button
            onClick={() => router.push("/signin")}
            className="w-full bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 text-base inline-flex items-center gap-2"
          >
            Back to Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (step === "phone") void handleSendOtp();
            else if (step === "otp") void handleValidateOtp();
            else void handleSetPassword();
          }}
        >
          {/* Phone number — locked once a code is on its way */}
          <div>
            <label className="text-sm text-fg-muted font-medium mb-1.5 block">Phone Number</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-surface-2 border border-border-subtle rounded-xl px-3 h-12 text-fg text-sm font-semibold select-none shrink-0">
                <span>Et</span>
                <span>+251</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="912 345 678"
                className="flex-1 bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all disabled:opacity-60"
                disabled={isSendingOtp || step !== "phone"}
              />
            </div>
            {step !== "phone" && (
              <button
                type="button"
                className="text-xs text-fg-muted hover:text-fg transition-colors mt-2"
                onClick={restart}
                disabled={isValidatingOtp || isSettingPassword}
              >
                Change phone number
              </button>
            )}
          </div>

          {step === "otp" && (
            <div>
              <label className="text-sm text-fg-muted font-medium mb-1.5 block">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm tracking-[0.3em] outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                disabled={isValidatingOtp || errorsExhausted}
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-fg-faint">
                  {errorsLeft !== null && errorsLeft < (limits?.max_otp_err ?? 0)
                    ? `${errorsLeft} attempt${errorsLeft === 1 ? "" : "s"} left`
                    : ""}
                </span>
                <button
                  type="button"
                  className="text-xs text-fg-muted hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => void handleSendOtp()}
                  disabled={isSendingOtp || isValidatingOtp || requestsExhausted}
                >
                  {isSendingOtp
                    ? "Sending…"
                    : requestsExhausted
                      ? "No requests left"
                      : requestsLeft !== null
                        ? `Resend code (${requestsLeft} left)`
                        : "Resend code"}
                </button>
              </div>

              {errorsExhausted && (
                <p className="text-red-400 text-xs mt-2">
                  Too many incorrect attempts.{" "}
                  <button type="button" onClick={restart} className="underline underline-offset-2">
                    Start over
                  </button>
                </p>
              )}
            </div>
          )}

          {step === "password" && (
            <>
              <AuthInput
                label="New Password"
                type="password"
                placeholder="········"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSettingPassword}
                error={passwordTooShort ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
              />
              <AuthInput
                label="Confirm Password"
                type="password"
                placeholder="········"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isSettingPassword}
                error={passwordsMismatch ? "Passwords don't match" : undefined}
              />
            </>
          )}

          <Button
            type="submit"
            disabled={
              (step === "phone" && (phone.length < 9 || isSendingOtp)) ||
              (step === "otp" && (otp.trim().length < 4 || isValidatingOtp || errorsExhausted)) ||
              (step === "password" &&
                (password.length < MIN_PASSWORD_LENGTH ||
                  password !== confirm ||
                  isSettingPassword))
            }
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl h-12 text-base inline-flex items-center gap-2"
          >
            {step === "phone" && (isSendingOtp ? "Sending…" : "Send Code")}
            {step === "otp" && (isValidatingOtp ? "Verifying…" : "Verify Code")}
            {step === "password" && (isSettingPassword ? "Updating…" : "Update Password")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      <p className="text-center text-fg-faint text-xs mt-8">
        Remembered it?{" "}
        <Link href="/signin" className="text-brand hover:text-brand-dark font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
