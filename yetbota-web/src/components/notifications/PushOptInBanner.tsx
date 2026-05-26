"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useRegisterDeviceMutation } from "@/store/api/deviceApi";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { requestAndGetFcmToken } from "@/lib/firebase/messaging";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { useToast } from "@/hooks/use-toast";

// Opt-in prompt shown on the notification center until the user decides on
// browser notification permission. Self-hides when unsupported, already
// granted/denied, signed out, or Firebase isn't configured.
export default function PushOptInBanner() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { toast } = useToast();
  const [registerDevice] = useRegisterDeviceMutation();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function enable() {
    setEnabling(true);
    try {
      const token = await requestAndGetFcmToken();
      if (typeof Notification !== "undefined") setPermission(Notification.permission);
      if (!token) {
        toast({
          variant: "destructive",
          title: "Notifications not enabled",
          description: "Permission was denied or isn't available in this browser.",
        });
        return;
      }
      await registerDevice({
        device_id: getOrCreateDeviceId(),
        token,
        os: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }).unwrap();
      toast({ title: "Push notifications enabled" });
    } catch (err) {
      // Reaching here means token acquisition succeeded but registering the
      // device with the backend (POST /v1/devices/) failed.
      console.error("[push] device registration failed:", err);
      toast({ variant: "destructive", title: "Couldn't register device for push" });
    } finally {
      setEnabling(false);
    }
  }

  if (!accessToken || !isFirebaseConfigured() || permission !== "default") return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex w-9 h-9 rounded-xl bg-brand/15 items-center justify-center text-brand shrink-0">
          <Bell className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">Turn on push notifications</p>
          <p className="text-xs text-fg-muted">Get notified about replies, badges, and more.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void enable()}
        disabled={enabling}
        className="shrink-0 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-brand text-black font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {enabling ? "Enabling…" : "Enable"}
      </button>
    </div>
  );
}
