'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  Filter,
  DollarSign,
  Printer,
  RotateCcw,
  Eye,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  User,
  Clock,
  Layers,
  FileSpreadsheet,
  Banknote,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Sale } from '../../types/pharmacy';

export const SalesHistoryView: React.FC<{
  onNavigateToReturns?: (invoiceNumber?: string) => void;
}> = ({ onNavigateToReturns }) => {
  const { sales, currentBranch, settings } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Comprobación de fecha de hoy robusta
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

  // Filtrado según tab y filtros
  const baseSales = (sales || []).filter((s) => {
    const isBranchMatch = !s.branchId || s.branchId === currentBranch.id;
    if (!isBranchMatch) return false;
    if (activeTab === 'today') {
      return isToday(s.createdAt);
    }
    return true;
  });

  const filteredSales = baseSales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.userName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = selectedPayment === 'ALL' || s.paymentMethod === selectedPayment;
    const matchesUser = selectedUser === 'ALL' || s.userName.toLowerCase().includes(selectedUser.toLowerCase());
    return matchesSearch && matchesPayment && matchesUser;
  });

  // Lista única de cajeros/usuarios que han vendido
  const availableUsers = Array.from(new Set(baseSales.map((s) => s.userName))).filter(Boolean);

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalProfitAmount = filteredSales.reduce((sum, s) => sum + (s.profitAmount || 0), 0);
  const cashSalesAmount = filteredSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const cardSalesAmount = filteredSales
    .filter((s) => s.paymentMethod === 'Card')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const transferSalesAmount = filteredSales
    .filter((s) => s.paymentMethod === 'Transfer')
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              Sincronización en Tiempo Real
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Facturación & Ventas en Vivo</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en vivo para <strong className="text-slate-800">Jonathan & María</strong> • Sucursal: <strong className="text-emerald-700">{currentBranch.name}</strong>
          </p>
        </div>

        {onNavigateToReturns && (
          <button
            type="button"
            onClick={() => onNavigateToReturns()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Módulo Devoluciones</span>
          </button>
        )}
      </div>

      {/* Selector de Pestaña Principal */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>🔴 Ventas de Hoy (En Vivo - Sin Cierre de Caja)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-800 text-[10px] text-white">
            {sales.filter((s) => s.branchId === currentBranch.id && isToday(s.createdAt)).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>📅 Histórico Completo de Facturas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-300 text-[10px] text-slate-800">
            {sales.filter((s) => s.branchId === currentBranch.id).length}
          </span>
        </button>
      </div>

      {/* Tarjetas Resumen de Ventas Filtradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-emerald-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            {activeTab === 'today' ? 'Total Facturado Hoy' : 'Total Facturado Seleccionado'}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-1">
            {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <span>{filteredSales.length} {filteredSales.length === 1 ? 'comprobante emitido' : 'comprobantes emitidos'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Efectivo Cobrado
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
            {settings.currencySymbol} {cashSalesAmount.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Dinero físico directo en caja
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tarjeta & Transferencias
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
            {settings.currencySymbol} {(cardSalesAmount + transferSalesAmount).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Tarjetas: {settings.currencySymbol} {cardSalesAmount.toFixed(2)} • Transf: {settings.currencySymbol} {transferSalesAmount.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
            Margen / Ganancia Neta
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono mt-1">
            {settings.currencySymbol} {totalProfitAmount.toFixed(2)}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-semibold">
            {totalSalesAmount > 0 ? `${((totalProfitAmount / totalSalesAmount) * 100).toFixed(1)}% margen` : '0%'}
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por N° Factura, Cliente o Cajero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Cajero */}
          {availableUsers.length > 0 && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">👤 Todos los Cajeros</option>
              {availableUsers.map((u) => (
                <option key={u} value={u}>
                  👤 {u}
                </option>
              ))}
            </select>
          )}

          {/* Filtro Método de Pago */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">💳 Todas las Formas de Pago</option>
            <option value="Cash">💵 Efectivo</option>
            <option value="Card">💳 Tarjeta BAC / Banpro</option>
            <option value="Transfer">🏦 Transferencia Bancaria</option>
          </select>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Hora / Fecha</th>
                <th className="py-3 px-4">N° Factura</th>
                <th className="py-3 px-4">Cajero(a)</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Total Cobrado</th>
                <th className="py-3 px-4 text-right">Ganancia</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No hay comprobantes para este filtro</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeTab === 'today'
                        ? 'Las ventas que facture la cajera en el POS aparecerán aquí al segundo en vivo.'
                        : 'No se encontraron facturas con los criterios de búsqueda.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const saleDate = new Date(sale.createdAt);
                  const timeString = saleDate.toLocaleTimeString('es-SV', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const dateString = saleDate.toLocaleDateString('es-SV', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={sale.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{timeString}</div>
                        <div className="text-[10px] text-slate-400">{dateString}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {sale.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{sale.userName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {sale.customerName || 'Cliente Mostrador'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            sale.paymentMethod === 'Cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.paymentMethod === 'Card'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {sale.paymentMethod === 'Cash'
                            ? '💵 Efectivo'
                            : sale.paymentMethod === 'Card'
                            ? '💳 Tarjeta'
                            : '🏦 Transferencia'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {(sale.items || []).reduce((acc, i) => acc + i.quantity, 0)} unid.
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-900 text-sm">
                        {settings.currencySymbol} {(sale.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700 text-xs">
                        {settings.currencySymbol} {(sale.profitAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(sale)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Ver Detalle del Ticket"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE DE COMPROBANTE */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header Ticket */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-black text-sm">{selectedSale.invoiceNumber}</h3>
                  <p className="text-[10px] text-emerald-200">
                    Comprobante Fiscal • {new Date(selectedSale.createdAt).toLocaleString('es-SV')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cajero(a)</span>
                  <div className="font-bold text-slate-800">{selectedSale.userName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cliente</span>
                  <div className="font-bold text-slate-800">{selectedSale.customerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Método Pago</span>
                  <div className="font-bold text-slate-800">{selectedSale.paymentMethod}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sucursal</span>
                  <div className="font-bold text-slate-800">{selectedSale.branchName}</div>
                </div>
              </div>

              {/* Items Despachados */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                  Medicamentos Despachados (FEFO)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {(selectedSale.items || []).map((item, idx) => (
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
                  <span>{settings.currencySymbol} {selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>- {settings.currencySymbol} {selectedSale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-emerald-900 pt-1 border-t border-slate-200">
                  <span>TOTAL FACTURADO:</span>
                  <span>{settings.currencySymbol} {selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                {selectedSale.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Efectivo Entregado:</span>
                      <span>{settings.currencySymbol} {selectedSale.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Cambio / Vuelto:</span>
                      <span>{settings.currencySymbol} {selectedSale.changeAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
