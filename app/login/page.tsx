"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-kycn.svg" alt="Kycn" className="mx-auto mb-3 h-20 w-auto" />
          <h1 className="text-lg font-semibold text-slate-900">Agenda Kycn</h1>
          <p className="mt-1 text-sm text-slate-500">Acceso solo para el equipo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña del equipo
            </label>
            <input
              id="password"
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2540] focus:ring-2 focus:ring-[#0F2540]/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">Contraseña incorrecta.</p>}
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full rounded-lg bg-[#0F2540] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16345C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
