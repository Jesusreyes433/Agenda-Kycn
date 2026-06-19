"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  combineDateAndTime,
  formatDateKey,
  formatRange,
  parseDateInputValue,
  toTimeInputValue,
} from "@/lib/time";
import type { Appointment } from "@/lib/types";

export type ModalState =
  | { mode: "create"; defaultDate: Date }
  | { mode: "edit"; appointment: Appointment }
  | { mode: "view"; appointment: Appointment; memberName: string; memberColor: string };

type Props = {
  state: ModalState;
  currentMemberId: string;
  onClose: () => void;
  onSaved: () => void;
};

export function AppointmentModal({ state, currentMemberId, onClose, onSaved }: Props) {
  if (state.mode === "view") {
    return <ViewAppointment state={state} onClose={onClose} />;
  }
  return (
    <EditableAppointment
      state={state}
      currentMemberId={currentMemberId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ViewAppointment({
  state,
  onClose,
}: {
  state: { mode: "view"; appointment: Appointment; memberName: string; memberColor: string };
  onClose: () => void;
}) {
  const { appointment, memberName, memberColor } = state;
  const start = new Date(appointment.start_at);
  const end = new Date(appointment.end_at);

  return (
    <ModalShell title="Compromiso" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: memberColor }} />
          <span className="text-sm font-medium text-slate-700">{memberName}</span>
        </div>
        <p className="text-base font-semibold text-slate-900">{appointment.title}</p>
        <p className="text-sm text-slate-500">{formatRange(start, end)}</p>
      </div>
    </ModalShell>
  );
}

function EditableAppointment({
  state,
  currentMemberId,
  onClose,
  onSaved,
}: {
  state: { mode: "create"; defaultDate: Date } | { mode: "edit"; appointment: Appointment };
  currentMemberId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = state.mode === "edit" ? state.appointment : null;
  const initialDate = state.mode === "edit" ? new Date(state.appointment.start_at) : state.defaultDate;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [date, setDate] = useState(formatDateKey(initialDate));
  const [startTime, setStartTime] = useState(
    existing ? toTimeInputValue(new Date(existing.start_at)) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    existing ? toTimeInputValue(new Date(existing.end_at)) : "10:00"
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const day = parseDateInputValue(date);
    const start = combineDateAndTime(day, startTime);
    const end = combineDateAndTime(day, endTime);

    if (!title.trim()) {
      setError("Ponle un título al compromiso.");
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setError("La hora de fin debe ser después de la hora de inicio.");
      return;
    }

    setSaving(true);
    try {
      let overlapQuery = supabase
        .from("appointments")
        .select("id, title, start_at, end_at")
        .eq("member_id", currentMemberId)
        .lt("start_at", end.toISOString())
        .gt("end_at", start.toISOString());
      if (existing) {
        overlapQuery = overlapQuery.neq("id", existing.id);
      }
      const { data: overlapping, error: overlapError } = await overlapQuery;
      if (overlapError) throw overlapError;
      if (overlapping && overlapping.length > 0) {
        const conflict = overlapping[0];
        setError(
          `Ya tienes "${conflict.title}" en ese horario (${formatRange(
            new Date(conflict.start_at),
            new Date(conflict.end_at)
          )}). Cambia la hora o edita ese compromiso.`
        );
        setSaving(false);
        return;
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({
            title: title.trim(),
            notes: notes.trim() || null,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
          })
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("appointments").insert({
          member_id: currentMemberId,
          title: title.trim(),
          notes: notes.trim() || null,
          start_at: start.toISOString(),
          end_at: end.toISOString(),
        });
        if (insertError) throw insertError;
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    setDeleting(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("appointments")
        .delete()
        .eq("id", existing.id);
      if (deleteError) throw deleteError;
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo borrar. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalShell title={existing ? "Editar compromiso" : "Nuevo compromiso"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reunión con cliente, visita, llamada…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Desde</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Hasta</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Notas <span className="text-slate-400">(opcional, solo la ves tú)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Detalles, dirección, cliente…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Borrando…" : "Borrar"}
            </button>
          )}
          <button
            type="submit"
            disabled={saving || deleting}
            className="flex-1 rounded-lg bg-[#0F2540] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#16345C] disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
