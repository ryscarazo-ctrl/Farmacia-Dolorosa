'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Plus,
  Search,
  Filter,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Receipt,
  FileText,
  ShieldCheck,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { BankMovementType } from '../../types/pharmacy';

export const BankReconciliationView: React.FC = () => {
  const {
    bankAccounts,
    bankStatements,
    sales,
    purchases,
    operationalExpenses,
    currentBranch,
    currentUser,
    matchBankTransaction,
    unmatchBankTransaction,
    autoReconcileBank,
    addBankStatementItem,
  } = usePharmacy();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    bankAccounts[0]?.id || 'bacc-01'
  );
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'RECONCILED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoMessage, setAutoMessage] = useState<string | null>(null);

  // Modal para agregar línea al extracto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<BankMovementType>('BANK_FEE');
  const [modalConcept, setModalConcept] = useState('');
  const [modalReference, setModalReference] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalIsCredit, setModalIsCredit] = useState(false);
  const [modalFee, setModalFee] = useState('');

  // Cuenta activa
  const activeAccount = bankAccounts.find((a) => a.id === selectedAccountId) || bankAccounts[0];

  // Movimientos bancarios de la cuenta
  const accountStatements = useMemo(() => {
    return bankStatements.filter((stmt) => stmt.bankAccountId === selectedAccountId);
  }, [bankStatements, selectedAccountId]);

  // Movimientos del sistema de la farmacia vinculados a banco
  const systemTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'SALE_CARD' | 'SALE_TRANSFER' | 'PURCHASE_PAY' | 'EXPENSE_PAY';
      date: string;
      concept: string;
      reference: string;
      amount: number;
      isReconciled: boolean;
      matchedStatementId?: string;
    }> = [];

    // Ventas con tarjeta o transferencia
    sales.forEach((s) => {
      if (s.branchId === currentBranch.id && s.status === 'Completed') {
        if (s.paymentMethod === 'Card') {
          const matchedStmt = accountStatements.find((stmt) => stmt.matchedSystemId === s.id);
          list.push({
            id: s.id,
            type: 'SALE_CARD',
            date: s.createdAt.slice(0, 10),
            concept: `Cobro con Tarjeta POS (Venta ${s.invoiceNumber})`,
            reference: s.invoiceNumber,
            amount: s.totalAmount,
            isReconciled: !!matchedStmt,
            matchedStatementId: matchedStmt?.id,
          });
        } else if (s.paymentMethod === 'Transfer') {
          const matchedStmt = accountStatements.find((stmt) => stmt.matchedSystemId === s.id);
          list.push({
            id: s.id,
            type: 'SALE_TRANSFER',
            date: s.createdAt.slice(0, 10),
            concept: `Transfer365 Cliente (${s.customerName || 'Farmacia'})`,
            reference: s.invoiceNumber,
            amount: s.totalAmount,
            isReconciled: !!matchedStmt,
            matchedStatementId: matchedStmt?.id,
          });
        }
      }
    });

    // Pagos a proveedores por transferencia
    purchases.forEach((p) => {
      if (p.branchId === currentBranch.id && p.paymentStatus === 'Paid') {
        const matchedStmt = accountStatements.find((stmt) => stmt.matchedSystemId === p.id);
        list.push({
          id: p.id,
          type: 'PURCHASE_PAY',
          date: p.orderDate,
          concept: `Pago Proveedor ${p.supplierName} (${p.invoiceNumber})`,
          reference: p.invoiceNumber,
          amount: p.totalAmount,
          isReconciled: !!matchedStmt,
          matchedStatementId: matchedStmt?.id,
        });
      }
    });

    // Gastos operativos pagados por transferencia
    operationalExpenses.forEach((e) => {
      if (e.branchId === currentBranch.id && e.paymentMethod === 'Transfer') {
        const matchedStmt = accountStatements.find((stmt) => stmt.matchedSystemId === e.id);
        list.push({
          id: e.id,
          type: 'EXPENSE_PAY',
          date: e.expenseDate.slice(0, 10),
          concept: `Gasto Operativo: ${e.description}`,
          reference: e.invoiceReference || e.expenseNumber,
          amount: e.amount,
          isReconciled: !!matchedStmt,
          matchedStatementId: matchedStmt?.id,
        });
      }
    });

    return list;
  }, [sales, purchases, operationalExpenses, accountStatements, currentBranch.id]);

  // Cálculos de Conciliación
  const reconciliationData = useMemo(() => {
    // Saldo según Extracto Bancario
    const bankBalance = activeAccount?.currentBalance || 0;

    // Total de cargos y abonos conciliados
    const reconciledItems = accountStatements.filter((s) => s.isReconciled);
    const pendingItems = accountStatements.filter((s) => !s.isReconciled);

    const totalBankFees = accountStatements.reduce((sum, s) => sum + (s.feeDeducted || 0), 0);

    // Partidas en tránsito (del banco sin conciliar)
    const pendingCredits = pendingItems.reduce((sum, s) => sum + s.credit, 0);
    const pendingDebits = pendingItems.reduce((sum, s) => sum + s.debit, 0);

    // Saldo en libros teórico
    const bookBalance = bankBalance - pendingCredits + pendingDebits;

    const discrepancy = Math.abs(pendingCredits - pendingDebits);

    return {
      bankBalance,
      bookBalance,
      reconciledCount: reconciledItems.length,
      pendingCount: pendingItems.length,
      totalBankFees,
      pendingCredits,
      pendingDebits,
      discrepancy,
      isFullyBalanced: pendingItems.length === 0,
    };
  }, [activeAccount, accountStatements]);

  // Filtrado de extractos
  const filteredStatements = useMemo(() => {
    return accountStatements.filter((stmt) => {
      if (filterStatus === 'RECONCILED' && !stmt.isReconciled) return false;
      if (filterStatus === 'PENDING' && stmt.isReconciled) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mConcept = stmt.concept.toLowerCase().includes(q);
        const mRef = stmt.reference.toLowerCase().includes(q);
        if (!mConcept && !mRef) return false;
      }
      return true;
    });
  }, [accountStatements, filterStatus, searchQuery]);

  const handleAutoReconcile = () => {
    const res = autoReconcileBank(selectedAccountId);
    setAutoMessage(res.message);
    setTimeout(() => setAutoMessage(null), 5000);
  };

  const handleCreateStatementItem = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(modalAmount) || 0;
    if (val <= 0) {
      alert('Ingrese un monto válido.');
      return;
    }

    const feeVal = parseFloat(modalFee) || 0;
    const debit = modalIsCredit ? 0 : val;
    const credit = modalIsCredit ? val : 0;
    const prevBal = activeAccount?.currentBalance || 2500;
    const balanceAfter = modalIsCredit ? prevBal + credit - feeVal : prevBal - debit;

    addBankStatementItem({
      bankAccountId: selectedAccountId,
      date: new Date().toISOString().slice(0, 10),
      concept: modalConcept.trim().toUpperCase(),
      reference: modalReference.trim().toUpperCase() || `MOV-${Date.now().toString().slice(-5)}`,
      movementType: modalType,
      debit,
      credit,
      balanceAfter,
      feeDeducted: feeVal > 0 ? feeVal : undefined,
    });

    setModalConcept('');
    setModalReference('');
    setModalAmount('');
    setModalFee('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Auditoría de Fondos & Cuentas Bancarias • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Conciliación Bancaria & Cobros con Tarjeta (POS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cruce entre ventas POS, transferencias y pagos a laboratorios vs extractos bancarios oficiales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoReconcile}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Auto-Conciliar Inteligente</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Registrar Mov. Bancario</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Acta Contable</span>
          </button>
        </div>
      </div>

      {/* Selector de Cuentas Bancarias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">
          Cuenta a Conciliar:
        </span>
        {bankAccounts.map((acc) => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedAccountId === acc.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{acc.bankName}</span>
            <span className="font-mono text-[11px] opacity-80">({acc.accountNumber})</span>
          </button>
        ))}
      </div>

      {/* Alerta de Auto-Conciliación */}
      {autoMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{autoMessage}</span>
          </div>
          <button onClick={() => setAutoMessage(null)} className="text-white font-bold">✕</button>
        </div>
      )}

      {/* 5 KPI CARDS DE CONCILIACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Saldo en Extracto Bancario */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-4 shadow-sm space-y-1 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Saldo en Banco (Extracto)
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ${reconciliationData.bankBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            {activeAccount?.bankName}
          </div>
        </div>

        {/* 2. Saldo en Libros Farmacia */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Saldo en Libros (Sistema)
          </div>
          <div className="text-2xl font-black font-mono text-slate-800">
            ${reconciliationData.bookBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Ajustado con partidas en tránsito
          </div>
        </div>

        {/* 3. Partidas Conciliadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Partidas Conciliadas
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {reconciliationData.reconciledCount}
          </div>
          <div className="text-[10px] text-slate-500">
            {reconciliationData.pendingCount} pendientes de cuadre
          </div>
        </div>

        {/* 4. Comisiones Retenidas POS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Comisiones POS Retenidas
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            ${reconciliationData.totalBankFees.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Tasa adquirente ~3.0%
          </div>
        </div>

        {/* 5. Estado de Cuadre / Discrepancia */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Estado de Cuadre
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {reconciliationData.pendingCount === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-lg text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Cuadrado 100%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> {reconciliationData.pendingCount} En Tránsito
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500">
            Diferencia: ${reconciliationData.discrepancy.toFixed(2)}
          </div>
        </div>
      </div>

      {/* SECCIÓN SPLIT-VIEW: SISTEMA DE FARMACIA VS EXTRACTO BANCARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Movimientos Registrados en Farmacia */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Movimientos en Sistema de Farmacia
              </h3>
              <p className="text-[10px] text-slate-400">
                Ventas con tarjeta, transferencias y pagos a laboratorios
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {systemTransactions.length} registros
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {systemTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  tx.isReconciled
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{tx.concept}</span>
                      {tx.isReconciled ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          ✓ Conciliado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fecha: {tx.date} • Ref: <span className="font-mono">{tx.reference}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-slate-900">
                      ${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Extracto del Banco con Botones de Cuadre */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Líneas del Extracto Bancario ({activeAccount?.bankName})
              </h3>
              <p className="text-[10px] text-slate-400">
                Créditos (+), débitos (-) y liquidaciones netas de tarjeta
              </p>
            </div>

            {/* Filtros de Estado */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'PENDING', label: 'Pendientes' },
                { id: 'RECONCILED', label: 'Conciliados' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    filterStatus === f.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredStatements.map((stmt) => (
              <div
                key={stmt.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  stmt.isReconciled
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{stmt.concept}</span>
                      {stmt.isReconciled ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600" /> CONCILIADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" /> NO CONCILIADO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Fecha: {stmt.date} • Ref: <span className="font-mono font-bold text-slate-700">{stmt.reference}</span>
                      {stmt.feeDeducted && (
                        <span className="ml-2 text-amber-700 font-semibold">
                          (Comisión POS: -${stmt.feeDeducted.toFixed(2)})
                        </span>
                      )}
                    </p>
                    {stmt.notes && (
                      <p className="text-[10px] text-slate-400 italic">{stmt.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      {stmt.credit > 0 ? (
                        <span className="font-mono font-black text-emerald-700 text-sm">
                          +${stmt.credit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-mono font-black text-rose-700 text-sm">
                          -${stmt.debit.toFixed(2)}
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Saldo: ${stmt.balanceAfter.toFixed(2)}
                      </span>
                    </div>

                    {/* Botón de Conciliación Manual */}
                    {stmt.isReconciled ? (
                      <button
                        onClick={() => unmatchBankTransaction(stmt.id)}
                        className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg text-[11px] font-bold transition-all"
                        title="Deshacer conciliación"
                      >
                        Desconciliar
                      </button>
                    ) : (
                      <button
                        onClick={() => matchBankTransaction(stmt.id, 'MANUAL_MATCH')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs"
                      >
                        ✓ Conciliar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL PARA REGISTRAR NUEVO MOVIMIENTO DE EXTRACTO BANCARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-widest">
                  EXTRACTO BANCARIO
                </span>
                <h3 className="text-base font-black">Registrar Línea de Extracto</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStatementItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Movimiento</label>
                <select
                  value={modalType}
                  onChange={(e) => {
                    const t = e.target.value as BankMovementType;
                    setModalType(t);
                    setModalIsCredit(t === 'CARD_SETTLEMENT' || t === 'TRANSFER_IN' || t === 'CASH_DEPOSIT');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="CARD_SETTLEMENT">💳 Liquidación Lote Tarjetas POS (Abono +)</option>
                  <option value="TRANSFER_IN">📲 Transfer365 Recibida (Abono +)</option>
                  <option value="CASH_DEPOSIT">💵 Depósito Efectivo de Caja (Abono +)</option>
                  <option value="BANK_FEE">🏦 Comisión / Cargo Bancario (Cargo -)</option>
                  <option value="SUPPLIER_PAYMENT">🏢 Pago Transferencia Proveedor (Cargo -)</option>
                  <option value="EXPENSE_PAYMENT">⚡ Pago Gasto Operativo (Cargo -)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Concepto en el Extracto</label>
                <input
                  type="text"
                  placeholder="ej. LIQ. POS LOTE #8825"
                  value={modalConcept}
                  onChange={(e) => setModalConcept(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° de Referencia</label>
                  <input
                    type="text"
                    placeholder="ej. REF-9921"
                    value={modalReference}
                    onChange={(e) => setModalReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {modalType === 'CARD_SETTLEMENT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Comisión Retenida por el Banco ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="ej. 3.50"
                    value={modalFee}
                    onChange={(e) => setModalFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-amber-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  Guardar en Extracto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
