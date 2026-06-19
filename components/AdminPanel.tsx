"use client";

import { useEffect, useState } from "react";
import { nextMemberColor } from "@/lib/colors";
import { supabase } from "@/lib/supabase";
import type { TeamMember } from "@/lib/types";

type Props = {
  onClose: () => void;
};

export function AdminPanel({ onClose }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setError(null);
    setAdding(true);
    const { error: insertError } = await supabase.from("team_members").insert({
      name: trimmed,
      color: nextMemberColor(members.length),
      is_admin: false,
      active: true,
    });
    setAdding(false);
    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Ya existe alguien con ese nombre."
          : "No se pudo agregar. Intenta de nuevo."
      );
      return;
    }
    setNewName("");
    load();
  }

  async function toggleActive(member: TeamMember) {
    setError(null);
    setBusyId(member.id);
    await supabase.from("team_members").update({ active: !member.active }).eq("id", member.id);
    await load();
    setBusyId(null);
  }

  async function handleRename(member: TeamMember) {
    const next = window.prompt("Nuevo nombre", member.name);
    if (!next || !next.trim() || next.trim() === member.name) return;
    setError(null);
    setBusyId(member.id);
    const { error: updateError } = await supabase
      .from("team_members")
      .update({ name: next.trim() })
      .eq("id", member.id);
    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "Ya existe alguien con ese nombre."
          : "No se pudo renombrar."
      );
    }
    await load();
    setBusyId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Equipo</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                <p
                  className={`min-w-0 flex-1 truncate text-sm font-medium ${
                    member.active ? "text-slate-800" : "text-slate-400 line-through"
                  }`}
                >
                  {member.name}
                  {member.is_admin && (
                    <span className="ml-1 text-[10px] font-normal text-[#0F2540]">(admin)</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => handleRename(member)}
                  disabled={busyId === member.id}
                  className="flex-shrink-0 text-xs text-slate-500 hover:underline disabled:opacity-50"
                >
                  Renombrar
                </button>
                {!member.is_admin && (
                  <button
                    type="button"
                    onClick={() => toggleActive(member)}
                    disabled={busyId === member.id}
                    className={`flex-shrink-0 text-xs font-medium hover:underline disabled:opacity-50 ${
                      member.active ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {member.active ? "Dar de baja" : "Reactivar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleAdd} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del nuevo integrante"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="flex-shrink-0 rounded-lg bg-[#0F2540] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
