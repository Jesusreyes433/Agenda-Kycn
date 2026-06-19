"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Identity } from "@/lib/types";

type IdentityContextValue = {
  identity: Identity | null;
  signIn: (identity: Identity) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  // La identidad vive solo en memoria (nada de localStorage): cada vez que
  // se recarga o se abre la app de nuevo, hay que volver a elegir el nombre.
  const [identity, setIdentity] = useState<Identity | null>(null);

  const signIn = useCallback((next: Identity) => {
    setIdentity(next);
  }, []);

  return (
    <IdentityContext.Provider value={{ identity, signIn }}>{children}</IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}
