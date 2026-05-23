export const SESSION_COOKIE_NAME = "yetbota_session";

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE_NAME}=1; Path=/; Max-Age=${SEVEN_DAYS_SECONDS}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
