"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setShow(isIOS && !isStandalone);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="flex-1 text-xs text-slate-600">
        Instala Agenda Kycn en tu iPhone: toca el ícono de{" "}
        <strong className="font-medium text-slate-700">Compartir</strong>{" "}
        (el cuadro con la flecha hacia arriba) y luego &quot;Agregar a inicio&quot;.
      </p>
      <button
        onClick={() => setShow(false)}
        aria-label="Cerrar"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
      >
        ×
      </button>
    </div>
  );
}
