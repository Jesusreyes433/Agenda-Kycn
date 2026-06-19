"use client";

import { formatDayLabel, goToDay, isToday } from "@/lib/time";
import type { Identity } from "@/lib/types";

type Props = {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  identity: Identity;
  onSignOut: () => void;
};

export function Header({ selectedDate, onChangeDate, identity, onSignOut }: Props) {
  const label = formatDayLabel(selectedDate);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2540] text-xs font-semibold text-white">
            AK
          </div>
          <span className="text-sm font-semibold text-slate-900">Agenda Kycn</span>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200"
          title="Cambiar de usuario"
        >
          <span className="font-medium">{identity.name}</span>
          <span className="text-xs text-slate-400">cambiar</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        <button
          onClick={() => onChangeDate(goToDay(selectedDate, -1))}
          aria-label="Día anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          ‹
        </button>

        <div className="flex flex-1 flex-col items-center">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {!isToday(selectedDate) && (
            <button
              onClick={() => onChangeDate(new Date())}
              className="text-xs font-medium text-[#0F2540] hover:underline"
            >
              Ir a hoy
            </button>
          )}
        </div>

        <button
          onClick={() => onChangeDate(goToDay(selectedDate, 1))}
          aria-label="Día siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          ›
        </button>
      </div>
    </header>
  );
}
