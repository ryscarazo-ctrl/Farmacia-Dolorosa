'use client';

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  Package,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const InventoryValuationView: React.FC = () => {
  const { batches, products, suppliers, currentBranch, settings } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState<'ALL' | 'EXPIRING_SOON' | 'AVAILABLE'>('ALL');

  // Lotes con cálculo de valuación y cruce de datos
  const enrichedBatches = useMemo(() => {
    const today = new Date();

    return batches
      .filter((b) => b.branchId === currentBranch.id)
      .map((b) => {
        const prod = products.find((p) => p.id === b.productId);
        const supplier = suppliers.find((s) => s.id === b.supplierId);

        const expDate = new Date(b.expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isExpiringSoon = daysToExpiry <= 45 && daysToExpiry >= 0;
        const isExpired = daysToExpiry < 0;

        const totalCostValue = b.currentQuantity * b.unitCost;
        const unitSalePrice = prod?.salePrice || b.unitCost * 1.35;
        const totalSaleValue = b.currentQuantity * unitSalePrice;
        const projectedMargin = totalSaleValue - totalCostValue;

        return {
          ...b,
          productName: prod?.name || 'Medicamento',
          genericName: prod?.genericName || '',
          barcode: prod?.barcode || 'N/A',
          presentation: prod?.presentation || 'Caja',
          supplierName: supplier?.name || b.supplierId || 'Droguería General',
          daysToExpiry,
          isExpiringSoon,
          isExpired,
          totalCostValue,
          unitSalePrice,
          totalSaleValue,
          projectedMargin,
        };
      });
  }, [batches, products, suppliers, currentBranch.id]);

  // Filtrado de lotes para la tabla
  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter((b) => {
      if (supplierFilter !== 'ALL' && b.supplierId !== supplierFilter) return false;

      if (expiryFilter === 'EXPIRING_SOON' && !b.isExpiringSoon) return false;
      if (expiryFilter === 'AVAILABLE' && (b.isExpired || b.status !== 'Available')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.productName.toLowerCase().includes(q);
        const matchGeneric = b.genericName.toLowerCase().includes(q);
        const matchBatch = b.batchNumber.toLowerCase().includes(q);
        const matchBarcode = b.barcode.includes(q);
        if (!matchName && !matchGeneric && !matchBatch && !matchBarcode) return false;
      }

      return true;
    });
  }, [enrichedBatches, supplierFilter, expiryFilter, searchQuery]);

  // Totales Globales
  const totalCostValuation = enrichedBatches.reduce((sum, b) => sum + b.totalCostValue, 0);
  const totalSaleValuation = enrichedBatches.reduce((sum, b) => sum + b.totalSaleValue, 0);
  const totalProjectedProfit = totalSaleValuation - totalCostValuation;
  const totalStockUnits = enrichedBatches.reduce((sum, b) => sum + b.currentQuantity, 0);

  // Capital en riesgo por vencimiento próximo (<45 días)
  const capitalAtRisk = enrichedBatches
    .filter((b) => b.isExpiringSoon)
    .reduce((sum, b) => sum + b.totalCostValue, 0);

  // Valuación por Laboratorio / Proveedor
  const supplierValuation = useMemo(() => {
    const map: Record<string, { name: string; totalCost: number; batchCount: number }> = {};
    enrichedBatches.forEach((b) => {
      const key = b.supplierName;
      if (!map[key]) {
        map[key] = { name: key, totalCost: 0, batchCount: 0 };
      }
      map[key].totalCost += b.totalCostValue;
      map[key].batchCount += 1;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalCostValuation > 0 ? (item.totalCost / totalCostValuation) * 100 : 0,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [enrichedBatches, totalCostValuation]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Auditoría Contable & Stock Valuado • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Valorización y Balance de Inventario Físico
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Valuación de existencias al costo de adquisición, precio de realización pública, capital inmovilizado y riesgo por caducidad.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Exportar Acta Contable de Inventario</span>
        </button>
      </div>

      {/* KPI Cards de Valuación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Valor al Costo de Adquisición */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-1 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Capital en Inventario (Costo)
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            {settings.currencySymbol} {totalCostValuation.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Inversión física inmovilizada en estantería
          </div>
        </div>

        {/* 2. Valor de Realización a Precio de Venta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Venta Proyectada en Mostrador
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-blue-900">
            {settings.currencySymbol} {totalSaleValuation.toFixed(2)}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold">
            Utilidad proyectada: +{settings.currencySymbol} {totalProjectedProfit.toFixed(2)}
          </div>
        </div>

        {/* 3. Unidades y Lotes Activos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Unidades Físicas Auditadas
            </span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            {totalStockUnits} <span className="text-sm font-bold text-slate-400">unids</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Distribuidas en {enrichedBatches.length} lotes con FEFO activo
          </div>
        </div>

        {/* 4. Capital en Riesgo de Caducidad */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Capital en Riesgo (&lt;45d)
            </span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-rose-700">
            {settings.currencySymbol} {capitalAtRisk.toFixed(2)}
          </div>
          <div className="text-[11px] text-rose-600 font-bold">
            Prioridad de rotación y ofertas FEFO
          </div>
        </div>
      </div>

      {/* DESGLOSE POR LABORATORIO / PROVEEDOR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Distribución de Capital por Laboratorio Farmacéutico
            </h3>
            <p className="text-[11px] text-slate-500">
              Monto total invertido por cada distribuidor o droguería proveedora
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supplierValuation.map((s, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 truncate" title={s.name}>
                  {s.name}
                </h4>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {s.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {settings.currencySymbol} {s.totalCost.toFixed(2)}
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">{s.batchCount} lotes almacenados</p>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA DE AUDITORÍA DE LOTES VALUADOS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Inventario Valuado por Lote y Código de Barra
            </h3>
            <p className="text-xs text-slate-500">
              Desglose detallado al costo unitario FEFO y liquidación proyectada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por lote, código o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Selector de Vencimiento */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'EXPIRING_SOON', label: 'Próximos a Vencer (<45d)' },
                { id: 'AVAILABLE', label: 'Activos Vigentes' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setExpiryFilter(f.id as any)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    expiryFilter === f.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Medicamento / Presentación</th>
                <th className="py-3 px-3">Código Barra</th>
                <th className="py-3 px-3">Lote</th>
                <th className="py-3 px-3">Vencimiento</th>
                <th className="py-3 px-3 text-center">Stock Físico</th>
                <th className="py-3 px-3 text-right">Costo Unit.</th>
                <th className="py-3 px-3 text-right">Costo Total ({settings.currencySymbol})</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-right">Venta Proyectada ({settings.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{batch.productName}</p>
                    <p className="text-[11px] text-slate-500">{batch.presentation}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {batch.barcode}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {batch.batchNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        batch.isExpiringSoon
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {new Date(batch.expirationDate).toLocaleDateString('es-SV', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 font-extrabold rounded-md text-xs">
                      {batch.currentQuantity} unids
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {settings.currencySymbol} {(batch.unitCost || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    {settings.currencySymbol} {batch.totalCostValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {settings.currencySymbol} {batch.unitSalePrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                    {settings.currencySymbol} {batch.totalSaleValue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
