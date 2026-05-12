"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthInput from "@/components/auth/AuthInput";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import {
  useChangeMobileMutation,
  useChangePasswordMutation,
  useGenerateMobileOtpMutation,
  useGetMeQuery,
  useUpdateSelfMutation,
  useValidateMobileOtpMutation,
} from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import type { UserPrivate } from "@/types/auth";

function createRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border-subtle rounded-2xl p-6 mb-6">
      <h2 className="text-fg font-bold text-lg mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ProfileFieldsForm({ user, onSaved }: { user: UserPrivate; onSaved: () => void }) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(() => user.first_name);
  const [lastName, setLastName] = useState(() => user.last_name);
  const [updateSelf, { isLoading: savingProfile }] = useUpdateSelfMutation();

  const usernameDisplay = user.username.startsWith("@") ? user.username : `@${user.username}`;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSelf({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: user.username.replace(/^@/, ""),
      }).unwrap();
      toast({ title: "Profile updated" });
      onSaved();
    } catch (err) {
      toast({ variant: "destructive", title: "Update failed", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSaveProfile}>
      {/* <p className="text-fg-faint text-xs -mt-1 mb-1">Phone number can be updated in the section below.</p> */}
      <AuthInput
        label="Username"
        value={usernameDisplay}
        disabled
        readOnly
        autoComplete="username"
        className="opacity-70 cursor-not-allowed"
      />
      <AuthInput
        label="Phone number"
        value={user.mobile}
        disabled
        readOnly
        autoComplete="tel"
        className="opacity-70 cursor-not-allowed"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthInput label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <AuthInput label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <Button
        type="submit"
        disabled={savingProfile}
        className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl"
      >
        {savingProfile ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export default function SettingsContent() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useGetMeQuery(undefined, { skip: !accessToken });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newMobileSubscriber9, setNewMobileSubscriber9] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneRandom, setPhoneRandom] = useState<string | null>(null);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [sendPhoneOtp, { isLoading: sendingPhoneOtp }] = useGenerateMobileOtpMutation();
  const [validatePhoneOtp, { isLoading: validatingPhoneOtp }] = useValidateMobileOtpMutation();
  const [changeMobile, { isLoading: changingMobile }] = useChangeMobileMutation();

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Password change failed", description: getAuthErrorMessage(err) });
    }
  }

  async function handleSendPhoneOtp() {
    if (newMobileSubscriber9.trim().length !== 9) {
      toast({ variant: "destructive", title: "Enter a new phone number" });
      return;
    }
    const mobile = `+251${newMobileSubscriber9}`;
    const random = createRandom();
    setPhoneRandom(random);
    setPhoneOtpVerified(false);
    setPhoneOtp("");
    try {
      await sendPhoneOtp({ mobile, random }).unwrap();
      toast({ title: "Code sent", description: `We sent a code to ${mobile}.` });
    } catch (err) {
      setPhoneRandom(null);
      toast({ variant: "destructive", title: "Could not send code", description: getAuthErrorMessage(err) });
    }
  }

  async function handleVerifyPhoneOtp() {
    if (!phoneRandom) return;
    const mobile = `+251${newMobileSubscriber9}`;
    try {
      await validatePhoneOtp({ mobile, random: phoneRandom, otp: phoneOtp.trim() }).unwrap();
      setPhoneOtpVerified(true);
      toast({ title: "Phone verified", description: "You can update your number now." });
    } catch (err) {
      toast({ variant: "destructive", title: "Invalid code", description: getAuthErrorMessage(err) });
    }
  }

  async function handleSaveNewPhone() {
    if (!phoneRandom || !phoneOtpVerified) {
      toast({ variant: "destructive", title: "Verify the code first" });
      return;
    }
    try {
      await changeMobile({ new_mobile: `+251${newMobileSubscriber9}`, random: phoneRandom }).unwrap();
      setNewMobileSubscriber9("");
      setPhoneOtp("");
      setPhoneRandom(null);
      setPhoneOtpVerified(false);
      toast({ title: "Phone number updated" });
      void refetch();
    } catch (err) {
      toast({ variant: "destructive", title: "Update failed", description: getAuthErrorMessage(err) });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm bg-bg text-fg-faint">
        Loading settings…
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-bg text-fg px-6">
        <p className="text-fg-muted text-sm">Could not load your profile.</p>
        <Button type="button" variant="outline" onClick={() => void refetch()} className="border-border-subtle">
          Retry
        </Button>
        <Link href="/profile" className="text-brand text-sm font-semibold">
          Back to profile
        </Link>
      </div>
    );
  }

  const me = data.user;

  return (
    <div className="bg-bg text-fg min-h-full">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border-subtle text-fg-muted hover:text-fg hover:bg-overlay transition-colors"
            aria-label="Back to profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-fg-faint text-sm">Manage your account and security</p>
          </div>
        </div>

        <SettingsSection title="Appearance">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-fg text-sm font-medium">Theme</p>
              <p className="text-fg-faint text-xs mt-0.5">Choose how Yet Bota looks to you.</p>
            </div>
            <ThemeToggle />
          </div>
        </SettingsSection>

        <SettingsSection title="Profile">
          <ProfileFieldsForm key={`${me.id}-${me.updated_at}`} user={me} onSaved={() => void refetch()} />
        </SettingsSection>

        <SettingsSection title="Change password">
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <AuthInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <AuthInput
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <AuthInput
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword}
              className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl"
            >
              {changingPassword ? "Updating…" : "Update password"}
            </Button>
          </form>
        </SettingsSection>

        <SettingsSection title="Change phone number">
          <p className="text-fg-faint text-xs mb-4">
            Enter your new number, request a code, verify it, then save.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-fg-muted font-medium mb-1.5 block">New Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-surface-2 border border-border-subtle rounded-xl px-3 h-12 text-fg text-sm font-semibold select-none shrink-0">
                  <span>Et</span>
                  <span>+251</span>
                </div>
                <input
                  type="tel"
                  value={newMobileSubscriber9}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setNewMobileSubscriber9(val);
                  }}
                  placeholder="912 345 678"
                  className="flex-1 bg-surface-2 border border-border-subtle rounded-xl px-4 h-12 text-fg placeholder-gray-600 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                  disabled={changingMobile || sendingPhoneOtp || validatingPhoneOtp}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-border-subtle text-fg"
                onClick={() => void handleSendPhoneOtp()}
                disabled={sendingPhoneOtp || newMobileSubscriber9.trim().length !== 9}
              >
                {sendingPhoneOtp ? "Sending…" : "Send verification code"}
              </Button>
            </div>
            {phoneRandom && (
              <>
                <AuthInput
                  label="Verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border-subtle text-fg"
                    onClick={() => void handleVerifyPhoneOtp()}
                    disabled={validatingPhoneOtp || phoneOtp.trim().length < 4}
                  >
                    {validatingPhoneOtp ? "Verifying…" : "Verify code"}
                  </Button>
                  {phoneOtpVerified ? (
                    <span className="text-brand text-sm font-semibold">Verified</span>
                  ) : null}
                </div>
              </>
            )}
            <Button
              type="button"
              disabled={changingMobile || !phoneOtpVerified}
              className="bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl"
              onClick={() => void handleSaveNewPhone()}
            >
              {changingMobile ? "Saving…" : "Save new phone number"}
            </Button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
