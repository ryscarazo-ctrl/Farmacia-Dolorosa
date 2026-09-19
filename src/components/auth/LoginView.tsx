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
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Elementos visuales decorativos de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Tarjeta Central de Inicio de Sesión Privado */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100/30 overflow-hidden relative z-10 animate-fade-in">
        {/* Cabecera Institucional */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={settings.logoUrl || '/logo.jpg'}
              alt="Logo Farmacia Espíritu Santo"
              className="w-16 h-16 object-contain rounded-2xl bg-white p-1 border-2 border-emerald-500 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-800 uppercase px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 mb-1.5 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Acceso Privado • {currentBranch.code}
          </span>

          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            FARMACIA ESPÍRITU SANTO <span>🕊️</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {currentBranch.name} • Sistema de Gestión
          </p>
        </div>

        {/* Formulario de Acceso Privado */}
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
                placeholder="Ingresa tu contraseña"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 font-mono transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full mt-2 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading || !username || !password
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-600/30 cursor-pointer'
            }`}
          >
            <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Seguro */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sistema Seguro y Privado
          </span>
          <span className="font-mono text-slate-400">v1.2 Producción</span>
        </div>
      </div>
    </div>
  );
};
