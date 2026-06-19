"use client";

import type { Identity } from "@/lib/types";

export type ViewMode = "day" | "week" | "month";

type Props = {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  label: string;
  showTodayShortcut: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  identity: Identity;
  isAdmin: boolean;
  onOpenAdmin: () => void;
};

const VIEW_OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: "day", label: "Día" },
  { mode: "week", label: "Semana" },
  { mode: "month", label: "Mes" },
];

export function Header({
  viewMode,
  onChangeViewMode,
  label,
  showTodayShortcut,
  onPrev,
  onNext,
  onToday,
  identity,
  isAdmin,
  onOpenAdmin,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kycn-mark.svg" alt="Kycn" className="h-8 w-auto" />

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Equipo
            </button>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
            {identity.name}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        <button
          onClick={onPrev}
          aria-label="Anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          ‹
        </button>

        <div className="flex flex-1 flex-col items-center">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {showTodayShortcut && (
            <button onClick={onToday} className="text-xs font-medium text-[#0F2540] hover:underline">
              Ir a hoy
            </button>
          )}
        </div>

        <button
          onClick={onNext}
          aria-label="Siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-1 border-t border-slate-100 px-4 py-2">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.mode}
            onClick={() => onChangeViewMode(option.mode)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              viewMode === option.mode
                ? "bg-[#0F2540] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </header>
  );
}
