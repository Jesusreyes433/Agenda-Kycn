"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { nextMemberColor } from "@/lib/colors";
import type { TeamMember } from "@/lib/types";
import { useIdentity } from "./IdentityProvider";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F2540] text-lg font-semibold text-white">
            AK
          </div>
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("team_members")
      .select("*")
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

  if (members.length > 0 && !showCreateForm) {
    return (
      <Shell>
        <div className="space-y-2">
          <p className="mb-1 text-sm font-medium text-slate-700">¿Quién eres?</p>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full pt-2 text-center text-sm font-medium text-[#0F2540] hover:underline"
          >
            No estoy en la lista, soy nuevo
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <CreateForm
        onBack={members.length > 0 ? () => setShowCreateForm(false) : undefined}
        existingCount={members.length}
        onCreated={(member) => signIn(member)}
      />
    </Shell>
  );
}

function CreateForm({
  onBack,
  existingCount,
  onCreated,
}: {
  onBack?: () => void;
  existingCount: number;
  onCreated: (member: { id: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured) {
      setError(
        "Falta conectar la base de datos de Supabase. Configura las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver README)."
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data: existing, error: selectError } = await supabase
        .from("team_members")
        .select("id, name")
        .ilike("name", trimmed)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        onCreated({ id: existing.id, name: existing.name });
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from("team_members")
        .insert({ name: trimmed, color: nextMemberColor(existingCount) })
        .select("id, name")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: retry } = await supabase
            .from("team_members")
            .select("id, name")
            .ilike("name", trimmed)
            .maybeSingle();
          if (retry) {
            onCreated({ id: retry.id, name: retry.name });
            return;
          }
        }
        throw insertError;
      }

      if (created) onCreated({ id: created.id, name: created.name });
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con la base de datos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          ¿Cómo te llamas?
        </label>
        <input
          id="name"
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre y apellido"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="w-full rounded-lg bg-[#0F2540] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16345C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Entrando…" : "Entrar"}
      </button>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-slate-500 hover:underline"
        >
          Volver a la lista
        </button>
      ) : (
        <p className="text-center text-xs text-slate-400">
          La próxima vez podrás elegir tu nombre de una lista, sin escribirlo de nuevo.
        </p>
      )}
    </form>
  );
}
