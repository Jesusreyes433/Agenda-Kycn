import type { Identity } from "./types";

const STORAGE_KEY = "agenda-kycn:identity";

export function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && typeof parsed.name === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function clearStoredIdentity(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
