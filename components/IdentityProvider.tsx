"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Identity } from "@/lib/types";
import { clearStoredIdentity, loadIdentity, saveIdentity } from "@/lib/identity-storage";

type IdentityContextValue = {
  identity: Identity | null;
  ready: boolean;
  signIn: (identity: Identity) => void;
  signOut: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // localStorage is unavailable during SSR, so the stored identity can
    // only be read after mount; this intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentity(loadIdentity());
    setReady(true);
  }, []);

  const signIn = useCallback((next: Identity) => {
    saveIdentity(next);
    setIdentity(next);
  }, []);

  const signOut = useCallback(() => {
    clearStoredIdentity();
    setIdentity(null);
  }, []);

  return (
    <IdentityContext.Provider value={{ identity, ready, signIn, signOut }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}
