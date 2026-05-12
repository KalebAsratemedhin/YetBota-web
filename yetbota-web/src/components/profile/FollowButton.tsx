"use client";

import { useState } from "react";
import { useFollowUserMutation, useUnfollowUserMutation } from "@/store/api/authApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";

function followStorageKey(meId: string, followeeId: string) {
  return `yetbota.following.${meId}.${followeeId}`;
}

function readStoredFollowing(meId?: string, followeeId?: string): boolean | null {
  if (!meId || !followeeId) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(followStorageKey(meId, followeeId));
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function writeStoredFollowing(meId: string, followeeId: string, following: boolean) {
  if (!meId || !followeeId) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(followStorageKey(meId, followeeId), following ? "true" : "false");
  } catch {
    // ignore
  }
}

export default function FollowButton({ meId, followeeId }: { meId: string; followeeId: string }) {
  const { toast } = useToast();
  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();
  const [override, setOverride] = useState<boolean | null>(null);
  const stored = readStoredFollowing(meId, followeeId);
  const isFollowing = override ?? stored ?? false;
  const busy = followLoading || unfollowLoading;

  async function handleToggle() {
    try {
      const next = !isFollowing;
      setOverride(next);
      writeStoredFollowing(meId, followeeId, next);
      if (next) {
        await followUser({ followee_id: followeeId }).unwrap();
      } else {
        await unfollowUser({ followee_id: followeeId }).unwrap();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: getAuthErrorMessage(err) });
      setOverride(readStoredFollowing(meId, followeeId) ?? false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={busy}
      className={
        "px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-60 " +
        (isFollowing
          ? "bg-slate-100 dark:bg-surface text-slate-900 dark:text-fg border border-slate-200 dark:border-border-subtle hover:bg-slate-200 dark:hover:bg-surface-2"
          : "bg-brand text-white hover:bg-brand/90")
      }
    >
      {busy ? "…" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
