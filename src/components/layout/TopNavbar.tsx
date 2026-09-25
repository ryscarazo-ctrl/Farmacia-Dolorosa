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
  Wifi
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
      const handleOnline = () => { setIsOnline(true); setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2500); };
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const handleRectifyAlert = (alert: any) => {
    markAlertAsRead(alert.id);
    setShowAlerts(false);
    const text = (alert.title + ' ' + alert.message).toLowerCase();
    if (text.includes('cefadroxilo')) {
      const p = products.find((prod) => prod.name.toLowerCase().includes('cefadroxilo'));
      if (p) openProductDetail(p); else openProductDetail('cefadroxilo');
    } else if (text.includes('colipax')) {
      const p = products.find((prod) => prod.name.toLowerCase().includes('colipax'));
      if (p) openProductDetail(p); else openProductDetail('colipax');
    } else if (text.includes('cardiosorbide')) {
      const p = products.find((prod) => prod.name.toLowerCase().includes('cardiosorbide'));
      if (p) openProductDetail(p); else openProductDetail('cardiosorbide');
    } else if (text.includes('amoxicilina')) {
      const p = products.find((prod) => prod.name.toLowerCase().includes('amoxicilina'));
      if (p) openProductDetail(p); else openProductDetail('amoxicilina');
    } else if (text.includes('precio') || text.includes('costo') || text.includes('pvp')) {
      const pNoPrice = products.find((prod) => !prod.salePrice || prod.salePrice <= 0);
      if (pNoPrice) openProductDetail(pNoPrice); else if (products.length > 0) openProductDetail(products[0]);
    } else if (text.includes('lote') || text.includes('vencimiento')) {
      const pNoBatch = products.find((prod) => prod.sku === 'MED-028' || !prod.salePrice);
      if (pNoBatch) openProductDetail(pNoBatch); else if (products.length > 0) openProductDetail(products[0]);
    } else {
      if (products.length > 0) openProductDetail(products[0]);
    }
  };

  // Nombre abreviado para la sucursal en móvil
  const branchShortName = currentBranch.name
    .replace('Sucursal ', '')
    .replace('sucursal ', '');

  return (
    <>
      {/* ===================== NAVBAR ===================== */}
      <header className="h-12 sm:h-14 bg-white border-b border-emerald-100 flex items-center justify-between z-30 shrink-0 select-none shadow-xs w-full relative">

        {/* ── IZQUIERDA: Hamburger + Sucursal ── */}
        <div className="flex items-center min-w-0 flex-1 h-full px-2 sm:px-3 gap-1.5">

          {/* Hamburger móvil */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Menú"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Selector de Sucursal */}
          <div className="relative shrink-0 min-w-0">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/70 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-98 max-w-[140px] sm:max-w-[200px] lg:max-w-none"
              title="Cambiar Sucursal"
            >
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              {/* En móvil landscape mostramos nombre corto */}
              <span className="truncate hidden sm:block">{currentBranch.name}</span>
              <span className="truncate sm:hidden">{branchShortName}</span>
              <ChevronDown className="w-2.5 h-2.5 text-emerald-500 shrink-0 opacity-80" />
            </button>

            {showBranchMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-emerald-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-black text-emerald-800 uppercase px-2.5 py-1 tracking-wider border-b border-emerald-100/60 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Sucursales</span>
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setCurrentBranch(b); setShowBranchMenu(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      currentBranch.id === b.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    {currentBranch.id === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reloj — oculto en móvil, visible md+ */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-[11px] font-bold text-emerald-900 shrink-0">
            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-mono">{time}</span>
          </div>

          {/* Estado Online — solo icono en sm, texto en md+ */}
          <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold shrink-0 transition-colors ${
            !isOnline ? 'bg-red-50 text-red-700 border-red-200'
            : isSyncing ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50/70 text-emerald-900 border-emerald-200/80'
          }`}>
            {!isOnline ? (
              <><WifiOff className="w-3 h-3 shrink-0" /><span className="hidden md:inline">Sin conexión</span></>
            ) : isSyncing ? (
              <><span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" /><span className="hidden md:inline">Sincronizando</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /><span className="hidden md:inline">Sincronizado</span></>
            )}
          </div>
        </div>

        {/* ── DERECHA: Acciones compactas ── */}
        <div className="flex items-center gap-1 px-2 sm:px-3 h-full shrink-0">

          {/* Manual — solo icono en móvil */}
          {onNavigateToManual && (
            <button
              onClick={onNavigateToManual}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
              title="Manual del Sistema"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="hidden lg:inline text-[11px] font-extrabold">Manual</span>
            </button>
          )}

          {/* Caja — icono + texto en sm+, solo icono en xs */}
          <button
            onClick={onNavigateToCash}
            className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-black text-[11px] transition-all shadow-2xs cursor-pointer shrink-0 ${
              currentCashSession
                ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
            title={currentCashSession ? 'Caja Abierta' : 'Caja Cerrada'}
          >
            <Vault className={`w-3.5 h-3.5 shrink-0 ${currentCashSession ? 'text-emerald-200' : 'text-amber-600'}`} />
            <span className="hidden sm:inline">{currentCashSession ? 'Abierta' : 'Cerrada'}</span>
          </button>

          {/* Separador visual */}
          <div className="w-px h-6 bg-slate-200 mx-0.5 shrink-0" />

          {/* Campana de Alertas */}
          <button
            onClick={() => setShowAlerts(true)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 relative border border-slate-200 transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Centro de Alertas"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow animate-pulse border-2 border-white leading-none">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Avatar + Salir */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 shrink-0">
            <div
              className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0 cursor-default"
              title={`${currentUser?.firstName} ${currentUser?.lastName} — ${currentUser?.role}`}
            >
              {currentUser?.firstName?.charAt(0) || 'U'}
            </div>

            <button
              type="button"
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================== MODAL ALERTAS ===================== */}
      {showAlerts && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setShowAlerts(false)} />

          <div className="relative w-full sm:max-w-lg bg-white sm:border sm:border-emerald-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

            {/* Handle visual para bottom sheet en móvil */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight flex items-center gap-2">
                    Centro de Alertas & Errores
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-600/80 text-[9px] uppercase tracking-wider font-extrabold">
                      En Vivo
                    </span>
                  </h3>
                  <p className="text-[10px] text-emerald-100/80 font-medium mt-0.5">
                    {unreadAlerts.length} {unreadAlerts.length === 1 ? 'alerta pendiente' : 'alertas pendientes'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
              {alerts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-black text-slate-800 text-base">Todo al día</p>
                  <p className="text-xs text-slate-500 mt-1">Sin errores pendientes.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 sm:p-4 rounded-2xl border-2 space-y-2.5 shadow-xs ${
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

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRectifyAlert(alert)}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Wrench className="w-3.5 h-3.5 text-emerald-200" />
                        <span>🛠️ Rectificar Error</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                      </button>
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Resuelto</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
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
