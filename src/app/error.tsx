'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Si es un error de carga de chunk o red, reintentar automáticamente una vez
    if (
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch')
    ) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center select-none">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Farmacia Espíritu Santo 🕊️</h2>
          <p className="text-xs text-slate-400 mt-1">
            Se detectó una actualización en el sistema o reconexión de red.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Recargar Sistema Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
