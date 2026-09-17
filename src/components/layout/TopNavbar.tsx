'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Bell,
  Vault,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  Lock,
  Menu,
  LogOut,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

interface TopNavbarProps {
  onNavigateToCash?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onNavigateToCash, onToggleMobileMenu }) => {
  const {
    branches,
    currentBranch,
    setCurrentBranch,
    currentUser,
    currentCashSession,
    alerts,
    markAlertAsRead,
    logout,
  } = usePharmacy();

  const [time, setTime] = useState<string>('');
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [showBranchMenu, setShowBranchMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('es-SV', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <header className="h-14 bg-white border-b border-emerald-100 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
      {/* Botón Menú Móvil + Selector de Sucursal y Reloj */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Botón Hamburguesa ☰ para Teléfonos */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all active:scale-95 shadow-xs"
          title="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-emerald-800" />
        </button>

        {/* Branch Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-xs font-bold text-emerald-900 border border-emerald-200 transition-all shadow-sm max-w-[150px] sm:max-w-none truncate"
          >
            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{currentBranch.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-emerald-200 rounded-2xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider border-b border-emerald-100">
                Cambiar de Sucursal
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setCurrentBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    b.id === currentBranch.id ? 'bg-emerald-100/70 text-emerald-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-[10px] text-slate-500">{b.code} • {b.phone}</div>
                  </div>
                  {b.id === currentBranch.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reloj en vivo (visible en pantallas medianas y grandes) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50/70 px-3 py-1 rounded-lg border border-emerald-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{time}</span>
        </div>
      </div>

      {/* Estado de Caja, Alertas y Perfil con Cerrar Sesión */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Estado de Caja */}
        <button
          onClick={onNavigateToCash}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
            currentCashSession
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          }`}
          title="Ver módulo de caja"
        >
          <Vault className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">{currentCashSession ? 'Caja Abierta' : 'Caja Cerrada'}</span>
          <span className="sm:hidden">{currentCashSession ? 'Abierta' : 'Cerrada'}</span>
        </button>

        {/* Centro de Alertas */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 relative border border-slate-200 transition-colors"
            title="Alertas y Notificaciones"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Drawer de Alertas */}
          {showAlerts && (
            <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-emerald-100 rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Alertas del Sistema ({unreadAlerts.length})</span>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No hay alertas activas
                  </div>
                ) : (
                  alerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => markAlertAsRead(alert.id)}
                      className={`py-2 text-xs cursor-pointer hover:bg-emerald-50/60 p-1.5 rounded-lg transition-colors ${
                        !alert.isRead ? 'bg-emerald-50/40' : 'opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            alert.severity === 'Critical'
                              ? 'text-red-600'
                              : alert.severity === 'Warning'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {alert.title}
                        </span>
                        {!alert.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario y Botón Cerrar Sesión */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-emerald-100">
          <div className="w-7 h-7 sm:w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {currentUser?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">
              {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold leading-tight mt-0.5">
              {currentUser?.role}
            </div>
          </div>

          {/* Botón Directo Cerrar Sesión */}
          <button
            type="button"
            onClick={logout}
            title="Cerrar Sesión / Finalizar Día"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 transition-all font-bold text-xs cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
