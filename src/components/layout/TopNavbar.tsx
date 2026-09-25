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
  WifiOff,
  Wrench,
  ArrowUpRight,
  Check,
  Sparkles
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

  // Función inteligente para rectificar cualquier alerta con 1 clic
  const handleRectifyAlert = (alert: any) => {
    markAlertAsRead(alert.id);
    setShowAlerts(false);

    const text = (alert.title + ' ' + alert.message).toLowerCase();

    if (text.includes('cefadroxilo')) {
      const p = products.find(prod => prod.name.toLowerCase().includes('cefadroxilo'));
      if (p) openProductDetail(p);
      else openProductDetail('cefadroxilo');
    } else if (text.includes('colipax')) {
      const p = products.find(prod => prod.name.toLowerCase().includes('colipax'));
      if (p) openProductDetail(p);
      else openProductDetail('colipax');
    } else if (text.includes('cardiosorbide')) {
      const p = products.find(prod => prod.name.toLowerCase().includes('cardiosorbide'));
      if (p) openProductDetail(p);
      else openProductDetail('cardiosorbide');
    } else if (text.includes('amoxicilina')) {
      const p = products.find(prod => prod.name.toLowerCase().includes('amoxicilina'));
      if (p) openProductDetail(p);
      else openProductDetail('amoxicilina');
    } else if (text.includes('precio') || text.includes('costo') || text.includes('pvp')) {
      const pNoPrice = products.find(prod => !prod.salePrice || prod.salePrice <= 0);
      if (pNoPrice) openProductDetail(pNoPrice);
      else if (products.length > 0) openProductDetail(products[0]);
    } else if (text.includes('lote') || text.includes('vencimiento')) {
      const pNoBatch = products.find(prod => prod.sku === 'MED-028' || !prod.salePrice);
      if (pNoBatch) openProductDetail(pNoBatch);
      else if (products.length > 0) openProductDetail(products[0]);
    } else {
      if (products.length > 0) openProductDetail(products[0]);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-emerald-100 px-2 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-2xs w-full max-w-full overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA: Menú + Sucursal + En Vivo */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        {/* Botón Hamburguesa para Móvil */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all active:scale-95 shrink-0"
          title="Abrir menú"
        >
          <Menu className="w-4 h-4 text-emerald-800" />
        </button>

        {/* Pastilla de Sucursal */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-xs font-black text-emerald-950 border border-emerald-200 transition-all shadow-2xs whitespace-nowrap"
          >
            <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-[180px]">{currentBranch.name.replace('Sucursal ', '')}</span>
            <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-white border border-emerald-200 rounded-2xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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

        {/* Indicador Luminoso 'En Vivo' / Nube Conectada */}
        <div className="flex items-center shrink-0">
          {isSyncing ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-black shadow-2xs whitespace-nowrap animate-pulse">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="hidden sm:inline">Guardando</span>
            </div>
          ) : !isOnline ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-black shadow-2xs whitespace-nowrap" title="Modo offline">
              <WifiOff className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-950 text-[10px] font-black shadow-2xs whitespace-nowrap"
              title="Sincronización activa con la Nube"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.9)]"></span>
              </span>
              <span>En Vivo</span>
            </div>
          )}
        </div>

        {/* Reloj Digital (Solo Pantallas Grandes) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50/70 px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0 whitespace-nowrap">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>{time}</span>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Manual, Caja, Alertas y Perfil */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* Botón Manual (Visible en Computadoras) */}
        <button
          type="button"
          onClick={onNavigateToManual}
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-300 font-bold text-xs cursor-pointer shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          title="Ver Manual de Usuario"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Manual</span>
        </button>

        {/* Estado de Caja (Visible en Pantallas Medianas) */}
        <button
          onClick={onNavigateToCash}
          className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
            currentCashSession
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          }`}
          title="Ver estado de caja"
        >
          <Vault className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{currentCashSession ? 'Caja Abierta' : 'Caja Cerrada'}</span>
        </button>

        {/* Centro de Alertas con Botón de Rectificar Error */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 relative border border-slate-200 transition-colors cursor-pointer"
            title="Alertas y Notificaciones"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Modal / Drawer Desplegable de Notificaciones y Rectificación */}
          {showAlerts && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-0 sm:mt-1.5 w-auto sm:w-96 max-w-sm bg-white border border-emerald-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
              
              {/* Cabecera del Panel de Alertas */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                      Centro de Alertas & Errores
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {unreadAlerts.length} pendientes de rectificar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Alertas con Botones de Acción */}
              <div className="overflow-y-auto divide-y divide-slate-100 my-2 space-y-2.5 flex-1 pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5 opacity-70" />
                    <p className="font-bold text-slate-700">¡Todo al día!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No hay errores ni alertas pendientes de rectificación.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-2xl border transition-all space-y-2 ${
                        alert.severity === 'Critical'
                          ? 'bg-red-50/80 border-red-200'
                          : alert.severity === 'Warning'
                          ? 'bg-amber-50/80 border-amber-200'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span
                          className={`font-black text-xs leading-snug ${
                            alert.severity === 'Critical'
                              ? 'text-red-900'
                              : alert.severity === 'Warning'
                              ? 'text-amber-900'
                              : 'text-emerald-900'
                          }`}
                        >
                          {alert.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md shrink-0 ${
                            alert.severity === 'Critical'
                              ? 'bg-red-200 text-red-900'
                              : alert.severity === 'Warning'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {alert.severity === 'Critical' ? 'Urgente' : 'Alerta'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        {alert.message}
                      </p>

                      {/* BOTÓN RECTIFICAR / CORREGIR ERROR DESTACADO */}
                      <div className="pt-1.5 border-t border-black/5 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleRectifyAlert(alert)}
                          className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Wrench className="w-3.5 h-3.5 text-emerald-200" />
                          <span>🛠️ Rectificar Error</span>
                          <ArrowUpRight className="w-3 h-3 text-emerald-300" />
                        </button>

                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                          title="Marcar como resuelta"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar de Usuario y Cerrar Sesión */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 border-l border-slate-200 shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-2xs shrink-0 cursor-default"
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
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 transition-all font-bold text-xs cursor-pointer shadow-2xs active:scale-95 shrink-0 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
};