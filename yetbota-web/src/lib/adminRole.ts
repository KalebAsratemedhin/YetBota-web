// Admin-area role & status helpers.
//
// The user's role is NOT in the redux auth slice (that holds only an
// AuthUserRef) — it comes from `getMe`. The admin guard reads it from there and
// runs it through `isAdminRole`. Backend status strings are not yet centrally
// documented, so the USER_STATUS constants below are the single place to adjust
// if the API uses different values.

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return r === "admin" || r === "super_admin" || r === "superadmin" || r.includes("admin");
}

// Account states used by the Users table for ban / unban. Adjust here if the
// backend uses different strings.
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export function isBanned(status?: string | null): boolean {
  return (status ?? "").trim().toUpperCase() === USER_STATUS.BANNED;
}

export function isInactive(status?: string | null): boolean {
  return (status ?? "").trim().toUpperCase() === USER_STATUS.INACTIVE;
}
