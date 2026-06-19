import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, computeAccessToken, tokensMatch } from "@/lib/access";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/login",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/logo-kycn.svg",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/icons/")) {
    return NextResponse.next();
  }

  const expected = process.env.AGENDA_ACCESS_PASSWORD;
  if (!expected) {
    // Sin contraseña configurada (ej. desarrollo local sin .env.local), no bloquear.
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (cookie && tokensMatch(cookie, computeAccessToken(expected))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
