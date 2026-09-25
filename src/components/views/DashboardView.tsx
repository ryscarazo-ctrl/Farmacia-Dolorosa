'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  CalendarClock,
  ShoppingCart,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers,
  Receipt,
  Boxes,
  PackagePlus,
  BookOpen,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const DashboardView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const {
    openProductDetail,
    currentBranch,
    sales,
    products,
    batches,
    alerts,
    currentCashSession,
    settings,
  } = usePharmacy();

  const todaySales = sales.filter((s) => s.branchId === currentBranch.id);
  const totalSalesAmount = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfitAmount = todaySales.reduce((sum, s) => sum + s.profitAmount, 0);

    // Medicamentos Pendientes de Venta (Sin Precio o Sin Lote/Caducidad)
  const pendingSalesProducts = products.filter((p) => {
    const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
    const missingPrice = !p.salePrice || p.salePrice <= 0;
    const missingBatches = pBatches.length === 0;
    const allExpired = pBatches.length > 0 && pBatches.every((b) => new Date(b.expirationDate) <= now);
    return missingPrice || missingBatches || allExpired;
  });

  const lowStockCount = products.filter((p) => {
    const validBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id && b.status === 'Available');
    const totalStock = validBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    return totalStock <= p.minStock;
  }).length;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoonCount = batches.filter((b) => {
    if (b.branchId !== currentBranch.id || b.status !== 'Available') return false;
    const exp = new Date(b.expirationDate);
    return exp > now && exp <= thirtyDaysFromNow;
  }).length;

  const expiredCount = batches.filter((b) => {
    if (b.branchId !== currentBranch.id) return false;
    return b.status === 'Expired' || new Date(b.expirationDate) <= now;
  }).length;

  return (
    <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Banner de Bienvenida Blanco y Verde */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white rounded-3xl p-6 shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Panel Ejecutivo • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Farmacia Espíritu Santo 🕊️
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Control integral de medicamentos, trazabilidad por lotes FEFO, estado de caja y ventas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('new-product')}
            className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 border border-white"
          >
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            <span>+ Ingresar Medicamento</span>
          </button>
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-500/40 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-200" />
            <span>Abrir POS</span>
          </button>
          <button
            onClick={() => onNavigate('manual')}
            className="px-4 py-2.5 bg-emerald-950/80 hover:bg-black text-emerald-200 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-400/30 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>📖 Ver Manual</span>
          </button>
        </div>
      </div>

            {/* PANEL DESTACADO: MEDICAMENTOS PENDIENTES DE REQUISITOS PARA VENTA */}
      {pendingSalesProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  <span>Espacio de Medicamentos Pendientes de Venta</span>
                  <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500 text-white rounded-full">
                    {pendingSalesProducts.length} Fármacos
                  </span>
                </h3>
                <p className="text-xs text-amber-800/90 font-medium mt-0.5">
                  Fármacos que no pueden facturarse en caja porque les falta <strong>Precio de Venta (PVP)</strong> o <strong>Lote/Fecha de Caducidad</strong>. Toca cualquiera para configurarlo.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('products')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 self-start sm:self-auto cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
            >
              <span>Ver en Inventario</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {pendingSalesProducts.slice(0, 6).map((p) => {
              const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
              const missingPrice = !p.salePrice || p.salePrice <= 0;
              const missingBatch = pBatches.length === 0;

              return (
                <div
                  key={p.id}
                  onClick={() => openProductDetail(p)}
                  className="p-3 bg-white/90 hover:bg-white border border-amber-200 hover:border-amber-400 rounded-2xl shadow-2xs transition-all cursor-pointer active:scale-98 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {p.sku}
                      </span>
                      {missingPrice && (
                        <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Sin Precio (C$ 0)
                        </span>
                      )}
                      {missingBatch && (
                        <span className="text-[9px] font-black text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                          Sin Lote/Caducidad
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{p.presentation}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 mt-2">
                      <span>Configurar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Ventas Hoy */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ventas del Día</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{todaySales.length} transacciones registradas</span>
            </div>
          </div>
        </div>

        {/* Ganancia Estimada */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Margen Bruto Estimado</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {settings.currencySymbol} {totalProfitAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Rentabilidad: {totalSalesAmount > 0 ? ((totalProfitAmount / totalSalesAmount) * 100).toFixed(1) : '0'}%
            </div>
          </div>
        </div>

        {/* Alertas de Vencimiento */}
        <div
          onClick={() => onNavigate('expirations')}
          className="bg-white border border-slate-200/80 hover:border-amber-400 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Vencen en &lt; 30 Días</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700 font-mono">
              {expiringSoonCount} lotes
            </div>
            <div className="text-[11px] text-red-600 mt-1 font-bold">
              {expiredCount} lotes caducados (Bloqueados)
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white border border-slate-200/80 hover:border-red-400 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Stock Bajo / Crítico</span>
            <div className="p-2 bg-red-50 rounded-xl text-red-600 border border-red-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 font-mono">
              {lowStockCount} productos
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Requieren orden de compra o traslado
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Últimas Ventas & Lotes Críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla Últimas Ventas */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Últimas Ventas Emitidas</span>
            </h2>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-bold"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {sales.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="font-semibold">Aún no hay ventas registradas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Las ventas realizadas en el POS aparecerán aquí.</p>
              </div>
            ) : (
              sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{sale.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-500">
                      {sale.customerName} • {new Date(sale.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700 font-mono text-sm">
                      {settings.currencySymbol} {sale.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{sale.paymentMethod}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lotes Próximos a Vencer (FEFO Alerts) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <span>Semáforo de Vencimientos FEFO</span>
            </h2>
            <button
              onClick={() => onNavigate('expirations')}
              className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-bold"
            >
              <span>Ver todo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {batches.filter((b) => b.branchId === currentBranch.id).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CalendarClock className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="font-semibold">Sin lotes registrados</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Al ingresar medicamentos se monitoreará su caducidad FEFO.</p>
              </div>
            ) : (
              batches
                .filter((b) => b.branchId === currentBranch.id)
                .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
                .slice(0, 5)
                .map((batch) => {
                  const prod = products.find((p) => p.id === batch.productId);
                  const expDate = new Date(batch.expirationDate);
                  const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isCritical = daysRemaining <= 90;
                  const isNear = daysRemaining > 90 && daysRemaining <= 365;

                  return (
                    <div
                      key={batch.id}
                      onClick={() => prod && openProductDetail(prod)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
                        isCritical
                          ? 'bg-red-50/60 border-red-200 hover:bg-red-100/50'
                          : isNear
                          ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/40'
                          : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-100/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                            {prod?.name || 'Medicamento'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                            <span>Lote: {batch.batchNumber}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">{batch.currentQuantity} unid.</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                              isCritical
                                ? 'bg-red-600 text-white border-red-700'
                                : isNear
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-emerald-600 text-white border-emerald-700'
                            }`}
                          >
                            {daysRemaining <= 0
                              ? 'VENCIDO'
                              : daysRemaining <= 30
                              ? `${daysRemaining} DÍAS`
                              : daysRemaining <= 90
                              ? `${daysRemaining} DÍAS (CRÍTICO)`
                              : daysRemaining <= 365
                              ? `${Math.round(daysRemaining / 30)} MESES`
                              : `VIGENTE (${expDate.getFullYear()})`}
                          </span>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">
                            {expDate.toLocaleDateString('es-SV', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
