"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRegisterDeviceMutation } from "@/store/api/deviceApi";
import { getFcmTokenIfPermitted, onForegroundMessage } from "@/lib/firebase/messaging";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { contentBaseApi } from "@/store/api/contentBaseApi";
import { useToast } from "@/hooks/use-toast";

// Headless. Mounted on the authed surface to (a) silently refresh a previously
// granted FCM token and register the device, and (b) surface foreground pushes
// as toasts while refreshing the notification center. No-ops when Firebase is
// unconfigured, push is unsupported, or permission hasn't been granted.
export default function PushRegistration() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [registerDevice] = useRegisterDeviceMutation();
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken || !isFirebaseConfigured()) return;
    let cancelled = false;
    void (async () => {
      const token = await getFcmTokenIfPermitted();
      if (cancelled || !token || registeredTokenRef.current === token) return;
      registeredTokenRef.current = token;
      try {
        await registerDevice({
          device_id: getOrCreateDeviceId(),
          token,
          os: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }).unwrap();
      } catch {
        registeredTokenRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, registerDevice]);

  useEffect(() => {
    if (!accessToken || !isFirebaseConfigured()) return;
    let cancelled = false;
    let unsubscribe = () => {};
    void (async () => {
      const off = await onForegroundMessage((payload) => {
        const data = payload.data ?? {};
        toast({
          title: payload.notification?.title || data.title || "New notification",
          description: payload.notification?.body || data.body || undefined,
        });
        dispatch(contentBaseApi.util.invalidateTags(["Notification"]));
      });
      if (cancelled) off();
      else unsubscribe = off;
    })();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [accessToken, dispatch, toast]);

  return null;
}
