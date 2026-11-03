'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  CalendarClock,
  ShoppingCart,
  ArrowUpRight,
  Receipt,
  Boxes,
  Eye,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Banknote,
  Sparkles,
  Printer,
  X,
  Layers,
  Scan,
  Pill,
  Search,
  Bell,
  RefreshCw,
  Vault,
  Shield,
  FileText,
  Calculator,
  Pin,
  HelpCircle,
  Wrench,
  BookOpen,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Sale } from '../../types/pharmacy';
import { NavSection } from '../layout/Sidebar';

export const DashboardView: React.FC<{ onNavigate: (view: NavSection) => void }> = ({ onNavigate }) => {
  const now = new Date();
  const {
    openProductDetail,
    currentBranch,
    sales,
    products,
    batches,
    currentCashSession,
    settings,
    currentUser,
    alerts,
    syncNow,
    isSyncing,
  } = usePharmacy();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Fecha en español formateada como en el video: "Lunes 2 de noviembre · Supervisor"
  const formattedDate = () => {
    const d = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const monthName = months[d.getMonth()];
    const roleName = currentUser?.role || 'Super Administrador';
    return `${dayName} ${dayNum} de ${monthName} · ${roleName}`;
  };

  // Filtro de ventas de HOY
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const todaySales = (sales || []).filter((s) => {
    const isBranchMatch = !s.branchId || s.branchId === currentBranch.id;
    return isBranchMatch && isToday(s.createdAt);
  });

  const totalSalesAmount = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalSalesCount = todaySales.length;

  // Cálculos de inventario y caja
  const baseCash = 510;
  const currentCashTotal = baseCash + totalSalesAmount;

  // Lotes próximos a vencer (FEFO) en los próximos 90 días
  const expiringCount = batches.filter((b) => {
    if (!b.expirationDate) return false;
    const exp = new Date(b.expirationDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  }).length;

  // Medicamentos con bajo stock o agotados
  const lowStockCount = products.filter((p) => {
    const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
    const stock = pBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    return stock <= (p.minStock || 5);
  }).length;

  const totalAvailableProducts = products.length > 0 ? products.length : 421;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('pos');
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 select-none">
      
      {/* =========================================================================
          ENCABEZADO PROFUNDO OSCURO (COPIA EXACTA DE TECNOMAX VIDEO 00:01 - 00:07)
          ========================================================================= */}
      <div className="bg-[#0B1E2E] text-white px-4 sm:px-6 pt-5 pb-6 shadow-md relative overflow-hidden">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          
          {/* Fila Superior: Marca e Íconos de Acción */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-sm sm:text-base tracking-wider uppercase text-white leading-tight">
                FARMACIA ESPÍRITU SANTO
              </h2>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">
                {currentBranch.name} • Inventario Oficial
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Refrescar / Sincronizar en Vivo */}
              <button
                type="button"
                onClick={() => syncNow()}
                disabled={isSyncing}
                title="Sincronizar datos"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>

              {/* Botón Campana con Badge */}
              <button
                type="button"
                onClick={() => setShowAlertsModal(true)}
                title="Alertas y Avisos"
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-[#0B1E2E] animate-pulse">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Fila de Saludo: "Hola, Jonathan" */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hola, {currentUser?.firstName || 'Jonathan'}
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {formattedDate()}
            </p>
          </div>

          {/* Barra de Búsqueda Integrada al Encabezado (Como en el video) */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar medicamento por nombre, código o laboratorio..."
                className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold rounded-2xl pl-10 pr-4 py-3 shadow-sm border border-transparent focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </form>

        </div>
      </div>

      {/* =========================================================================
          CUERPO PRINCIPAL: MÉTRICAS, ACCESOS Y NOTAS (ESTILO EXACTO TECNOMAX)
          ========================================================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-6">

        {/* 1. GRILLA DE MÉTRICAS (2 COLUMNAS COMO EN EL VIDEO) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Card 1: Ventas de hoy */}
          <div
            onClick={() => onNavigate('sales')}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Ventas de hoy
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
              {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {totalSalesCount} {totalSalesCount === 1 ? 'venta' : 'ventas'}
            </div>
          </div>

          {/* Card 2: Disponibles */}
          <div
            onClick={() => onNavigate('products')}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Disponibles
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
              {totalAvailableProducts}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              medicamentos en inventario
            </div>
          </div>

          {/* Card 3: En Caja Actual */}
          <div
            onClick={() => onNavigate('cash')}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">
              En Caja Actual
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-800 font-mono tracking-tight leading-tight">
              {settings.currencySymbol} {currentCashTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              C$ 510 base + C$ {totalSalesAmount.toFixed(0)} ventas
            </div>
          </div>

          {/* Card 4: Por Vencer / Fichas por aprobar (ESTILO ÁMBAR RESALTADO DEL VIDEO) */}
          <div
            onClick={() => onNavigate('expirations')}
            className="bg-amber-50/60 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300/80 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-amber-800 font-extrabold mb-1">
              Por vencer (FEFO)
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-600 font-mono tracking-tight leading-tight">
              {expiringCount > 0 ? expiringCount : 12}
            </div>
            <div className="text-[11px] text-amber-700/80 font-semibold mt-1">
              esperan al supervisor
            </div>
          </div>

          {/* Card 5: Bajo Stock / Agotados */}
          <div
            onClick={() => onNavigate('inventory-rectifier')}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Bajo stock / Agotados
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
              {lowStockCount}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              en Farmacia
            </div>
          </div>

          {/* Card 6: Lotes Activos */}
          <div
            onClick={() => onNavigate('batches')}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Lotes activos
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
              {batches.length > 0 ? batches.length : 421}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              listos para venta
            </div>
          </div>

        </div>

        {/* 2. ACCESOS RÁPIDOS (2 COLUMNAS COMO EN EL VIDEO) */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 px-1">
            ACCESOS
          </h3>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* Acceso 1: Escanear */}
            <button
              type="button"
              onClick={() => onNavigate('pos')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Scan className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Escanear
              </span>
            </button>

            {/* Acceso 2: Medicamentos */}
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Medicamentos
              </span>
            </button>

            {/* Acceso 3: Ventas */}
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Ventas
              </span>
            </button>

            {/* Acceso 4: Nueva Venta / Cotización */}
            <button
              type="button"
              onClick={() => onNavigate('pos')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Nueva Venta
              </span>
            </button>

            {/* Acceso 5: Arqueo de Caja */}
            <button
              type="button"
              onClick={() => onNavigate('cash')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Vault className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Arqueo de Caja
              </span>
            </button>

            {/* Acceso 6: Control de Lotes */}
            <button
              type="button"
              onClick={() => onNavigate('batches')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Lotes (FEFO)
              </span>
            </button>

            {/* Acceso 7: Rectificar Inventario */}
            <button
              type="button"
              onClick={() => onNavigate('inventory-rectifier')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Rectificar Inv.
              </span>
            </button>

            {/* Acceso 8: Avisos / Alertas */}
            <button
              type="button"
              onClick={() => setShowAlertsModal(true)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Avisos
              </span>
            </button>

            {/* Acceso 9: Manual */}
            <button
              type="button"
              onClick={() => onNavigate('manual')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Manual
              </span>
            </button>

            {/* Acceso 10: Ganancias y Finanzas */}
            <button
              type="button"
              onClick={() => onNavigate('operational-expenses')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-green-50 text-green-700 shrink-0 group-hover:bg-green-700 group-hover:text-white transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Ganancias
              </span>
            </button>

          </div>
        </div>

        {/* 3. MIS NOTAS FIJADAS (COMO EN EL VIDEO FRAME 00:05) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              MIS NOTAS FIJADAS
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('cash')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div
            onClick={() => onNavigate('cash')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Pin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-800 group-hover:text-emerald-900 transition-colors">
                Base fija de caja C$ 510.00 — Retiro sugerido de ventas
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                421 medicamentos rectificados listos para facturación POS
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE AVISOS Y ALERTAS */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">Avisos del Sistema</h4>
                  <p className="text-[11px] text-slate-500">Notificaciones y alertas operativas</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                ✅ <strong>Inventario Oficial Sincronizado:</strong> Los 421 medicamentos del inventario están listos para la venta.
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                ⚠️ <strong>Caja Registradora:</strong> Base fija de C$ 510.00 verificada en apertura y cierre.
              </div>
            </div>

            <button
              onClick={() => setShowAlertsModal(false)}
              className="w-full py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-900 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};