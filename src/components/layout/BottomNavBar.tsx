'use client';

import React from 'react';
import {
  Home,
  Pill,
  Scan,
  ShoppingCart,
  LayoutGrid,
} from 'lucide-react';
import { NavSection } from './Sidebar';

interface BottomNavBarProps {
  currentView: NavSection;
  onNavigate: (view: NavSection) => void;
  onOpenMenu?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
}) => {
  return (
    <nav
      aria-label="Navegación Móvil Estilo Tecnomax"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 flex items-center justify-around select-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      {/* 1. INICIO */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
          currentView === 'dashboard'
            ? 'text-emerald-700 font-extrabold'
            : 'text-slate-400 hover:text-slate-600 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${currentView === 'dashboard' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight tracking-tight">Inicio</span>
      </button>

      {/* 2. MEDICINAS / CATÁLOGO */}
      <button
        type="button"
        onClick={() => onNavigate('products')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
          currentView === 'products'
            ? 'text-emerald-700 font-extrabold'
            : 'text-slate-400 hover:text-slate-600 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${currentView === 'products' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <Pill className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight tracking-tight">Medicinas</span>
      </button>

      {/* 3. BOTÓN DESTACADO AL CENTRO: ESCANEAR (Marco cuadrado redondeado como en el video) */}
      <button
        type="button"
        onClick={() => onNavigate('pos')}
        className="flex flex-col items-center justify-center -mt-3 group cursor-pointer active:scale-90 transition-transform"
        title="Escanear Código de Barra o Buscar Medicamento"
      >
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border-3 border-white ring-2 ring-emerald-500/20 group-hover:scale-105 transition-all">
          <Scan className="w-6 h-6 text-white" />
        </div>
        <span className="text-[10px] font-black text-emerald-800 leading-tight mt-0.5 tracking-tight">
          Escanear
        </span>
      </button>

      {/* 4. VENDER / POS */}
      <button
        type="button"
        onClick={() => onNavigate('pos')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
          currentView === 'pos'
            ? 'text-emerald-700 font-extrabold'
            : 'text-slate-400 hover:text-slate-600 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${currentView === 'pos' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <ShoppingCart className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight tracking-tight">Vender</span>
      </button>

      {/* 5. MÁS (Menú completo estilo Tecnomax) */}
      <button
        type="button"
        onClick={() => onNavigate('more')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
          currentView === 'more'
            ? 'text-emerald-700 font-extrabold'
            : 'text-slate-400 hover:text-slate-600 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${currentView === 'more' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <LayoutGrid className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight tracking-tight">Más</span>
      </button>
    </nav>
  );
};