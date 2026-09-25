'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
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
  WifiOff,
  Wrench,
  ArrowUpRight,
  Check,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

interface TopNavbarProps {
  onNavigateToCash?: () => void;
  onNavigateToManual?: () => void;
  onNavigateToSales?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onNavigateToCash,
  onNavigateToManual,
  onNavigateToSales,
  onToggleMobileMenu,
}) => {
  const {
    sales,
    settings,
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
    syncNow,
    isSyncing,
  } = usePharmacy();

  const [time, setTime] = useState<string>('');
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [showBranchMenu, setShowBranchMenu] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Cálculo de ventas de HOY para el monitor en vivo de Jonathan & María
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };
  const todaySales = (sales || []).filter((s) => {
    const isBranchMatch = !s.branchId || s.branchId === currentBranch.id;
    return isBranchMatch && isToday(s.createdAt);
  });
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const todaySalesCount = todaySales.length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const updateClock = () => {
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

      updateClock();
      const clockInterval = setInterval(updateClock, 1000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(clockInterval);
      };
    }
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const handleRectifyAlert = (alert: any) => {
    if (alert.productId) {
      const prod = products.find((p) => p.id === alert.productId);
      if (prod) {
        openProductDetail(prod);
        setShowAlerts(false);
        return;
      }
    }
    if (onNavigateToManual) {
      onNavigateToManual();
      setShowAlerts(false);
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-2 sm:px-4 z-30 select-none shadow-2xs">
        {/* IZQUIERDA: Botón Menú Móvil + Selector Sucursal */}
        <div className="flex items-center gap-2">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5 text-emerald-950" />
            </button>
          )}

          {/* Selector de Sucursal */}
          <div className="relative">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer text-left"
              title="Cambiar de Sucursal"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="font-bold text-xs text-slate-800 hidden sm:inline max-w-[120px] lg:max-w-[160px] truncate">
                {currentBranch.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Cambiar Sucursal Activa
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBranch(b);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      b.id === currentBranch.id
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.address} • {b.code}</div>
                    </div>
                    {b.id === currentBranch.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTRO: Reloj y Conectividad */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{time}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{isOnline ? 'En Línea' : 'Sin Conexión'}</span>
          </div>
        </div>

        {/* DERECHA: Monitor en Vivo, Refresh, Manual, Caja, Alertas, Avatar, Salir */}
        <div className="flex items-center h-full px-1 sm:px-2 gap-1.5 shrink-0">
          {/* Monitor de Ventas en Vivo para Jonathan & María */}
          <button
            type="button"
            onClick={onNavigateToSales}
            title="Monitor de Ventas en Vivo en Tiempo Real (Sin necesidad de corte ni cierre de caja)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 group shrink-0"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <div className="text-left leading-none">
              <div className="text-[9px] uppercase font-black text-emerald-700 tracking-wider">En Vivo Hoy:</div>
              <div className="text-xs font-black text-emerald-950 font-mono mt-0.5">
                {settings?.currencySymbol || 'C$'} {todaySalesTotal.toFixed(2)}
                <span className="text-[9px] font-semibold text-emerald-700 ml-1">({todaySalesCount})</span>
              </div>
            </div>
          </button>

          {/* Botón Refrescar / Sincronizar Manual (Sin reiniciar caja ni afectar venta) */}
          <button
            type="button"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center"
            title="Actualizar datos e inventario desde la nube en tiempo real (Sin afectar la caja ni la venta actual)"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 shrink-0 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Manual */}
          {onNavigateToManual && (
            <button
              onClick={onNavigateToManual}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer shrink-0"
              title="Manual del Sistema"
            >
              <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          )}

          {/* Caja */}
          <button
            onClick={onNavigateToCash}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              currentCashSession
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title={currentCashSession ? 'Turno de Caja Abierto' : 'Caja Cerrada (Abrir Turno)'}
          >
            <Vault className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">
              {currentCashSession ? 'Caja Abierta' : 'Abrir Caja'}
            </span>
          </button>

          {/* Alertas */}
          <button
            type="button"
            onClick={() => setShowAlerts(true)}
            className="relative p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="Alertas"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow animate-pulse border-2 border-white leading-none">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0 cursor-default"
            title={`${currentUser?.firstName} ${currentUser?.lastName} — ${currentUser?.role}`}
          >
            {currentUser?.firstName?.charAt(0) || 'U'}
          </div>

          {/* Salir */}
          <button
            type="button"
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </header>

      {/* MODAL ALERTAS */}
      {showAlerts && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setShowAlerts(false)} />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh] z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2">
                    Centro de Alertas & Errores
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-600/80 text-[9px] uppercase tracking-wide font-extrabold">
                      En Vivo
                    </span>
                  </h3>
                  <p className="text-[10px] text-emerald-100/80 font-medium mt-0.5">
                    {unreadAlerts.length} {unreadAlerts.length === 1 ? 'alerta pendiente' : 'alertas pendientes'} de rectificar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
              {alerts.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-black text-slate-800">Todo al día</p>
                  <p className="text-xs text-slate-500 mt-1">Sin alertas pendientes.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border-2 space-y-2.5 shadow-xs ${
                      alert.severity === 'Critical' ? 'bg-red-50/90 border-red-200'
                      : alert.severity === 'Warning' ? 'bg-amber-50/90 border-amber-200'
                      : 'bg-emerald-50/90 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-xl ${
                          alert.severity === 'Critical' ? 'bg-red-200 text-red-900'
                          : alert.severity === 'Warning' ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </span>
                        <h4 className={`font-black text-sm leading-snug ${
                          alert.severity === 'Critical' ? 'text-red-900'
                          : alert.severity === 'Warning' ? 'text-amber-900'
                          : 'text-emerald-900'
                        }`}>{alert.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg shrink-0 ${
                        alert.severity === 'Critical' ? 'bg-red-600 text-white'
                        : alert.severity === 'Warning' ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                      }`}>
                        {alert.severity === 'Critical' ? 'URGENTE' : 'ALERTA'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-white/70 p-2 rounded-xl border border-black/5">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRectifyAlert(alert)}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <Wrench className="w-3.5 h-3.5 text-emerald-200" />
                        <span>🛠️ Rectificar Error</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                      </button>
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                        title="Resuelto"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowAlerts(false)}
                className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
