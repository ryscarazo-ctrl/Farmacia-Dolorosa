'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CalendarClock,
  Menu
} from 'lucide-react';
import { NavSection } from './Sidebar';

interface BottomNavBarProps {
  currentView: NavSection;
  onNavigate: (view: NavSection) => void;
  onOpenMenu: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
}) => {
  const navItems: { id: NavSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'pos', label: 'Venta POS', icon: ShoppingCart },
    { id: 'products', label: 'Inventario', icon: Package },
    { id: 'expirations', label: 'Caducidades', icon: CalendarClock },
  ];

  return (
    <nav
      aria-label="Navegación Móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all active:scale-90 ${
              isActive
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-emerald-100 text-emerald-700 shadow-xs' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Botón Menú Completo */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl text-slate-400 hover:text-slate-600 font-medium transition-all active:scale-90"
      >
        <div className="p-1 rounded-xl text-slate-500 bg-slate-100">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight mt-0.5 tracking-tight">Menú</span>
      </button>
    </nav>
  );
};
