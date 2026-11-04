'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  DollarSign,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  CreditCard,
  Banknote,
  Smartphone,
  Pill,
  Award,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Sale } from '../../types/pharmacy';

interface MonthlyClosingRecord {
  id: string;
  monthKey: string;
  monthName: string;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  salesCount: number;
  avgTicket: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  closedAt: string;
  closedBy: string;
  notes?: string;
  branchName: string;
}

export const SalesPeriodsView: React.FC = () => {
  const { sales, products, currentBranch, settings, currentUser } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('month');

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  });

  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosingRecord[]>([]);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [printClosingRecord, setPrintClosingRecord] = useState<MonthlyClosingRecord | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('farmacia_monthly_closings');
        if (saved) {
          setMonthlyClosings(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error cargando cierres mensuales:', e);
      }
    }
  }, []);

  const saveClosings = (updated: MonthlyClosingRecord[]) => {
    setMonthlyClosings(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('farmacia_monthly_closings', JSON.stringify(updated));
      } catch (e) {
        console.error('Error guardando cierres:', e);
      }
    }
  };

  const branchSales = useMemo(() => {
    return (sales || []).filter((s) => !s.branchId || s.branchId === currentBranch.id);
  }, [sales, currentBranch.id]);

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${months[mIndex] || month} ${year}`;
  };

  const daySales = useMemo(() => {
    return branchSales.filter((s) => {
      if (!s.createdAt) return false;
      return s.createdAt.split('T')[0] === selectedDate;
    });
  }, [branchSales, selectedDate]);

  const weekData = useMemo(() => {
    const target = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = target.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(target);
    monday.setDate(target.getDate() - distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    const filtered = branchSales.filter((s) => {
      if (!s.createdAt) return false;
      const sDate = s.createdAt.split('T')[0];
      return sDate >= monStr && sDate <= sunStr;
    });

    const daysSummary: { dateStr: string; dayName: string; total: number; count: number }[] = [];
    const dayNames = ['Lunes', 'Martes', 'MiÃ©rcoles', 'Jueves', 'Viernes', 'SÃ¡bado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dSales = filtered.filter((s) => s.createdAt?.startsWith(dStr));
      const dTotal = dSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
      daysSummary.push({
        dateStr: dStr,
        dayName: dayNames[i],
        total: dTotal,
        count: dSales.length,
      });
    }

    return {
      mondayStr: monStr,
      sundayStr: sunStr,
      sales: filtered,
      daysSummary,
    };
  }, [branchSales, selectedDate]);

  const monthSales = useMemo(() => {
    return branchSales.filter((s) => {
      if (!s.createdAt) return false;
      return s.createdAt.startsWith(selectedMonth);
    });
  }, [branchSales, selectedMonth]);

  const currentFilteredSales = activeTab === 'day' ? daySales : activeTab === 'week' ? weekData.sales : monthSales;

  const stats = useMemo(() => {
    const totalAmount = currentFilteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const costAmount = currentFilteredSales.reduce((sum, s) => sum + (s.costAmount || 0), 0);
    const grossProfit = totalAmount - costAmount;
    const profitMargin = totalAmount > 0 ? ((grossProfit / totalAmount) * 100).toFixed(1) : '0';
    const salesCount = currentFilteredSales.length;
    const avgTicket = salesCount > 0 ? totalAmount / salesCount : 0;

    const cashAmount = currentFilteredSales
      .filter((s) => s.paymentMethod === 'Cash')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const cardAmount = currentFilteredSales
      .filter((s) => s.paymentMethod === 'Card')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const transferAmount = currentFilteredSales
      .filter((s) => s.paymentMethod === 'Transfer')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const itemMap = new Map<string, { name: string; quantity: number; total: number }>();
    currentFilteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const existing = itemMap.get(item.productId) || {
          name: item.productName || 'Medicamento',
          quantity: 0,
          total: 0,
        };
        existing.quantity += item.quantity || 0;
        existing.total += item.total || 0;
        itemMap.set(item.productId, existing);
      });
    });

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return {
      totalAmount,
      costAmount,
      grossProfit,
      profitMargin,
      salesCount,
      avgTicket,
      cashAmount,
      cardAmount,
      transferAmount,
      topItems,
    };
  }, [currentFilteredSales]);

  const isCurrentMonthClosed = useMemo(() => {
    return monthlyClosings.some((c) => c.monthKey === selectedMonth);
  }, [monthlyClosings, selectedMonth]);

  const handleExecuteMonthlyClose = () => {
    const record: MonthlyClosingRecord = {
      id: `CIERRE-MES-${selectedMonth}-${Date.now().toString().slice(-4)}`,
      monthKey: selectedMonth,
      monthName: getMonthName(selectedMonth),
      totalSales: stats.totalAmount,
      totalCost: stats.costAmount,
      grossProfit: stats.grossProfit,
      salesCount: stats.salesCount,
      avgTicket: stats.avgTicket,
      cashAmount: stats.cashAmount,
      cardAmount: stats.cardAmount,
      transferAmount: stats.transferAmount,
      closedAt: new Date().toISOString(),
      closedBy: `${currentUser?.firstName || 'Jonathan'} ${currentUser?.lastName || 'Rojas'}`,
      notes: closingNotes.trim() || 'Cierre mensual consolidado de ventas e inventario.',
      branchName: currentBranch.name,
    };

    const filtered = monthlyClosings.filter((c) => c.monthKey !== selectedMonth);
    const updated = [record, ...filtered];
    saveClosings(updated);
    setShowCloseModal(false);
    setClosingNotes('');
    setPrintClosingRecord(record);
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 select-none">
      {/* Encabezado Tecnomax */}
      <div className="bg-[#0B1E2E] text-white px-4 sm:px-6 pt-5 pb-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <BarChart3 className="w-3 h-3 text-emerald-400" />
                <span>AuditorÃ­a & AnÃ¡lisis Financiero</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Cierre y Resumen de Ventas
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Ventas por DÃ­a, Semana y Mes con Cierre Mensual Consolidado â€¢ {currentBranch.name}
              </p>
            </div>

            {/* PestaÃ±as Principales */}
            <div className="inline-flex bg-white/10 p-1 rounded-2xl border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('day')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'day' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Por DÃ­a</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('week')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'week' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Por Semana</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('month')}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'month' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Por Mes & Cierre</span>
              </button>
            </div>
          </div>

          {/* Selector de PerÃ­odo */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            {activeTab === 'day' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Seleccionar DÃ­a:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-xl outline-none shadow-xs text-xs"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-colors"
                >
                  Hoy
                </button>
              </div>
            )}

            {activeTab === 'week' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Semana del:</span>
                <span className="font-mono font-bold bg-white/20 px-2.5 py-1 rounded-lg text-emerald-200">
                  {weekData.mondayStr} al {weekData.sundayStr}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-xl outline-none shadow-xs text-xs"
                />
              </div>
            )}

            {activeTab === 'month' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Seleccionar Mes:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-xl outline-none shadow-xs text-xs"
                />
                <span className="font-black text-emerald-300 text-sm hidden sm:inline">
                  {getMonthName(selectedMonth)}
                </span>
              </div>
            )}

            {activeTab === 'month' && (
              <div className="flex items-center gap-2">
                {isCurrentMonthClosed ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mes Cerrado Oficialmente</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Realizar Cierre de Mes</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir Resumen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido KPI */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <span className="text-xs text-slate-500 font-bold">Total Facturado</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 tracking-tight">
              {settings.currencySymbol} {stats.totalAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {stats.salesCount} {stats.salesCount === 1 ? 'venta registrada' : 'ventas registradas'}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <span className="text-xs text-slate-500 font-bold">Costo MercaderÃ­a (FEFO)</span>
            <div className="text-xl sm:text-2xl font-black text-slate-700 font-mono mt-1 tracking-tight">
              {settings.currencySymbol} {stats.costAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Costo de adquisiciÃ³n de lotes
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 border-2 border-emerald-300/80 shadow-xs">
            <span className="text-xs text-emerald-900 font-black">Ganancia Neta Bruta</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1 tracking-tight">
              {settings.currencySymbol} {stats.grossProfit.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-800 font-bold mt-1">
              Margen bruto: {stats.profitMargin}%
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <span className="text-xs text-slate-500 font-bold">Ticket Promedio</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 tracking-tight">
              {settings.currencySymbol} {stats.avgTicket.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Promedio por factura emitida
            </div>
          </div>
        </div>

        {/* Desglose de MÃ©todos de Pago */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Desglose por MÃ©todo de Pago ({activeTab === 'day' ? 'DÃ­a' : activeTab === 'week' ? 'Semana' : 'Mes'})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Efectivo (Caja)</div>
                  <div className="text-sm font-black text-emerald-900 font-mono">
                    {settings.currencySymbol} {stats.cashAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">
                {stats.totalAmount > 0 ? ((stats.cashAmount / stats.totalAmount) * 100).toFixed(0) : 0}%
              </span>
            </div>

            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Tarjeta POS / POS MÃ³vil</div>
                  <div className="text-sm font-black text-blue-900 font-mono">
                    {settings.currencySymbol} {stats.cardAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-700">
                {stats.totalAmount > 0 ? ((stats.cardAmount / stats.totalAmount) * 100).toFixed(0) : 0}%
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600 text-white rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Transferencias (Bancos)</div>
                  <div className="text-sm font-black text-purple-900 font-mono">
                    {settings.currencySymbol} {stats.transferAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-700">
                {stats.totalAmount > 0 ? ((stats.transferAmount / stats.totalAmount) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* GrÃ¡fico Semanal si estÃ¡ en pestaÃ±a semana */}
        {activeTab === 'week' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>Ventas DÃ­a por DÃ­a de la Semana</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {weekData.daysSummary.map((d) => (
                <div
                  key={d.dateStr}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    d.dateStr === selectedDate
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                  onClick={() => setSelectedDate(d.dateStr)}
                >
                  <div className="text-[11px] font-extrabold text-slate-600">{d.dayName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{d.dateStr.slice(5)}</div>
                  <div className="text-sm font-black text-emerald-800 font-mono mt-1.5">
                    {settings.currencySymbol} {d.total.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {d.count} {d.count === 1 ? 'venta' : 'ventas'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Medicamentos MÃ¡s Vendidos */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Medicamentos MÃ¡s Vendidos del PerÃ­odo</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              Ranking por ingreso total
            </span>
          </div>

          {stats.topItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay productos vendidos en este perÃ­odo seleccionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="p-3">#</th>
                    <th className="p-3">Medicamento</th>
                    <th className="p-3 text-center">Unidades Vendidas</th>
                    <th className="p-3 text-right">Total Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.topItems.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/40">
                      <td className="p-3 font-bold text-slate-400">
                        {index + 1 === 1 ? 'ðŸ¥‡' : index + 1 === 2 ? 'ðŸ¥ˆ' : index + 1 === 3 ? 'ðŸ¥‰' : `${index + 1}`}
                      </td>
                      <td className="p-3 font-extrabold text-slate-800 flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 font-mono">
                        {item.quantity} unds
                      </td>
                      <td className="p-3 text-right font-black text-emerald-800 font-mono">
                        {settings.currencySymbol} {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial de Cierres Mensuales Guardados */}
        {activeTab === 'month' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Historial de Cierres Mensuales Guardados</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {monthlyClosings.length} {monthlyClosings.length === 1 ? 'cierre registrado' : 'cierres registrados'}
              </span>
            </div>

            {monthlyClosings.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-1.5 opacity-60" />
                <p className="font-bold text-xs text-slate-700">AÃºn no hay cierres mensuales registrados</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cuando finalice el mes, haz clic en "Realizar Cierre de Mes" para generar el comprobante oficial.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyClosings.map((cierre) => (
                  <div
                    key={cierre.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{cierre.monthName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                          Cierre Oficial
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cerrado el {new Date(cierre.closedAt).toLocaleString('es-SV')} por <strong>{cierre.closedBy}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Total Ventas</div>
                        <div className="text-sm font-black text-emerald-900 font-mono">
                          {settings.currencySymbol} {cierre.totalSales.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Ganancia Neta</div>
                        <div className="text-sm font-black text-emerald-700 font-mono">
                          {settings.currencySymbol} {cierre.grossProfit.toFixed(2)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPrintClosingRecord(cierre)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                        title="Ver Comprobante de Cierre"
                      >
                        <Printer className="w-4 h-4 text-emerald-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cierre Mensual */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Cierre Oficial de Ventas: {getMonthName(selectedMonth)}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  GeneraciÃ³n de Balance Mensual Consolidado
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 font-medium text-slate-700">
              <div className="flex justify-between">
                <span>Ventas Totales del Mes:</span>
                <strong className="font-mono text-slate-900 text-sm">
                  {settings.currencySymbol} {stats.totalAmount.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Costo Total MercaderÃ­a:</span>
                <strong className="font-mono text-slate-600">
                  {settings.currencySymbol} {stats.costAmount.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-800">
                <span className="font-bold">Ganancia Neta Calculada:</span>
                <strong className="font-mono text-sm font-black">
                  {settings.currencySymbol} {stats.grossProfit.toFixed(2)} ({stats.profitMargin}%)
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Facturas emitidas:</span>
                <strong className="font-mono">{stats.salesCount} ventas</strong>
              </div>
              <div className="flex justify-between">
                <span>Supervisor Responsable:</span>
                <strong className="text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones o Notas de Cierre (Opcional):
              </label>
              <textarea
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="Ejemplo: Cierre mensual verificado sin discrepancias en caja..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white resize-none h-20 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecuteMonthlyClose}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Cierre de Mes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket / Comprobante de Cierre Mensual Imprimible */}
      {printClosingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div id="receipt-print-area" className="p-4 bg-slate-50 rounded-2xl border border-slate-300 text-slate-800 text-xs font-mono space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h4 className="font-black text-sm uppercase">FARMACIA ESPÃRITU SANTO</h4>
                <p className="text-[10px]">COMPROBANTE OFICIAL DE CIERRE MENSUAL</p>
                <p className="text-[10px]">{printClosingRecord.branchName}</p>
                <p className="text-[9px] text-slate-500 mt-1">ID: {printClosingRecord.id}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>PerÃ­odo:</span>
                  <span className="font-bold">{printClosingRecord.monthName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha Cierre:</span>
                  <span>{new Date(printClosingRecord.closedAt).toLocaleString('es-SV')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Responsable:</span>
                  <span className="font-bold">{printClosingRecord.closedBy}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1.5 text-xs">
                <div className="flex justify-between font-black text-sm">
                  <span>VENTAS TOTALES:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.totalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo FEFO:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-800">
                  <span>GANANCIA NETA:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.grossProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Transacciones:</span>
                  <span>{printClosingRecord.salesCount} ventas</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Ticket Promedio:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.avgTicket.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="font-bold">DESGLOSE DE CAJA:</div>
                <div className="flex justify-between">
                  <span>â€¢ Efectivo:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.cashAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>â€¢ Tarjeta:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.cardAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>â€¢ Transferencia:</span>
                  <span>{settings.currencySymbol} {printClosingRecord.transferAmount.toFixed(2)}</span>
                </div>
              </div>

              {printClosingRecord.notes && (
                <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                  <em>"{printClosingRecord.notes}"</em>
                </div>
              )}

              <div className="text-center pt-6 text-[9px] text-slate-400 border-t border-dashed border-slate-300">
                <div className="w-32 border-b border-slate-400 mx-auto mb-1" />
                <p>Firma Supervisor Responsable</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintClosingRecord(null)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
