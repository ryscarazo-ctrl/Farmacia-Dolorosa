'use client';

import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import Link from 'next/link';

export const LoginView: React.FC = () => {
  const { login, settings, currentBranch } = usePharmacy();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message || 'Usuario o contraseña incorrectos');
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      
      {/* Glow Suave de Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

      {/* Tarjeta Central Minimalista */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative z-10 animate-fade-in">
        
        {/* Cabecera Institucional Centrada con Logo */}
        <div className="p-6 bg-gradient-to-b from-emerald-50/80 to-white border-b border-emerald-100 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-lg border-2 border-emerald-500 overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Logo Farmacia Espíritu Santo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 uppercase px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-200 mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-700" /> Acceso Privado • {currentBranch.code}
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            FARMACIA ESPÍRITU SANTO 🕊️
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {currentBranch.name} • Sistema de Gestión POS
          </p>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Usuario</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario (ej: maria o fatima)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contraseña</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium transition-all outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso Directo a Portal de Descargas */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">¿Necesitas instalar la App?</span>
          <Link
            href="/descargar"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Portal de Descargas</span>
          </Link>
        </div>

      </div>

      <footer className="mt-6 text-center text-xs text-emerald-100/70 font-medium">
        <span>© 2026 Farmacia Espíritu Santo • Sucursal 19 de Julio</span>
      </footer>
    </div>
  );
};
