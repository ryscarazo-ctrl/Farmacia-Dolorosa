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
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Sale } from '../../types/pharmacy';

export const DashboardView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const now = new Date();
  const {
    openProductDetail,
    currentBranch,
    sales,
    products,
    batches,
    currentCashSession,
    settings,
  } = usePharmacy();

  const [selectedTicket, setSelectedTicket] = useState<Sale | null>(null);

  // Filtro de ventas de HOY (Tiempo Real sin necesidad de cierre)
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

  const totalSalesAmount = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalProfitAmount = todaySales.reduce((sum, s) => sum + (s.profitAmount || 0), 0);
  const cashSalesAmount = todaySales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const cardSalesAmount = todaySales
    .filter((s) => s.paymentMethod === 'Card')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const transferSalesAmount = todaySales
    .filter((s) => s.paymentMethod === 'Transfer')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalUnitsSold = todaySales.reduce(
    (sum, s) => sum + (s.items || []).reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );
  const avgTicket = todaySales.length > 0 ? totalSalesAmount / todaySales.length : 0;

  // Medicamentos Pendientes de Venta (Sin Precio o Sin Lote/Caducidad)
  const pendingSalesProducts = products.filter((p) => {
    const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
    const missingPrice = !p.salePrice || p.salePrice <= 0;
    const missingBatches = pBatches.length === 0;
    const allExpired = pBatches.length > 0 && pBatches.every((b) => new Date(b.expirationDate) <= now);
    return missingPrice || missingBatches || allExpired;
  });

  const lowStockCount = products.filter((p) => {
    const validBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
    const stock = validBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    return stock > 0 && stock <= p.minStock;
  }).length;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Banner Principal de Monitoreo en Vivo */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                🔴 MONITOR DE VENTAS EN VIVO (TIEMPO REAL)
              </span>
              <span className="hidden sm:inline-block text-[10px] text-emerald-300/80 font-semibold">
                • Jonathan Rojas & María Tardencilla
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Panel de Control & Ventas del Día</span>
            </h1>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
              Monitoreo en vivo de facturación de caja ({currentBranch.name}). Los registros se actualizan al instante sin necesidad de que el personal cierre el día.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('sales')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Ver Historial Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </button>
            <button
              onClick={() => onNavigate('pos')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Punto de Venta POS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas de Ventas de Hoy en Vivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Facturado Hoy */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="text-emerald-900 font-bold">Ventas Totales (Hoy)</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono tracking-tight">
              {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{todaySales.length} {todaySales.length === 1 ? 'venta facturada' : 'ventas facturadas'} en vivo</span>
            </div>
          </div>
        </div>

        {/* 2. Desglose en Efectivo vs Tarjeta */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Efectivo vs Tarjeta / Transf.</span>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Efectivo:
              </span>
              <span className="font-mono font-black text-slate-900">
                {settings.currencySymbol} {cashSalesAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Tarjeta/Transf:
              </span>
              <span className="font-mono font-black text-slate-900">
                {settings.currencySymbol} {(cardSalesAmount + transferSalesAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Ganancia Neta Estimada */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Margen & Ganancia Hoy</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-900 font-mono">
              {settings.currencySymbol} {totalProfitAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {totalSalesAmount > 0
                ? `${((totalProfitAmount / totalSalesAmount) * 100).toFixed(1)}% margen bruto en vivo`
                : 'Sin margen calculado aún'}
            </div>
          </div>
        </div>

        {/* 4. Medicamentos Despachados & Promedio */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Unidades & Ticket Promedio</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalUnitsSold} <span className="text-xs font-normal text-slate-500 font-sans">unid.</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Promedio: <strong className="font-mono text-slate-700">{settings.currencySymbol} {avgTicket.toFixed(2)}</strong> por venta
            </div>
          </div>
        </div>
      </div>

      {/* Sección Principal: Transmisión de Ventas en Vivo Ticket por Ticket */}
      <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Transmisión en Vivo de Ventas (Turno de Hoy)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black animate-pulse">
                EN VIVO
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada venta realizada por la cajera se refleja aquí al segundo sin necesidad de recargar la página ni cerrar caja.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Total del día:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-black font-mono">
              {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Lista en Vivo de Ventas de Hoy */}
        {todaySales.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <Receipt className="w-6 h-6 opacity-70" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Esperando ventas de la jornada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              En cuanto la cajera facture un medicamento en el Punto de Venta (POS), aparecerá automáticamente aquí en tiempo real para Jonathan y María.
            </p>
            <button
              onClick={() => onNavigate('pos')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Abrir Caja / Vender Ahora</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {todaySales.map((sale) => {
              const saleDate = new Date(sale.createdAt);
              const timeString = saleDate.toLocaleTimeString('es-SV', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={sale.id}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/40 rounded-xl px-2.5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-mono text-xs font-black shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {sale.customerName || 'Cliente Mostrador'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                          Cajero: <strong className="text-slate-700">{sale.userName}</strong>
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            sale.paymentMethod === 'Cash'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sale.paymentMethod === 'Card'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {sale.paymentMethod === 'Cash'
                            ? '💵 Efectivo'
                            : sale.paymentMethod === 'Card'
                            ? '💳 Tarjeta'
                            : '🏦 Transferencia'}
                        </span>
                      </div>

                      {/* Resumen de Medicamentos Vendidos en este ticket */}
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                        {(sale.items || []).map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium"
                          >
                            <strong className="text-emerald-700 font-bold">{item.quantity}x</strong> {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-900 font-mono">
                        {settings.currencySymbol} {(sale.totalAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Hora: {timeString}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicket(sale)}
                      className="p-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      title="Ver Ticket y Lotes Despachados"
                    >
                      <Eye className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid de 2 Columnas: Lotes FEFO & Alertas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicamentos Pendientes de Venta */}
        <div
          onClick={() => onNavigate('new-product')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="text-amber-900 font-bold">Medicamentos Sin Lote / Sin Precio</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900 font-mono">
              {pendingSalesProducts.length} medicamentos
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {pendingSalesProducts.length === 0
                ? '¡Excelente! Todos los productos están listos para venta en POS.'
                : 'Requieren asignación de lote/vencimiento o precio de venta.'}
            </div>
          </div>
        </div>

        {/* Stock Bajo / Crítico */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="text-red-900 font-bold">Stock Bajo / Crítico</span>
            <div className="p-2 bg-red-50 rounded-xl text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 font-mono">
              {lowStockCount} productos
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Requieren orden de compra o reposición
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE DE TICKET EN VIVO */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header Ticket */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-black text-sm">{selectedTicket.invoiceNumber}</h3>
                  <p className="text-[10px] text-emerald-200">
                    Comprobante Emitido en Vivo • {new Date(selectedTicket.createdAt).toLocaleString('es-SV')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del Ticket */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cajero(a)</span>
                  <div className="font-bold text-slate-800">{selectedTicket.userName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cliente</span>
                  <div className="font-bold text-slate-800">{selectedTicket.customerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Método Pago</span>
                  <div className="font-bold text-slate-800">{selectedTicket.paymentMethod}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sucursal</span>
                  <div className="font-bold text-slate-800">{selectedTicket.branchName}</div>
                </div>
              </div>

              {/* Items Despachados */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                  Medicamentos Despachados (FEFO)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {(selectedTicket.items || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-white">
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Lote: {item.batchNumber} • Vence: {item.expirationDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {item.quantity} x {settings.currencySymbol} {item.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          Total: {settings.currencySymbol} {item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{settings.currencySymbol} {selectedTicket.subtotal.toFixed(2)}</span>
                </div>
                {selectedTicket.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>- {settings.currencySymbol} {selectedTicket.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-emerald-900 pt-1 border-t border-slate-200">
                  <span>TOTAL COBRADO:</span>
                  <span>{settings.currencySymbol} {selectedTicket.totalAmount.toFixed(2)}</span>
                </div>
                {selectedTicket.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Efectivo Entregado:</span>
                      <span>{settings.currencySymbol} {selectedTicket.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Cambio / Vuelto:</span>
                      <span>{settings.currencySymbol} {selectedTicket.changeAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
