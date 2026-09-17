'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Boxes,
  Receipt,
  Plus,
  Calendar,
  CreditCard,
  Building,
  Zap,
  Users,
  Wrench,
  ShoppingBag,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  PiggyBank,
  Package,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { ExpenseCategory, OperationalExpense } from '../../types/pharmacy';

export const OperationalExpensesView: React.FC = () => {
  const {
    operationalExpenses,
    addOperationalExpense,
    products,
    batches,
    sales,
    currentBranch,
    currentUser,
  } = usePharmacy();

  // Estados de filtros
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'WEEK' | 'MONTH'>('MONTH');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado del modal de nuevo gasto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Card'>('Transfer');
  const [invoiceReference, setInvoiceReference] = useState('');
  const [notes, setNotes] = useState('');

  // 1. CÁLCULO DE VALORIZACIÓN DEL INVENTARIO EN TIEMPO REAL
  const inventoryValuation = useMemo(() => {
    let totalCost = 0;
    let totalSaleValue = 0;
    let totalUnits = 0;

    batches.forEach((b) => {
      if (b.branchId === currentBranch.id && b.status === 'Available') {
        const prod = products.find((p) => p.id === b.productId);
        const unitPrice = prod?.salePrice || b.unitCost * 1.3;
        totalCost += b.currentQuantity * b.unitCost;
        totalSaleValue += b.currentQuantity * unitPrice;
        totalUnits += b.currentQuantity;
      }
    });

    const potentialMargin = totalSaleValue - totalCost;
    const potentialMarginPercent = totalSaleValue > 0 ? (potentialMargin / totalSaleValue) * 100 : 0;

    return {
      totalCost,
      totalSaleValue,
      potentialMargin,
      potentialMarginPercent,
      totalUnits,
    };
  }, [batches, products, currentBranch.id]);

  // 2. CÁLCULOS DE VENTAS, COSTOS Y GANANCIAS (SEMANA Y MES)
  const financialMetrics = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Ventas de la semana
    const weeklySales = sales.filter((s) => {
      const sDate = new Date(s.createdAt);
      return sDate >= oneWeekAgo && s.branchId === currentBranch.id && s.status === 'Completed';
    });
    const weeklyGrossSales = weeklySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const weeklyCogs = weeklySales.reduce((sum, s) => sum + (s.costAmount || s.totalAmount * 0.7), 0);
    const weeklyGrossProfit = weeklyGrossSales - weeklyCogs;

    // Gastos de la semana
    const weeklyExpensesList = operationalExpenses.filter((e) => {
      const eDate = new Date(e.expenseDate);
      return eDate >= oneWeekAgo && e.branchId === currentBranch.id;
    });
    const weeklyTotalExpenses = weeklyExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const weeklyNetProfit = weeklyGrossProfit - weeklyTotalExpenses;

    // Ventas del mes
    const monthlySales = sales.filter((s) => {
      const sDate = new Date(s.createdAt);
      return (
        sDate.getMonth() === currentMonth &&
        sDate.getFullYear() === currentYear &&
        s.branchId === currentBranch.id &&
        s.status === 'Completed'
      );
    });
    const monthlyGrossSales = monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const monthlyCogs = monthlySales.reduce((sum, s) => sum + (s.costAmount || s.totalAmount * 0.7), 0);
    const monthlyGrossProfit = monthlyGrossSales - monthlyCogs;

    // Gastos del mes
    const monthlyExpensesList = operationalExpenses.filter((e) => {
      const eDate = new Date(e.expenseDate);
      return (
        eDate.getMonth() === currentMonth &&
        eDate.getFullYear() === currentYear &&
        e.branchId === currentBranch.id
      );
    });
    const monthlyTotalExpenses = monthlyExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const monthlyNetProfit = monthlyGrossProfit - monthlyTotalExpenses;
    const monthlyNetMargin = monthlyGrossSales > 0 ? (monthlyNetProfit / monthlyGrossSales) * 100 : 0;

    return {
      weeklyGrossSales,
      weeklyCogs,
      weeklyGrossProfit,
      weeklyTotalExpenses,
      weeklyNetProfit,
      monthlyGrossSales,
      monthlyCogs,
      monthlyGrossProfit,
      monthlyTotalExpenses,
      monthlyNetProfit,
      monthlyNetMargin,
    };
  }, [sales, operationalExpenses, currentBranch.id]);

  // 3. DESGLOSE DE GASTOS POR CATEGORÍA
  const categoryBreakdown = useMemo(() => {
    const categoriesMap: Record<ExpenseCategory, { label: string; amount: number; count: number; icon: React.ElementType }> = {
      Rent: { label: 'Alquiler de Local', amount: 0, count: 0, icon: Building },
      Utilities: { label: 'Servicios (Luz / Frío / Agua)', amount: 0, count: 0, icon: Zap },
      Payroll: { label: 'Nómina & Salarios', amount: 0, count: 0, icon: Users },
      Maintenance: { label: 'Mantenimiento & Climatización', amount: 0, count: 0, icon: Wrench },
      Supplies: { label: 'Insumos & Empaque Farmacéutico', amount: 0, count: 0, icon: ShoppingBag },
      Taxes_Permits: { label: 'Tasas Municipales & Permisos', amount: 0, count: 0, icon: FileCheck },
      Other: { label: 'Otros Gastos Operativos', amount: 0, count: 0, icon: DollarSign },
    };

    operationalExpenses.forEach((exp) => {
      if (categoriesMap[exp.category]) {
        categoriesMap[exp.category].amount += exp.amount;
        categoriesMap[exp.category].count += 1;
      }
    });

    const total = Object.values(categoriesMap).reduce((sum, c) => sum + c.amount, 0);

    return {
      breakdown: Object.entries(categoriesMap).map(([key, data]) => ({
        key: key as ExpenseCategory,
        ...data,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      })),
      total,
    };
  }, [operationalExpenses]);

  // 4. LISTADO FILTRADO DE GASTOS
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return operationalExpenses.filter((exp) => {
      const expDate = new Date(exp.expenseDate);

      // Filtro de período
      if (periodFilter === 'WEEK' && expDate < oneWeekAgo) return false;
      if (
        periodFilter === 'MONTH' &&
        (expDate.getMonth() !== currentMonth || expDate.getFullYear() !== currentYear)
      ) {
        return false;
      }

      // Filtro de categoría
      if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = exp.expenseNumber.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchRef = exp.invoiceReference?.toLowerCase().includes(q) || false;
        if (!matchNum && !matchDesc && !matchRef) return false;
      }

      return true;
    });
  }, [operationalExpenses, periodFilter, categoryFilter, searchQuery]);

  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido para el gasto.');
      return;
    }

    addOperationalExpense({
      category,
      description: description.trim() || 'Gasto operacional de farmacia',
      amount: parsedAmount,
      paymentMethod,
      invoiceReference: invoiceReference.trim() || undefined,
      expenseDate: new Date().toISOString(),
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      createdBy: currentUser.fullName || currentUser.username,
      notes: notes.trim() || undefined,
    });

    // Limpiar formulario y cerrar modal
    setDescription('');
    setAmount('');
    setInvoiceReference('');
    setNotes('');
    setIsModalOpen(false);
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Rent': return 'Alquiler';
      case 'Utilities': return 'Servicios / Electricidad';
      case 'Payroll': return 'Planilla';
      case 'Maintenance': return 'Mantenimiento';
      case 'Supplies': return 'Insumos / Bolsas';
      case 'Taxes_Permits': return 'Tasas & Permisos';
      default: return 'Otros';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Control Financiero Integral • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard de Gastos Operativos & Ganancias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Valorización de inventario en tiempo real, desglose de costos operativos (OPEX) y balance neto semanal y mensual.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Gasto Operativo</span>
        </button>
      </div>

      {/* 4 KPI CARDS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ganancia Neta del Mes */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Ganancia Neta del Mes
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ${financialMetrics.monthlyNetProfit.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-100">
            <span className="text-slate-500">Margen Neto Real:</span>
            <span className="font-extrabold text-emerald-700">
              {financialMetrics.monthlyNetMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 2. Ganancia Neta de la Semana */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ganancia Neta Semanal (7d)
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-blue-900">
            ${financialMetrics.weeklyNetProfit.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Ventas 7 días:</span>
            <span className="font-bold text-slate-700">
              ${financialMetrics.weeklyGrossSales.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 3. Valorización del Inventario */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Valor del Inventario (Costo)
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ${inventoryValuation.totalCost.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Venta Proyectada:</span>
            <span className="font-bold text-emerald-700">
              ${inventoryValuation.totalSaleValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 4. Gastos Operativos Totales (Mes) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Gastos Operativos (Mes)
            </span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            ${financialMetrics.monthlyTotalExpenses.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Gastos Semana:</span>
            <span className="font-bold text-slate-700">
              ${financialMetrics.weeklyTotalExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN INTERMEDIA: ESTADO DE RESULTADOS & DISTRIBUCIÓN OPEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* P&L Express: Estado de Resultados de la Farmacia */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Estado de Resultados (Mes en Curso)
              </h3>
              <p className="text-[11px] text-slate-500">
                Fórmula: Ventas − Costo Medicamentos − Gastos Operativos
              </p>
            </div>
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> (+) Ventas Totales Facturadas:
              </span>
              <span className="font-mono font-black text-slate-900 text-sm">
                ${financialMetrics.monthlyGrossSales.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 text-slate-600 border-b border-slate-100 pb-2">
              <span className="font-medium flex items-center gap-1.5 pl-3">
                (-) Costo de Mercadería Vendida (COGS):
              </span>
              <span className="font-mono font-bold text-slate-600">
                ${financialMetrics.monthlyCogs.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 bg-slate-50 p-2.5 rounded-xl font-bold">
              <span className="text-slate-800">(=) Utilidad Bruta de Farmacia:</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                ${financialMetrics.monthlyGrossProfit.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 text-rose-700 border-b border-slate-100 pb-2">
              <span className="font-medium flex items-center gap-1.5 pl-3">
                (-) Gastos Operativos de Operación (OPEX):
              </span>
              <span className="font-mono font-bold text-rose-700">
                -${financialMetrics.monthlyTotalExpenses.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div>
                <p className="font-black text-emerald-950 text-sm">(=) Ganancia Neta Real</p>
                <p className="text-[10px] text-emerald-700">Utilidad líquida disponible en caja</p>
              </div>
              <span className="font-mono font-black text-xl text-emerald-800">
                ${financialMetrics.monthlyNetProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Desglose de Gastos por Categoría */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Distribución de Gastos Operativos
              </h3>
              <p className="text-[11px] text-slate-500">
                Total acumulado en el mes: <strong>${categoryBreakdown.total.toFixed(2)}</strong>
              </p>
            </div>
            <PiggyBank className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3.5">
            {categoryBreakdown.breakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400">({item.count} pagos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        ${item.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 w-10 text-right">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TABLA DE GASTOS OPERATIVOS REGISTRADOS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Bitácora Detallada de Gastos Operativos
            </h3>
            <p className="text-xs text-slate-500">
              Registro inmutable de egresos de caja y transferencias de la sucursal.
            </p>
          </div>

          {/* Filtros de Período y Categoría */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar gasto o factura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Selector de Período */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
              {[
                { id: 'WEEK', label: 'Semana' },
                { id: 'MONTH', label: 'Mes Actual' },
                { id: 'ALL', label: 'Histórico' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodFilter(p.id as any)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    periodFilter === p.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Selector de Categoría */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-100 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1.5 border-0 outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="Rent">Alquiler</option>
              <option value="Utilities">Servicios / Electricidad</option>
              <option value="Payroll">Nómina</option>
              <option value="Maintenance">Mantenimiento</option>
              <option value="Supplies">Insumos</option>
              <option value="Taxes_Permits">Tasas & Permisos</option>
            </select>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-4">Descripción del Gasto</th>
                <th className="py-3 px-3">Método / Referencia</th>
                <th className="py-3 px-3">Registrado Por</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron gastos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(exp.expenseDate).toLocaleDateString('es-SV', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {getCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{exp.description}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-500 italic">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-semibold">{exp.paymentMethod}</span>
                      {exp.invoiceReference && (
                        <span className="block font-mono text-[10px] text-slate-400">
                          {exp.invoiceReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{exp.createdBy}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-sm">
                      ${exp.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA REGISTRAR NUEVO GASTO OPERATIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-widest">
                  EGRESO FINANCIERO
                </span>
                <h3 className="text-base font-black">Registrar Gasto Operativo (OPEX)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterExpense} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoría del Gasto <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Rent">🏢 Alquiler de Local</option>
                    <option value="Utilities">⚡ Energía / Frío / Agua</option>
                    <option value="Payroll">👥 Nómina & Salarios</option>
                    <option value="Maintenance">🔧 Mantenimiento & A/C</option>
                    <option value="Supplies">🛍️ Insumos & Papelería</option>
                    <option value="Taxes_Permits">📜 Tasas & Permisos</option>
                    <option value="Other">💼 Otro Gasto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Monto en Dólares ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción o Concepto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. Pago de energía eléctrica CAESS - Cadena de frío"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Transfer">Transferencia Bancaria</option>
                    <option value="Cash">Efectivo (Caja Chica)</option>
                    <option value="Card">Tarjeta Institucional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    N° Factura / Recibo
                  </label>
                  <input
                    type="text"
                    placeholder="ej. REC-CAESS-9921"
                    value={invoiceReference}
                    onChange={(e) => setInvoiceReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales sobre la autorización o destino del gasto..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Gasto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
