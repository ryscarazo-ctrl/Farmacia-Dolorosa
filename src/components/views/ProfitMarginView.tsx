'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Percent,
  DollarSign,
  Award,
  Search,
  Filter,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Sparkles,
  BarChart3,
  Receipt,
  Layers,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const ProfitMarginView: React.FC = () => {
  const { sales, products, batches, categories, currentBranch } = usePharmacy();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulador de Margen
  const [simCost, setSimCost] = useState('3.50');
  const [simPrice, setSimPrice] = useState('5.50');

  // Cálculo de Margen por Producto
  const productMargins = useMemo(() => {
    return products.map((prod) => {
      const cost = prod.purchasePrice;
      const price = prod.salePrice;
      const profitUnit = price - cost;
      const marginPercent = price > 0 ? (profitUnit / price) * 100 : 0;
      const markupPercent = cost > 0 ? (profitUnit / cost) * 100 : 0;

      // Unidades vendidas
      const branchSales = sales.filter((s) => s.branchId === currentBranch.id && s.status === 'Completed');
      let unitsSold = 0;
      let totalRevenue = 0;
      let totalProfit = 0;

      branchSales.forEach((s) => {
        s.items?.forEach((item) => {
          if (item.productId === prod.id) {
            unitsSold += item.quantity;
            totalRevenue += item.subtotal;
            totalProfit += item.quantity * (item.unitPrice - item.unitCost);
          }
        });
      });

      return {
        ...prod,
        cost,
        price,
        profitUnit,
        marginPercent,
        markupPercent,
        unitsSold,
        totalRevenue,
        totalProfit,
      };
    });
  }, [products, sales, currentBranch.id]);

  // Filtrado de Productos
  const filteredProducts = useMemo(() => {
    return productMargins.filter((p) => {
      if (categoryFilter !== 'ALL' && p.categoryId !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchGeneric = p.genericName?.toLowerCase().includes(q) || false;
        const matchBarcode = p.barcode.includes(q);
        if (!matchName && !matchGeneric && !matchBarcode) return false;
      }
      return true;
    });
  }, [productMargins, categoryFilter, searchQuery]);

  // Métricas Consolidadas
  const branchSales = sales.filter((s) => s.branchId === currentBranch.id && s.status === 'Completed');
  const totalSalesRevenue = branchSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesCost = branchSales.reduce((sum, s) => sum + (s.costAmount || s.totalAmount * 0.7), 0);
  const totalSalesProfit = totalSalesRevenue - totalSalesCost;
  const averageMargin = totalSalesRevenue > 0 ? (totalSalesProfit / totalSalesRevenue) * 100 : 0;

  // Ranking: Top 3 Más Rentables
  const topProfitableProducts = useMemo(() => {
    return [...productMargins].sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 3);
  }, [productMargins]);

  // Simulador de Margen Cálculos
  const parsedCost = parseFloat(simCost) || 0;
  const parsedPrice = parseFloat(simPrice) || 0;
  const simProfit = parsedPrice - parsedCost;
  const simMargin = parsedPrice > 0 ? (simProfit / parsedPrice) * 100 : 0;
  const simMarkup = parsedCost > 0 ? (simProfit / parsedCost) * 100 : 0;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Módulo de Inteligencia Comercial • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Análisis de Rentabilidad y Márgenes de Ganancia
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluación del retorno por medicamento, margen bruto comercial, simulador de precios y productos de mayor rentabilidad.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>Imprimir Informe de Rentabilidad</span>
        </button>
      </div>

      {/* KPI Cards de Margen y Retorno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-1 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Margen Bruto Promedio
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-900">
            {averageMargin.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Retorno sobre precio de venta
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ganancia Bruta en Mostrador
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            ${totalSalesProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            Sobre ventas de ${totalSalesRevenue.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Costo de Ventas (COGS)
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-700">
            ${totalSalesCost.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            Costo directo de reposición FEFO
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Líder en Rentabilidad
            </span>
            <span className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            {topProfitableProducts[0]?.name || 'Acetaminofén'}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {topProfitableProducts[0]?.marginPercent.toFixed(1)}% de margen unitario
          </div>
        </div>
      </div>

      {/* SECCIÓN DUAL: TOP PRODUCTOS ESTRELLA & SIMULADOR INTERACTIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 3 Productos de Mayor Margen */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Medicamentos con Mayor Margen Porcentual
              </h3>
              <p className="text-[11px] text-slate-500">
                Productos que generan mayor ganancia neta por cada dólar vendido
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topProfitableProducts.map((prod, index) => (
              <div
                key={prod.id}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{prod.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Costo: ${prod.cost.toFixed(2)} ➔ Venta: ${prod.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    +{prod.marginPercent.toFixed(1)}%
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                    Utilidad: +${prod.profitUnit.toFixed(2)}/u
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulador de Precios y Margen (Markup) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                HERRAMIENTA
              </span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Simulador de Margen & Markup
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Costo de Compra ($)</label>
              <input
                type="number"
                step="0.05"
                value={simCost}
                onChange={(e) => setSimCost(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Precio de Venta ($)</label>
              <input
                type="number"
                step="0.05"
                value={simPrice}
                onChange={(e) => setSimPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Ganancia Neta por Unidad:</span>
              <span className="font-mono font-black text-emerald-300 text-base">
                +${simProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Margen sobre Venta:</span>
              <span className="font-mono font-bold text-white">
                {simMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Markup sobre Costo:</span>
              <span className="font-mono font-bold text-emerald-200">
                +{simMarkup.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE RENTABILIDAD POR PRODUCTO */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Matriz de Rentabilidad del Catálogo Farmacéutico
            </h3>
            <p className="text-xs text-slate-500">
              Costo de adquisición vs precio al público y porcentaje de retorno de cada medicamento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar medicamento o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-100 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1.5 border-0 outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Medicamento</th>
                <th className="py-3 px-3">Código de Barra</th>
                <th className="py-3 px-3 text-right">Costo Compra</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-3 text-right">Ganancia Unitaria</th>
                <th className="py-3 px-3 text-center">Margen %</th>
                <th className="py-3 px-3 text-center">Markup %</th>
                <th className="py-3 px-4 text-center">Veredicto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{prod.name}</p>
                    {prod.genericName && (
                      <p className="text-[11px] text-slate-500">{prod.genericName}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {prod.barcode}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    ${prod.cost.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ${prod.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                    +${prod.profitUnit.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">
                    {prod.marginPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    +{prod.markupPercent.toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {prod.marginPercent >= 40 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Alta Rentabilidad
                      </span>
                    ) : prod.marginPercent >= 25 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Margen Óptimo
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Margen Ajustado
                      </span>
                    )}
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
