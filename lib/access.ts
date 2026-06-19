import { createHmac, timingSafeEqual } from "crypto";

export const ACCESS_COOKIE_NAME = "agenda_kycn_access";

export function computeAccessToken(password: string): string {
  return createHmac("sha256", "agenda-kycn-access-salt").update(password).digest("hex");
}

export function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
