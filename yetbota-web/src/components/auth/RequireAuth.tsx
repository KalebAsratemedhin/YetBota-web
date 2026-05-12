"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

type RequireAuthProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function RequireAuth({ children, redirectTo = "/signin" }: RequireAuthProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace(redirectTo);
    }
  }, [accessToken, redirectTo, router]);

  if (!accessToken) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-fg-faint text-sm">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
