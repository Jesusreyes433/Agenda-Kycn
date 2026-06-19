"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { TeamMember } from "@/lib/types";
import { useIdentity } from "./IdentityProvider";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-kycn.svg" alt="Kycn" className="mx-auto mb-3 h-20 w-auto" />
          <h1 className="text-lg font-semibold text-slate-900">Agenda Kycn</h1>
          <p className="mt-1 text-sm text-slate-500">
            Agenda compartida del equipo de consultores
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NameGate() {
  const { signIn } = useIdentity();
  const [members, setMembers] = useState<TeamMember[] | null>(
    isSupabaseConfigured ? null : []
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("team_members")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data }) => setMembers(data ?? []));
  }, []);

  if (members === null) {
    return (
      <Shell>
        <p className="text-center text-sm text-slate-400">Cargando…</p>
      </Shell>
    );
  }

  if (members.length === 0) {
    return (
      <Shell>
        <p className="text-center text-sm text-slate-500">
          Todavía no hay nadie registrado. Pide al administrador del equipo que
          te agregue desde el panel de &quot;Equipo&quot;.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-2">
        <p className="mb-1 text-sm font-medium text-slate-700">¿Quién eres?</p>
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => signIn({ id: member.id, name: member.name })}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition-colors hover:border-[#0F2540] hover:bg-slate-50"
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              {member.name}
            </button>
          ))}
        </div>
        <p className="pt-2 text-center text-xs text-slate-400">
          ¿No estás en la lista? Pide al administrador que te agregue.
        </p>
      </div>
    </Shell>
  );
}
