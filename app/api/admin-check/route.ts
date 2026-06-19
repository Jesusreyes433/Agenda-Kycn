import { NextResponse } from "next/server";
import { tokensMatch } from "@/lib/access";

export async function POST(request: Request) {
  const expected = process.env.AGENDA_ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "AGENDA_ADMIN_PASSWORD no está configurada en el servidor." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !tokensMatch(password, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
