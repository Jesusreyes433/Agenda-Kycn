import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, computeAccessToken, tokensMatch } from "@/lib/access";

export async function POST(request: Request) {
  const expected = process.env.AGENDA_ACCESS_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "AGENDA_ACCESS_PASSWORD no está configurada en el servidor." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !tokensMatch(password, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, computeAccessToken(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return response;
}
