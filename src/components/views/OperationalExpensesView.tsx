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
  CheckCircle2,
  Clock,
  PiggyBank,
  BookOpen,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  Vault,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { ExpenseCategory } from '../../types/pharmacy';

export const OperationalExpensesView: React.FC = () => {
  const {
    operationalExpenses,
    addOperationalExpense,
    products,
    batches,
    sales,
    purchases,
    returns,
    barcodeReturns,
    currentCashSession,
    currentBranch,
    currentUser,
    settings,
  } = usePharmacy();

  // Pestaña activa: Estado de Resultados & Gastos vs Libro Diario Contable
  const [activeSubTab, setActiveSubTab] = useState<'PNL' | 'JOURNAL' | 'EXPENSES'>('PNL');

  // Estados de filtros
  const [periodFilter, setPeriodFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [journalTypeFilter, setJournalTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado del modal de nuevo gasto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Card'>('Transfer');
  const [deductFromDrawer, setDeductFromDrawer] = useState<boolean>(true);
  const [invoiceReference, setInvoiceReference] = useState('');
  const [notes, setNotes] = useState('');

  // Helper para evaluar si una fecha ISO entra en el período seleccionado
  const isDateInPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    if (periodFilter === 'ALL') return true;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    if (periodFilter === 'TODAY') {
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }
    if (periodFilter === 'WEEK') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return d >= oneWeekAgo;
    }
    if (periodFilter === 'MONTH') {
      return dateStr.startsWith(selectedMonth);
    }
    return true;
  };

  // 1. CÁLCULO DE VALORIZACIÓN DEL INVENTARIO EN TIEMPO REAL
  const inventoryValuation = useMemo(() => {
    let totalCost = 0;
    let totalSaleValue = 0;
    let totalUnits = 0;

    batches.forEach((b) => {
      if (b.branchId === currentBranch.id && b.status === 'Available') {
        const prod = products.find((p) => p.id === b.productId);
        const unitPrice = prod?.salePrice || b.unitCost * 1.3;
        const unitCost = b.unitCost > 0 ? b.unitCost : (prod?.purchasePrice || unitPrice * 0.7);
        totalCost += b.currentQuantity * unitCost;
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

  // 2. CÁLCULOS CONTABLES CONSOLIDADOS (ESTADO DE RESULTADOS + FLUJO DE CAJA)
  const financialMetrics = useMemo(() => {
    // Ventas del período seleccionado
    const periodSales = sales.filter(
      (s) => (!s.branchId || s.branchId === currentBranch.id) && s.status !== 'Cancelled' && isDateInPeriod(s.createdAt)
    );

    const grossSales = periodSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const cashSales = periodSales
      .filter((s) => !s.paymentMethod || s.paymentMethod === 'Cash')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const cardSales = periodSales
      .filter((s) => s.paymentMethod === 'Card')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const transferSales = periodSales
      .filter((s) => s.paymentMethod === 'Transfer')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    // Costo de mercadería vendida (COGS) unificado
    const cogs = periodSales.reduce((sum, s) => {
      const saleCost =
        s.costAmount && s.costAmount > 0
          ? s.costAmount
          : (s.items || []).reduce((acc, it) => acc + (it.unitCost > 0 ? it.unitCost : it.unitPrice * 0.7) * it.quantity, 0) ||
            (s.totalAmount || 0) * 0.7;
      return sum + saleCost;
    }, 0);

    // Devoluciones del período (Con factura + Por código de barra)
    const periodTicketReturns = (returns || []).filter(
      (r) => (!r.branchId || r.branchId === currentBranch.id) && isDateInPeriod(r.createdAt)
    );
    const periodBarcodeReturns = (barcodeReturns || []).filter(
      (r) => (!r.branchId || r.branchId === currentBranch.id) && isDateInPeriod(r.createdAt)
    );

    const totalReturnsAmount =
      periodTicketReturns.reduce((sum, r) => sum + (r.totalRefundAmount || 0), 0) +
      periodBarcodeReturns.reduce((sum, r) => sum + (r.totalRefundAmount || 0), 0);

    // Costo recuperado de productos devueltos a RESTOCK
    const returnedRestockCost =
      periodTicketReturns.reduce((sum, r) => {
        const itemsCost = (r.items || []).reduce((acc, it) => {
          if (it.destination !== 'RESTOCK') return acc;
          const prod = products.find((p) => p.id === it.productId);
          return acc + (prod?.purchasePrice || it.unitPrice * 0.7) * it.quantityReturned;
        }, 0);
        return sum + itemsCost;
      }, 0) +
      periodBarcodeReturns.reduce((sum, r) => {
        if (r.destination !== 'RESTOCK') return sum;
        const prod = products.find((p) => p.id === r.productId);
        return sum + (prod?.purchasePrice || r.unitPrice * 0.7) * r.quantityReturned;
      }, 0);

    const netSales = Math.max(0, grossSales - totalReturnsAmount);
    const netCogs = Math.max(0, cogs - returnedRestockCost);
    const grossProfit = netSales - netCogs;
    const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    // Gastos operativos del período
    const periodExpenses = operationalExpenses.filter(
      (e) => (!e.branchId || e.branchId === currentBranch.id) && isDateInPeriod(e.expenseDate || e.createdAt)
    );
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Utilidad Neta Real
    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = netSales > 0 ? (netProfit / netSales) * 100 : 0;

    // Compras de inventario del período (Inversión en mercadería y Cuentas por Pagar)
    const periodPurchases = (purchases || []).filter(
      (p) => (!p.branchId || p.branchId === currentBranch.id) && isDateInPeriod(p.orderDate || p.createdAt)
    );
    const totalPurchasesPaid = periodPurchases
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPurchasesPending = periodPurchases
      .filter((p) => p.paymentStatus !== 'Paid')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    // Flujo Neto de Efectivo y Bancos (Entradas Reales - Salidas Reales Pagadas)
    const netCashFlow = netSales - totalExpenses - totalPurchasesPaid;

    return {
      salesCount: periodSales.length,
      grossSales,
      cashSales,
      cardSales,
      transferSales,
      totalReturnsAmount,
      returnsCount: periodTicketReturns.length + periodBarcodeReturns.length,
      netSales,
      netCogs,
      grossProfit,
      grossMarginPercent,
      totalExpenses,
      expensesCount: periodExpenses.length,
      netProfit,
      netMarginPercent,
      totalPurchasesPaid,
      totalPurchasesPending,
      purchasesCount: periodPurchases.length,
      netCashFlow,
    };
  }, [sales, returns, barcodeReturns, operationalExpenses, purchases, products, currentBranch.id, periodFilter, selectedMonth]);

  // 3. LIBRO DIARIO CONTABLE UNIFICADO (INGRESOS VS EGRESOS)
  const journalEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      date: string;
      type: 'IN' | 'OUT';
      category: 'VENTA' | 'GASTO OPEX' | 'COMPRA LAB' | 'DEVOLUCIÓN';
      reference: string;
      description: string;
      paymentMethod: string;
      amount: number;
      actor: string;
    }> = [];

    // 1. Ventas
    sales.forEach((s) => {
      if ((!s.branchId || s.branchId === currentBranch.id) && s.status !== 'Cancelled' && isDateInPeriod(s.createdAt)) {
        entries.push({
          id: `j-sal-${s.id}`,
          date: s.createdAt,
          type: 'IN',
          category: 'VENTA',
          reference: s.invoiceNumber,
          description: `Venta en mostrador (${s.customerName || 'Cliente General'}) • ${(s.items || []).length} ítems`,
          paymentMethod: s.paymentMethod === 'Card' ? 'Tarjeta POS' : s.paymentMethod === 'Transfer' ? 'Transferencia' : 'Efectivo',
          amount: s.totalAmount || 0,
          actor: s.userName || 'Cajero',
        });
      }
    });

    // 2. Gastos Operativos
    operationalExpenses.forEach((e) => {
      const eDate = e.expenseDate || e.createdAt;
      if ((!e.branchId || e.branchId === currentBranch.id) && isDateInPeriod(eDate)) {
        entries.push({
          id: `j-exp-${e.id}`,
          date: eDate,
          type: 'OUT',
          category: 'GASTO OPEX',
          reference: e.expenseNumber,
          description: e.description,
          paymentMethod: e.paymentMethod === 'Cash' ? 'Efectivo' : e.paymentMethod === 'Transfer' ? 'Transferencia' : 'Tarjeta',
          amount: e.amount || 0,
          actor: e.createdBy || 'Admin',
        });
      }
    });

    // 3. Compras Pagadas a Laboratorios
    (purchases || []).forEach((p) => {
      const pDate = p.createdAt || p.orderDate;
      if ((!p.branchId || p.branchId === currentBranch.id) && p.paymentStatus === 'Paid' && isDateInPeriod(pDate)) {
        entries.push({
          id: `j-pur-${p.id}`,
          date: pDate,
          type: 'OUT',
          category: 'COMPRA LAB',
          reference: p.invoiceNumber,
          description: `Pago de factura de compra a proveedor: ${p.supplierName}`,
          paymentMethod: p.paymentTerm === 'Contado' ? 'Efectivo / Contado' : 'Transferencia',
          amount: p.totalAmount || 0,
          actor: p.receivedBy || 'Admin',
        });
      }
    });

    // 4. Devoluciones (Ticket y Código de Barra)
    (returns || []).forEach((r) => {
      if ((!r.branchId || r.branchId === currentBranch.id) && isDateInPeriod(r.createdAt)) {
        entries.push({
          id: `j-ret-${r.id}`,
          date: r.createdAt,
          type: 'OUT',
          category: 'DEVOLUCIÓN',
          reference: r.returnNumber,
          description: `Reembolso por devolución sobre ticket ${r.saleInvoiceNumber || ''}`,
          paymentMethod: r.refundMethod === 'Cash' ? 'Efectivo' : r.refundMethod,
          amount: r.totalRefundAmount || 0,
          actor: r.authorizedBy || 'Cajero',
        });
      }
    });

    (barcodeReturns || []).forEach((r) => {
      if ((!r.branchId || r.branchId === currentBranch.id) && isDateInPeriod(r.createdAt)) {
        entries.push({
          id: `j-bcret-${r.id}`,
          date: r.createdAt,
          type: 'OUT',
          category: 'DEVOLUCIÓN',
          reference: r.returnNumber,
          description: `Devolución directa: ${r.productName} (x${r.quantityReturned})`,
          paymentMethod: r.refundMethod === 'Cash' ? 'Efectivo' : r.refundMethod,
          amount: r.totalRefundAmount || 0,
          actor: r.vendorName || 'Cajero',
        });
      }
    });

    return entries
      .filter((entry) => {
        if (journalTypeFilter !== 'ALL' && entry.type !== journalTypeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            entry.reference.toLowerCase().includes(q) ||
            entry.description.toLowerCase().includes(q) ||
            entry.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, operationalExpenses, purchases, returns, barcodeReturns, currentBranch.id, periodFilter, selectedMonth, journalTypeFilter, searchQuery]);

  // 4. DESGLOSE DE GASTOS POR CATEGORÍA
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
      if ((!exp.branchId || exp.branchId === currentBranch.id) && isDateInPeriod(exp.expenseDate || exp.createdAt)) {
        if (categoriesMap[exp.category]) {
          categoriesMap[exp.category].amount += exp.amount;
          categoriesMap[exp.category].count += 1;
        }
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
  }, [operationalExpenses, currentBranch.id, periodFilter, selectedMonth]);

  // 5. LISTADO FILTRADO DE GASTOS
  const filteredExpenses = useMemo(() => {
    return operationalExpenses.filter((exp) => {
      if (exp.branchId && exp.branchId !== currentBranch.id) return false;
      if (!isDateInPeriod(exp.expenseDate || exp.createdAt)) return false;
      if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = exp.expenseNumber.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchRef = exp.invoiceReference?.toLowerCase().includes(q) || false;
        if (!matchNum && !matchDesc && !matchRef) return false;
      }

      return true;
    });
  }, [operationalExpenses, currentBranch.id, periodFilter, selectedMonth, categoryFilter, searchQuery]);

  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido para el gasto.');
      return;
    }

    addOperationalExpense(
      {
        category,
        description: description.trim() || 'Gasto operacional de farmacia',
        amount: parsedAmount,
        paymentMethod,
        invoiceReference: invoiceReference.trim() || undefined,
        expenseDate: new Date().toISOString(),
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        createdBy: currentUser.fullName || currentUser.username,
        notes:
          paymentMethod === 'Cash'
            ? `${deductFromDrawer ? '[Descontado de Gaveta Turno]' : '[Fondo Admin Externo]'} ${notes.trim()}`.trim()
            : notes.trim() || undefined,
      },
      paymentMethod === 'Cash' ? deductFromDrawer : false
    );

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

  const periodLabel =
    periodFilter === 'TODAY'
      ? 'Hoy'
      : periodFilter === 'WEEK'
      ? 'Últimos 7 Días'
      : periodFilter === 'MONTH'
      ? `Mes ${selectedMonth}`
      : 'Histórico Global';

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Contabilidad General & Finanzas • {currentBranch.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Estado de Resultados, Libro Diario & Gastos (OPEX)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Balance contable de Ventas Netas, Costo FEFO, Devoluciones, Compras a Laboratorios y Gastos Operativos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Imprimir Balance</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Gasto Operativo</span>
          </button>
        </div>
      </div>

      {/* BARRA DE PERÍODO Y PESTAÑAS CONTABLES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Sub-pestañas de vistas contables */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('PNL')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'PNL'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Estado de Resultados (P&L)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('JOURNAL')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'JOURNAL'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Libro Diario (Ingresos vs Egresos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('EXPENSES')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'EXPENSES'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Bitácora de Gastos ({filteredExpenses.length})</span>
          </button>
        </div>

        {/* Selector de Período Contable */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'TODAY', label: 'Hoy' },
              { id: 'WEEK', label: '7 Días' },
              { id: 'MONTH', label: 'Por Mes' },
              { id: 'ALL', label: 'Todo' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-white text-emerald-800 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {periodFilter === 'MONTH' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
            />
          )}
        </div>
      </div>

      {/* 4 KPI CARDS PRINCIPALES DEL PERÍODO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ventas Netas del Período */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ventas Netas ({periodLabel})
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {settings.currencySymbol} {financialMetrics.netSales.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">{financialMetrics.salesCount} facturas</span>
            {financialMetrics.totalReturnsAmount > 0 ? (
              <span className="font-bold text-amber-700">
                Dev: -{settings.currencySymbol} {financialMetrics.totalReturnsAmount.toFixed(2)}
              </span>
            ) : (
              <span className="font-bold text-emerald-700">Sin devoluciones</span>
            )}
          </div>
        </div>

        {/* 2. Ganancia Neta Real */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Utilidad Neta ({periodLabel})
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              financialMetrics.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-700'
            }`}
          >
            {settings.currencySymbol} {financialMetrics.netProfit.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-100">
            <span className="text-slate-500">Margen Neto Real:</span>
            <span className="font-extrabold text-emerald-700">
              {financialMetrics.netMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 3. Gastos Operativos Totales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Gastos Operativos ({periodLabel})
            </span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            {settings.currencySymbol} {financialMetrics.totalExpenses.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Comprobantes OPEX:</span>
            <span className="font-bold text-slate-700">{financialMetrics.expensesCount} registros</span>
          </div>
        </div>

        {/* 4. Valorización del Inventario */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Capital en Inventario (Costo)
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {settings.currencySymbol} {inventoryValuation.totalCost.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Venta Proyectada:</span>
            <span className="font-bold text-emerald-700">
              {settings.currencySymbol} {inventoryValuation.totalSaleValue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          VISTA 1: ESTADO DE RESULTADOS CONSOLIDADO (P&L) & DISTRIBUCIÓN OPEX
      ===================================================================== */}
      {activeSubTab === 'PNL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* P&L Completo: Estado de Resultados de la Farmacia */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Estado de Resultados Contable ({periodLabel})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cálculo exacto: Ventas Netas − Costo FEFO − Gastos Operativos
                </p>
              </div>
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> (+) Ventas Brutas Facturadas ({financialMetrics.salesCount}):
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {settings.currencySymbol} {financialMetrics.grossSales.toFixed(2)}
                </span>
              </div>

              {/* Desglose por método de cobro */}
              <div className="grid grid-cols-3 gap-2 pl-3 pb-1 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Efectivo</span>
                  <strong className="font-mono text-slate-700">
                    {settings.currencySymbol} {financialMetrics.cashSales.toFixed(2)}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Tarjeta POS</span>
                  <strong className="font-mono text-blue-700">
                    {settings.currencySymbol} {financialMetrics.cardSales.toFixed(2)}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Transferencia</span>
                  <strong className="font-mono text-purple-700">
                    {settings.currencySymbol} {financialMetrics.transferSales.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 text-amber-800">
                <span className="font-medium flex items-center gap-1.5 pl-3">
                  (-) Devoluciones y Reembolsos ({financialMetrics.returnsCount}):
                </span>
                <span className="font-mono font-bold">
                  -{settings.currencySymbol} {financialMetrics.totalReturnsAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 px-3 bg-slate-100/80 rounded-xl font-bold text-slate-900">
                <span>(=) Ventas Netas Realizadas:</span>
                <span className="font-mono font-black text-sm">
                  {settings.currencySymbol} {financialMetrics.netSales.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-600 border-b border-slate-100 pb-2">
                <span className="font-medium flex items-center gap-1.5 pl-3">
                  (-) Costo de Mercadería Vendida (COGS FEFO):
                </span>
                <span className="font-mono font-bold text-slate-600">
                  -{settings.currencySymbol} {financialMetrics.netCogs.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 bg-emerald-50/60 border border-emerald-100 rounded-xl font-bold">
                <div>
                  <span className="text-slate-800 block">(=) Utilidad Bruta en Ventas:</span>
                  <span className="text-[10px] text-emerald-700">
                    Margen Bruto Comercial: {financialMetrics.grossMarginPercent.toFixed(1)}%
                  </span>
                </div>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {settings.currencySymbol} {financialMetrics.grossProfit.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-rose-700 border-b border-slate-100 pb-2">
                <span className="font-medium flex items-center gap-1.5 pl-3">
                  (-) Gastos Operativos de Sucursal (OPEX):
                </span>
                <span className="font-mono font-bold text-rose-700">
                  -{settings.currencySymbol} {financialMetrics.totalExpenses.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <div>
                  <p className="font-black text-sm">(=) Utilidad Neta del Período</p>
                  <p className="text-[10px] text-emerald-100">
                    Ganancia libre después de reponer costo de medicamentos y pagar gastos
                  </p>
                </div>
                <span className="font-mono font-black text-xl">
                  {settings.currencySymbol} {financialMetrics.netProfit.toFixed(2)}
                </span>
              </div>

              {/* Bloque informativo de Compras de Inventario y Cuentas por Pagar */}
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Movimientos de Capital en Mercadería (Compras a Proveedores)
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Facturas de Compra Pagadas ({financialMetrics.purchasesCount}):</span>
                  <span className="font-mono font-bold text-slate-800">
                    {settings.currencySymbol} {financialMetrics.totalPurchasesPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Cuentas por Pagar a Laboratorios (Crédito):</span>
                  <span className="font-mono font-bold">
                    {settings.currencySymbol} {financialMetrics.totalPurchasesPending.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Gastos por Categoría */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Distribución de Gastos Operativos ({periodLabel})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total egresos OPEX:{' '}
                  <strong>
                    {settings.currencySymbol} {categoryBreakdown.total.toFixed(2)}
                  </strong>
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
                          {settings.currencySymbol} {item.amount.toFixed(2)}
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
      )}

      {/* =====================================================================
          VISTA 2: LIBRO DIARIO CONTABLE CONSOLIDADO (INGRESOS VS EGRESOS)
      ===================================================================== */}
      {activeSubTab === 'JOURNAL' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Libro Diario de Movimientos Contables ({periodLabel})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Consolidado cronológico de todas las entradas (Ventas) y salidas (Gastos OPEX, Compras pagadas y Devoluciones).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar factura, recibo, concepto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'IN', label: 'Solo Ingresos (+)' },
                  { id: 'OUT', label: 'Solo Egresos (-)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setJournalTypeFilter(f.id as any)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      journalTypeFilter === f.id
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

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Referencia</th>
                  <th className="py-3 px-4">Concepto / Detalle Contable</th>
                  <th className="py-3 px-3">Medio de Pago</th>
                  <th className="py-3 px-3">Usuario</th>
                  <th className="py-3 px-4 text-right">Ingreso (+)</th>
                  <th className="py-3 px-4 text-right">Egreso (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No hay asientos contables registrados en este período.
                    </td>
                  </tr>
                ) : (
                  journalEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(item.date).toLocaleString('es-SV', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                            item.category === 'VENTA'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.category === 'GASTO OPEX'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : item.category === 'COMPRA LAB'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.category === 'VENTA' && <ArrowUpRight className="w-3 h-3" />}
                          {item.category === 'GASTO OPEX' && <ArrowDownRight className="w-3 h-3" />}
                          {item.category === 'COMPRA LAB' && <Truck className="w-3 h-3" />}
                          {item.category === 'DEVOLUCIÓN' && <RotateCcw className="w-3 h-3" />}
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{item.reference}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.description}</td>
                      <td className="py-3 px-3 text-slate-600">{item.paymentMethod}</td>
                      <td className="py-3 px-3 text-slate-500">{item.actor}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        {item.type === 'IN' ? `+${settings.currencySymbol} ${item.amount.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                        {item.type === 'OUT' ? `-${settings.currencySymbol} ${item.amount.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 3: BITÁCORA DETALLADA DE GASTOS OPERATIVOS REGISTRADOS
      ===================================================================== */}
      {(activeSubTab === 'EXPENSES' || activeSubTab === 'PNL') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Bitácora Detallada de Gastos Operativos ({periodLabel})
              </h3>
              <p className="text-xs text-slate-500">
                Registro de egresos de caja chica, pago de servicios, planilla y transferencias de la sucursal.
              </p>
            </div>

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

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
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
                      No se encontraron gastos registrados en el período seleccionado.
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
                        <span className="font-semibold">
                          {exp.paymentMethod === 'Cash'
                            ? 'Efectivo'
                            : exp.paymentMethod === 'Transfer'
                            ? 'Transferencia'
                            : 'Tarjeta'}
                        </span>
                        {exp.invoiceReference && (
                          <span className="block font-mono text-[10px] text-slate-400">
                            {exp.invoiceReference}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{exp.createdBy}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-sm">
                        {settings.currencySymbol} {exp.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
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
                    Monto en Córdobas ({settings.currencySymbol}) <span className="text-rose-500">*</span>
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
                  placeholder="ej. Pago de energía eléctrica - Cadena de frío"
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
                    <option value="Cash">Efectivo (Caja / Administración)</option>
                    <option value="Card">Tarjeta Institucional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    N° Factura / Recibo
                  </label>
                  <input
                    type="text"
                    placeholder="ej. REC-9921"
                    value={invoiceReference}
                    onChange={(e) => setInvoiceReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Opción de descontar de la gaveta del turno activo si se paga en efectivo */}
              {paymentMethod === 'Cash' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Vault className="w-4 h-4 text-amber-700" />
                      <span>¿De dónde sale el efectivo de este gasto?</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeductFromDrawer(true)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        deductFromDrawer
                          ? 'bg-white border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-amber-50/50 border-amber-200 text-slate-600'
                      }`}
                    >
                      <div className="text-[11px] font-black">Gaveta de Caja (Turno)</div>
                      <div className="text-[10px] text-slate-500">
                        {currentCashSession
                          ? 'Se rebaja automático del arqueo actual'
                          : 'No hay turno abierto actualmente'}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeductFromDrawer(false)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        !deductFromDrawer
                          ? 'bg-white border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-amber-50/50 border-amber-200 text-slate-600'
                      }`}
                    >
                      <div className="text-[11px] font-black">Fondo Admin Externo</div>
                      <div className="text-[10px] text-slate-500">
                        No altera el efectivo de la cajera
                      </div>
                    </button>
                  </div>
                </div>
              )}

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
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
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
