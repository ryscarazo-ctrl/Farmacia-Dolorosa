'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, BellRing, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const BroadcastModal: React.FC = () => {
  const { alerts, markAlertAsRead } = usePharmacy();
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null);

  useEffect(() => {
    // Buscar alertas que contengan el anuncio global
    const broadcast = alerts.find(
      (a) =>
        !a.isRead &&
        (a.title.includes('ABRE LA APP') || a.title.includes('📢') || a.severity === 'Critical')
    );
    if (broadcast) {
      setActiveBroadcast(broadcast);
    }
  }, [alerts]);

  if (!activeBroadcast) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border-2 border-emerald-500/40 p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Icono animado */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-pulse">
          <Megaphone className="w-10 h-10" />
        </div>

        {/* Mensaje Gigante */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>Aviso Global en Tiempo Real</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            {activeBroadcast.title}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-md mx-auto">
            {activeBroadcast.message}
          </p>
        </div>

        {/* Indicador de Dispositivos */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-emerald-200">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Teléfonos Conectados</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-emerald-200">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Computadoras / Caja</span>
          </div>
        </div>

        {/* Botón de Confirmación */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              markAlertAsRead(activeBroadcast.id);
              setActiveBroadcast(null);
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-slate-950" />
            <span>¡Entendido! Cerrar Aviso</span>
          </button>
        </div>
      </div>
    </div>
  );
};
