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
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Sale } from '../../types/pharmacy';

export const SalesHistoryView: React.FC<{
  onNavigateToReturns?: (invoiceNumber?: string) => void;
}> = ({ onNavigateToReturns }) => {
  const { sales, currentBranch, settings } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.userName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = selectedPayment === 'ALL' || s.paymentMethod === selectedPayment;
    return matchesSearch && matchesPayment;
  });

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfitAmount = filteredSales.reduce((sum, s) => sum + s.profitAmount, 0);
  const cashSalesAmount = filteredSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const cardSalesAmount = filteredSales
    .filter((s) => s.paymentMethod === 'Card')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>Historial Oficial de Ventas y Facturación</span>
          </h1>
          <p className="text-xs text-slate-500">
            Sucursal: <strong className="text-emerald-700">{currentBranch.name}</strong> • Registro de comprobantes fiscales emitidos
          </p>
        </div>

        {onNavigateToReturns && (
          <button
            type="button"
            onClick={() => onNavigateToReturns()}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-300 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Ir al Módulo de Devoluciones</span>
          </button>
        )}
      </div>

      {/* Tarjetas KPI de Ventas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Facturación Total</div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-1">
            {settings.currencySymbol} {totalSalesAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {filteredSales.length} transacciones registradas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Margen Bruto Total</div>
          <div className="text-2xl font-mono font-black text-emerald-700 mt-1">
            {settings.currencySymbol} {totalProfitAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Rentabilidad sobre ventas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Ventas en Efectivo</div>
          <div className="text-2xl font-mono font-black text-slate-800 mt-1">
            {settings.currencySymbol} {cashSalesAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ingresado a caja física</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Ventas en Tarjeta</div>
          <div className="text-2xl font-mono font-black text-slate-800 mt-1">
            {settings.currencySymbol} {cardSalesAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cobro electrónico POS</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por N° Factura (ej. FAC-000101), cliente o cajero..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <select
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
        >
          <option value="ALL">Todos los Métodos de Pago</option>
          <option value="Cash">Solo Efectivo (Cash)</option>
          <option value="Card">Solo Tarjeta (Card)</option>
          <option value="Transfer">Solo Transferencia</option>
        </select>
      </div>

      {/* Tabla de Historial de Ventas */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">N° Factura</th>
                <th className="p-3.5">Fecha & Hora</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Atendido por</th>
                <th className="p-3.5 text-center">Ítems</th>
                <th className="p-3.5 text-center">Método</th>
                <th className="p-3.5 text-right">Total Facturado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No se encontraron registros de ventas coincidentes.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {sale.invoiceNumber}
                    </td>

                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {sale.customerName || 'Cliente General'}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {sale.userName}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700">
                        {sale.items.length} prod.
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100/70 text-emerald-900 border border-emerald-300">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      {settings.currencySymbol} {sale.totalAmount.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSale(sale);
                            setTicketModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                          title="Ver Ticket e Imprimir"
                        >
                          <Printer className="w-4 h-4 text-emerald-600" />
                        </button>
                        {onNavigateToReturns && (
                          <button
                            type="button"
                            onClick={() => onNavigateToReturns(sale.invoiceNumber)}
                            className="p-1.5 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                            title="Procesar Devolución de este Ticket"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ticket de Venta */}
      {ticketModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
              <div className="font-black text-sm text-emerald-800 tracking-wider">
                FARMACIA ESPÍRITU SANTO 🕊️
              </div>
              <div className="text-[11px] font-bold text-slate-700">{selectedSale.branchName}</div>
              <div className="text-[10px] text-slate-500 font-mono">NIT: {settings.taxNumber}</div>
              <div className="pt-2">
                <span className="bg-slate-100 text-slate-800 text-xs font-mono font-bold px-3 py-1 rounded-full border border-slate-300 uppercase">
                  TICKET FACTURA • {selectedSale.invoiceNumber}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1 font-mono text-slate-700 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha:</span>
                <span>{new Date(selectedSale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-bold">{selectedSale.customerName || 'Cliente Mostrador'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cajero:</span>
                <span>{selectedSale.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Método de Pago:</span>
                <span className="font-bold">{selectedSale.paymentMethod}</span>
              </div>
            </div>

            {/* Lista de Medicamentos */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-[10px] uppercase text-slate-400 border-b border-slate-100 pb-1">
                Detalle de Medicamentos
              </div>
              {selectedSale.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px] font-mono">
                  <div>
                    <div className="font-bold text-slate-800">{it.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      {it.quantity} x {settings.currencySymbol} {it.unitPrice.toFixed(2)} • Lote: {it.batchNumber}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">
                    {settings.currencySymbol} {it.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{settings.currencySymbol} {selectedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Descuentos:</span>
                <span>-{settings.currencySymbol} {selectedSale.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>TOTAL A PAGAR:</span>
                <span className="text-emerald-700">{settings.currencySymbol} {selectedSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Efectivo recibido:</span>
                <span>{settings.currencySymbol} {selectedSale.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Cambio entregado:</span>
                <span>{settings.currencySymbol} {selectedSale.changeAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-400 italic pt-1">
              {settings.ticketFooter}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
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
