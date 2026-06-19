"use client";

import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { nextMemberColor } from "@/lib/colors";
import { useIdentity } from "./IdentityProvider";

export function NameGate() {
  const { signIn } = useIdentity();
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
        signIn({ id: existing.id, name: existing.name });
        return;
      }

      const { count } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true });

      const { data: created, error: insertError } = await supabase
        .from("team_members")
        .insert({ name: trimmed, color: nextMemberColor(count ?? 0) })
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
            signIn({ id: retry.id, name: retry.name });
            return;
          }
        }
        throw insertError;
      }

      if (created) signIn({ id: created.id, name: created.name });
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con la base de datos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="text-center text-xs text-slate-400">
            Usa el mismo nombre cada vez para identificar tus compromisos.
          </p>
        </form>
      </div>
    </div>
  );
}
