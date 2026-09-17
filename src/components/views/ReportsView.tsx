'use client';

import React from 'react';
import {
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const ReportsView: React.FC = () => {
  const { sales, products, batches, currentBranch, settings } = usePharmacy();

  const branchSales = sales.filter((s) => s.branchId === currentBranch.id);
  const totalSales = branchSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = branchSales.reduce((sum, s) => sum + s.costAmount, 0);
  const grossProfit = totalSales - totalCost;
  const profitMargin = totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : '0';

  // Valorización de inventario
  const branchBatches = batches.filter((b) => b.branchId === currentBranch.id && b.status === 'Available');
  const inventoryValuationCost = branchBatches.reduce((sum, b) => sum + b.currentQuantity * b.unitCost, 0);
  const inventoryValuationSale = branchBatches.reduce((sum, b) => {
    const p = products.find((prod) => prod.id === b.productId);
    return sum + b.currentQuantity * (p?.salePrice || 0);
  }, 0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Reportes de Rentabilidad y Valorización Financiera</span>
          </h1>
          <p className="text-xs text-slate-500">
            Análisis financiero consolidado • Sucursal: {currentBranch.name}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* KPI Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Ventas Facturadas</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{settings.currencySymbol} {totalSales.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{branchSales.length} comprobantes emitidos</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Costo Total de Ventas</span>
          <div className="text-2xl font-black text-slate-600 font-mono mt-1">{settings.currencySymbol} {totalCost.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Costo real asignado por FEFO</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold">Margen Bruto Real</span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{settings.currencySymbol} {grossProfit.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">Rentabilidad bruta: {profitMargin}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-blue-700 font-semibold">Valorización Inventario (Costo)</span>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">{settings.currencySymbol} {inventoryValuationCost.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Proyección venta: {settings.currencySymbol} {inventoryValuationSale.toFixed(2)}</div>
        </div>
      </div>

      {/* Desglose de Rentabilidad por Venta */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>Detalle de Margen por Transacción</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3">Factura</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3 text-right">Venta Total</th>
                <th className="p-3 text-right">Costo Mercadería</th>
                <th className="p-3 text-right">Ganancia Neta</th>
                <th className="p-3 text-center">Margen %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchSales.map((sale) => {
                const margin = sale.totalAmount > 0 ? ((sale.profitAmount / sale.totalAmount) * 100).toFixed(1) : '0';
                return (
                  <tr key={sale.id} className="hover:bg-emerald-50/40">
                    <td className="p-3 font-mono font-bold text-slate-900">{sale.invoiceNumber}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {new Date(sale.createdAt).toLocaleString('es-SV')}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{sale.customerName}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{settings.currencySymbol} {sale.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{settings.currencySymbol} {sale.costAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700">{settings.currencySymbol} {sale.profitAmount.toFixed(2)}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-800">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
