import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/sessionCookie";

export function middleware(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE_NAME)?.value) return;
  const signinUrl = new URL("/signin", req.url);
  signinUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signinUrl);
}

export const config = {
  matcher: ["/create/:path*", "/profile/:path*", "/settings/:path*"],
};
