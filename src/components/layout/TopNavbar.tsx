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
  Menu,
  LogOut,
  BookOpen,
  Wifi,
  WifiOff
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

interface TopNavbarProps {
  onNavigateToCash?: () => void;
  onNavigateToManual?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onNavigateToCash,
  onNavigateToManual,
  onToggleMobileMenu,
}) => {
  const {
    products,
    openProductDetail,
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
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setIsSyncing(true);
        setTimeout(() => {
          setIsSyncing(false);
        }, 2500);
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

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
    <header className="h-14 bg-white border-b border-emerald-100 px-2.5 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-2xs">
      
      {/* LADO IZQUIERDO: Menú Móvil + Sucursal + Estado */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Botón Hamburguesa para Móvil */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all active:scale-95 shrink-0"
          title="Abrir menú"
        >
          <Menu className="w-4 h-4 text-emerald-800" />
        </button>

        {/* Selector de Sucursal */}
        <div className="relative shrink min-w-0">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-xs font-bold text-emerald-900 border border-emerald-200 transition-all shadow-2xs whitespace-nowrap"
          >
            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[220px]">{currentBranch.name}</span>
            <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-emerald-200 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                  className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
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

        {/* Reloj Digital (Solo Pantallas Medianas/Grandes) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{time}</span>
        </div>

        {/* Indicador Vibrante de Estado En Vivo / Nube Conectada */}
        <div className="flex items-center shrink-0">
          {isSyncing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-900 text-[11px] font-black shadow-2xs whitespace-nowrap animate-pulse">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="hidden sm:inline">Guardando en Nube...</span>
              <span className="sm:hidden">Guardando</span>
            </div>
          ) : !isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-black shadow-2xs whitespace-nowrap" title="Modo sin conexión. Guardando localmente.">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Offline</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-[11px] font-black shadow-2xs whitespace-nowrap"
              title="Sistema conectado en tiempo real con la Nube. Cambios guardados al instante."
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.9)]"></span>
              </span>
              <span className="hidden sm:inline">Nube En Vivo</span>
              <span className="sm:hidden">En Vivo</span>
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: Manual, Caja, Alertas y Perfil */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Botón Manual (Visible en tablets y computadoras) */}
        <button
          type="button"
          onClick={onNavigateToManual}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-300 font-bold text-xs cursor-pointer shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          title="Ver Manual de Usuario"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Manual</span>
        </button>

        {/* Estado de Caja (Visible en tablets y computadoras) */}
        <button
          onClick={onNavigateToCash}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
            currentCashSession
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          }`}
          title="Ver estado de caja"
        >
          <Vault className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{currentCashSession ? 'Caja Abierta' : 'Caja Cerrada'}</span>
        </button>

        {/* Centro de Alertas */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 relative border border-slate-200 transition-colors cursor-pointer"
            title="Alertas y Notificaciones"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Drawer de Alertas */}
          {showAlerts && (
            <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-emerald-100 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Alertas del Sistema ({unreadAlerts.length})</span>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
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
                      onClick={() => {
                        markAlertAsRead(alert.id);
                        setShowAlerts(false);
                        if (alert.title.toLowerCase().includes('cefadroxilo') || alert.message.toLowerCase().includes('cefadroxilo')) {
                          openProductDetail('cefadroxilo');
                        } else if (alert.title.toLowerCase().includes('colipax') || alert.message.toLowerCase().includes('colipax')) {
                          openProductDetail('colipax');
                        } else if (alert.title.toLowerCase().includes('cardiosorbide') || alert.message.toLowerCase().includes('cardiosorbide')) {
                          openProductDetail('cardiosorbide');
                        } else if (alert.title.toLowerCase().includes('amoxicilina') || alert.message.toLowerCase().includes('amoxicilina')) {
                          openProductDetail('amoxicilina');
                        } else if (alert.title.toLowerCase().includes('precios') || alert.message.toLowerCase().includes('precios')) {
                          const noPrice = products.find((p) => p.salePrice === 0 || p.purchasePrice === 0);
                          if (noPrice) openProductDetail(noPrice);
                        } else {
                          openProductDetail(alert.title);
                        }
                      }}
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
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-2xs shrink-0"
            title={`${currentUser?.firstName} ${currentUser?.lastName} (${currentUser?.role})`}
          >
            {currentUser?.firstName?.charAt(0) || 'U'}
          </div>

          <div className="hidden xl:block text-left whitespace-nowrap">
            <div className="text-xs font-bold text-slate-900 leading-none">
              {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold leading-tight mt-0.5">
              {currentUser?.role}
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            type="button"
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 transition-all font-bold text-xs cursor-pointer shadow-2xs active:scale-95 shrink-0 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </header>
  );
};