"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, ShieldCheck, Save, Camera, Palette } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/admin/AdminUI";
import AuthInput from "@/components/auth/AuthInput";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { readFileAsBase64 } from "@/lib/readFileAsBase64";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import {
  useGetMeQuery,
  useUpdateSelfMutation,
  useChangePasswordMutation,
  useUploadMyProfileImageMutation,
} from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import type { UserPrivate } from "@/types/auth";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function SettingsForm({ user }: { user: UserPrivate }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(() => user.first_name);
  const [lastName, setLastName] = useState(() => user.last_name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateSelf, { isLoading: savingProfile }] = useUpdateSelfMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadMyProfileImageMutation();

  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;
  const avatar = user.profile_url ? resolveApiUrl(user.profile_url) : "";
  const saving = savingProfile || savingPassword;

  function resetForm() {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please choose an image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({ variant: "destructive", title: "File too large", description: "Choose an image under 8 MB." });
      return;
    }
    try {
      const image_base64 = await readFileAsBase64(file);
      await uploadImage({ image_base64 }).unwrap();
      toast({ title: "Avatar updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed", description: getAuthErrorMessage(err) });
    }
  }

  async function handleSave() {
    const nameChanged =
      firstName.trim() !== user.first_name || lastName.trim() !== user.last_name;
    const wantsPassword = newPassword.length > 0 || confirmPassword.length > 0;

    if (!nameChanged && !wantsPassword) {
      toast({ title: "Nothing to save" });
      return;
    }

    try {
      if (nameChanged) {
        await updateSelf({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: user.username.replace(/^@/, ""),
        }).unwrap();
      }

      if (wantsPassword) {
        if (!currentPassword) {
          toast({ variant: "destructive", title: "Current password required" });
          return;
        }
        if (newPassword !== confirmPassword) {
          toast({ variant: "destructive", title: "Passwords don't match" });
          return;
        }
        await changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        }).unwrap();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      toast({ title: "Changes saved" });
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed", description: getAuthErrorMessage(err) });
    }
  }

  return (
    <>
      <SectionCard title="Profile Settings" icon={User} bodyClassName="p-6 space-y-8">
        <div className="flex flex-wrap items-center gap-6 border-b border-border-subtle pb-8">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-brand/50 bg-surface-3">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-fg-muted">
                  {fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity hover:opacity-100"
              aria-label="Upload new avatar"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-fg text-lg font-bold leading-tight">{fullName}</p>
            <p className="text-fg-muted text-sm">
              {user.username.startsWith("@") ? user.username : `@${user.username}`}
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-3 rounded-lg border border-brand/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload New Avatar"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AuthInput
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <AuthInput
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div className="md:col-span-2">
            <AuthInput label="Phone Number" value={user.mobile} disabled type="tel" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Security" icon={ShieldCheck} bodyClassName="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <AuthInput
              label="Current Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <AuthInput
            label="New Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={resetForm}
          disabled={saving}
          className="px-6 py-3 text-sm font-bold text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default function AdminSettingsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading } = useGetMeQuery(undefined, { skip: !accessToken });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and platform preferences" />

      {isLoading || !data ? (
        <div className="rounded-2xl border border-border-subtle bg-surface p-10 text-center text-sm text-fg-muted shadow-sm">
          Loading your profile…
        </div>
      ) : (
        <SettingsForm user={data.user} />
      )}

      <SectionCard title="Appearance" icon={Palette} bodyClassName="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-fg font-semibold">Theme</p>
            <p className="text-fg-muted text-sm">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle />
        </div>
      </SectionCard>
    </div>
  );
}
