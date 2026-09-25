'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  CheckCircle2,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import Link from 'next/link';

export const LoginView: React.FC = () => {
  const { login, currentUser, currentBranch } = usePharmacy();
  const [username, setUsername] = useState(currentUser?.username || 'maria');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const usersList = [
    {
      id: 'maria',
      name: 'María Tardencilla',
      role: 'Propietaria & Admin',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      avatarBg: 'bg-emerald-600',
      initials: 'MT',
    },
    {
      id: 'jonathan',
      name: 'Jonathan Rojas',
      role: 'Super Administrador',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      avatarBg: 'bg-teal-700',
      initials: 'JR',
    },
    {
      id: 'fatima',
      name: 'Fátima Selene',
      role: 'Cajera & Ventas (POS)',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      avatarBg: 'bg-sky-600',
      initials: 'FS',
    },
  ];

  useEffect(() => {
    // Auto-focus password on mobile/desktop for rapid unlock
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [username]);

  const handleSelectUser = (userKey: string) => {
    setUsername(userKey);
    setError(null);
    setPassword('');
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message || 'Contraseña incorrecta. Intenta nuevamente.');
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 flex flex-col justify-center items-center p-3 sm:p-4 select-none relative overflow-hidden">
      {/* Glow Suave de Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_70%)] pointer-events-none" />

      {/* Tarjeta Central de Bloqueo / Autenticación */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera con Logo Institucional */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-emerald-50/90 to-white border-b border-emerald-100 flex flex-col items-center text-center">
          <div className="relative mb-2.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-lg border-2 border-emerald-500 overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Logo Farmacia Espíritu Santo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>Bloqueo de Seguridad Activo</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            FARMACIA ESPÍRITU SANTO 🕊️
          </h1>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
            {currentBranch.name} • Control de Acceso y POS
          </p>
        </div>

        {/* Notificación de Seguridad Automática */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>La sesión se bloquea al salir de la pantalla por protección de caja e inventario.</span>
        </div>

        {/* Selector Rápido de Usuario */}
        <div className="px-5 pt-4">
          <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Selecciona tu Usuario:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {usersList.map((u) => {
              const isSelected = username.toLowerCase() === u.id.toLowerCase();
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs ${
                      u.avatarBg
                    }`}
                  >
                    {u.initials}
                  </div>
                  <span className="font-bold text-[11px] text-slate-900 truncate w-full">
                    {u.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-none truncate w-full">
                    {u.id === 'maria' ? 'Propietaria' : u.id === 'jonathan' ? 'Admin' : 'Cajera'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Contraseña */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contraseña o PIN</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Usuario activo: <strong className="text-emerald-700 uppercase font-mono">{username}</strong>
              </span>
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña o PIN"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium transition-all outline-none pr-10 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Verificando...' : 'Desbloquear Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso Directo a Portal de Descargas */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">¿Aplicación Oficial?</span>
          <Link
            href="/descargar"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar App</span>
          </Link>
        </div>

      </div>

      <footer className="mt-4 text-center text-xs text-emerald-200/80 font-medium">
        <span>© 2026 Farmacia Espíritu Santo • Sucursal 19 de Julio</span>
      </footer>
    </div>
  );
};
