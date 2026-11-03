'use client';

import React, { useState } from 'react';
import {
  Vault,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  History,
  DollarSign,
  X,
  Lock,
  ArrowDownRight,
  Sparkles,
  Printer,
  Receipt,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { CashSession } from '../../types/pharmacy';

export const CashView: React.FC = () => {
  const {
    currentCashSession,
    cashSessions,
    openCashSession,
    closeCashSession,
    addCashMovement,
    currentBranch,
    currentUser,
    settings,
  } = usePharmacy();

  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [movementModal, setMovementModal] = useState(false);
  const [corteModalSession, setCorteModalSession] = useState<CashSession | null>(null);

  // Base fija requerida de C$ 510.00
  const [openingBalance, setOpeningBalance] = useState('510.00');
  const [retainedBase, setRetainedBase] = useState('510.00');
  const [actualBalance, setActualBalance] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('OUT');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(parseFloat(openingBalance) || 510, notes);
    setOpenModal(false);
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(actualBalance) || 0;
    const base = parseFloat(retainedBase) || 510;
    closeCashSession(actual, notes, base);
    setCloseModal(false);

    // Auto-abrir comprobante de corte recién cerrado
    if (currentCashSession) {
      setCorteModalSession({
        ...currentCashSession,
        closedAt: new Date().toISOString(),
        actualBalance: actual,
        difference: actual - currentCashSession.expectedBalance,
        retainedBase: base,
        withdrawnSales: Math.max(0, actual - base),
        status: 'Closed',
      });
    }
  };

  const handleMovement = (e: React.FormEvent) => {
    e.preventDefault();
    addCashMovement(movementType, parseFloat(movementAmount) || 0, movementReason);
    setMovementModal(false);
    setMovementAmount('');
    setMovementReason('');
  };

  const branchSessions = cashSessions.filter((cs) => cs.branchId === currentBranch.id);

  // Cálculos en tiempo real del modal de cierre
  const countedNum = parseFloat(actualBalance || '0');
  const baseNum = parseFloat(retainedBase || '510.00');
  const withdrawnSalesAmount = Math.max(0, countedNum - baseNum);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Vault className="w-5 h-5 text-emerald-600" />
            <span>Control y Arqueo de Cajas</span>
          </h1>
          <p className="text-xs text-slate-500">
            Aperturas con base de C$ 510.00, ventas en efectivo y liquidación automática de corte • {currentBranch.name}
          </p>
        </div>

        <div className="flex gap-2">
          {!currentCashSession ? (
            <button
              onClick={() => {
                setOpeningBalance('510.00');
                setOpenModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95"
            >
              <Vault className="w-4 h-4" />
              <span>Abrir Turno de Caja (Base C$ 510)</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setMovementModal(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Ingreso / Retiro</span>
              </button>
              <button
                onClick={() => {
                  setActualBalance((currentCashSession.expectedBalance || 0).toFixed(2));
                  setRetainedBase('510.00');
                  setCloseModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-red-200 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cerrar Turno & Liquidar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tarjeta de Estado Activo */}
      {currentCashSession ? (
        <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Vault className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{currentCashSession.cashRegisterName}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    TURNO ACTIVO
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Abierto por <strong className="text-slate-700">{currentCashSession.userName}</strong> a las{' '}
                  {new Date(currentCashSession.openedAt).toLocaleTimeString('es-SV')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Base Fija</span>
                <span className="font-mono text-sm font-black text-slate-800">
                  {settings.currencySymbol} {currentCashSession.openingBalance.toFixed(2)}
                </span>
              </div>

              <div className="text-right bg-emerald-50/60 border border-emerald-200 rounded-2xl px-4 py-2">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total en Gaveta</span>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  {settings.currencySymbol} {(currentCashSession.expectedBalance || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Caja */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Base Inicial</span>
              </span>
              <div className="text-sm font-black text-slate-800 font-mono mt-0.5">
                {settings.currencySymbol} {currentCashSession.openingBalance.toFixed(2)}
              </div>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-800 uppercase font-bold">Ventas Efectivo</span>
              <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                +{settings.currencySymbol} {currentCashSession.cashSales.toFixed(2)}
              </div>
            </div>
            <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] text-blue-800 uppercase font-bold">Ventas Tarjeta</span>
              <div className="text-sm font-black text-blue-700 font-mono mt-0.5">
                {settings.currencySymbol} {currentCashSession.cardSales.toFixed(2)}
              </div>
            </div>
            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-center">
              <span className="text-[10px] text-purple-800 uppercase font-bold">Transferencias</span>
              <div className="text-sm font-black text-purple-700 font-mono mt-0.5">
                {settings.currencySymbol} {currentCashSession.transferSales.toFixed(2)}
              </div>
            </div>
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] text-amber-800 uppercase font-bold flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Base a Dejar</span>
              </span>
              <div className="text-sm font-black text-amber-900 font-mono mt-0.5">
                {settings.currencySymbol} 510.00
              </div>
            </div>
            <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200 text-center">
              <span className="text-[10px] text-teal-800 uppercase font-bold flex items-center justify-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-teal-600" />
                <span>Ventas a Sacar</span>
              </span>
              <div className="text-sm font-black text-teal-900 font-mono mt-0.5">
                {settings.currencySymbol} {Math.max(0, (currentCashSession.expectedBalance || 0) - 510).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Vault className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No hay ningún turno de caja abierto</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Abre el turno con la base oficial de C$ 510.00 para empezar a cobrar ventas en efectivo en el Punto de Venta.
          </p>
          <button
            onClick={() => {
              setOpeningBalance('510.00');
              setOpenModal(true);
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer"
          >
            <Vault className="w-4 h-4" />
            <span>Abrir Turno de Caja (Base C$ 510.00)</span>
          </button>
        </div>
      )}

      {/* Historial de Turnos de Caja */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <span>Historial de Sesiones y Cierres de Turno</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3">Apertura</th>
                <th className="p-3">Cierre</th>
                <th className="p-3">Cajero</th>
                <th className="p-3 text-right">Saldo Inicial</th>
                <th className="p-3 text-right">Ventas Efectivo</th>
                <th className="p-3 text-right">Total Contado</th>
                <th className="p-3 text-right bg-amber-50/50 text-amber-900">Base Dejada</th>
                <th className="p-3 text-right bg-teal-50/50 text-teal-900">Ventas Sacadas</th>
                <th className="p-3 text-center">Diferencia</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchSessions.map((cs) => {
                const baseVal = cs.retainedBase !== undefined ? cs.retainedBase : 510;
                const salesWithdrawn = cs.withdrawnSales !== undefined 
                  ? cs.withdrawnSales 
                  : (cs.actualBalance !== undefined ? Math.max(0, cs.actualBalance - baseVal) : 0);

                return (
                  <tr key={cs.id} className="hover:bg-emerald-50/40">
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {new Date(cs.openedAt).toLocaleString('es-SV')}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {cs.closedAt ? new Date(cs.closedAt).toLocaleString('es-SV') : 'En curso...'}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{cs.userName}</td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {settings.currencySymbol} {cs.openingBalance.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                      {settings.currencySymbol} {cs.cashSales.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-900 font-bold">
                      {cs.actualBalance !== undefined ? `${settings.currencySymbol} ${(cs.actualBalance || 0).toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-amber-800 bg-amber-50/30">
                      {cs.closedAt ? `${settings.currencySymbol} ${baseVal.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-teal-700 bg-teal-50/30">
                      {cs.closedAt ? `${settings.currencySymbol} ${salesWithdrawn.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {cs.difference !== undefined ? (
                        <span className={cs.difference === 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {settings.currencySymbol} {cs.difference.toFixed(2)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          cs.status === 'Open'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {cs.status === 'Open' ? 'ABIERTO' : 'CERRADO'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {cs.closedAt && (
                        <button
                          onClick={() => setCorteModalSession(cs)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Ver Comprobante de Corte"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apertura */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Vault className="w-4 h-4 text-emerald-600" />
              <span>Apertura de Turno de Caja</span>
            </div>

            <form onSubmit={handleOpen} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Saldo Base Inicial en Efectivo ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xl font-black text-emerald-700"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Base oficial fija predeterminada: C$ 510.00</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Notas de Apertura (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Billetes de 100, 50 y monedas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-black shadow-md shadow-emerald-200 cursor-pointer"
                >
                  Confirmar Apertura (C$ 510)
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cierre / Arqueo con Regla de Base C$ 510 y Retiro de Ventas */}
      {closeModal && currentCashSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Vault className="w-4 h-4 text-emerald-600" />
                <span>Cierre de Caja y Retiro de Ventas</span>
              </h3>
              <button onClick={() => setCloseModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumen de Movimientos del Turno */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Saldo Base Inicial:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {settings.currencySymbol} {currentCashSession.openingBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ventas Totales en Efectivo:</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{settings.currencySymbol} {currentCashSession.cashSales.toFixed(2)}
                </span>
              </div>
              {currentCashSession.cashIn > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Ingresos Extraordinarios:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{settings.currencySymbol} {currentCashSession.cashIn.toFixed(2)}
                  </span>
                </div>
              )}
              {currentCashSession.cashOut > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Gastos / Retiros Parciales:</span>
                  <span className="font-mono font-bold text-red-600">
                    -{settings.currencySymbol} {currentCashSession.cashOut.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                <span>Total Físico Esperado en Gaveta:</span>
                <span className="font-mono text-emerald-700">
                  {settings.currencySymbol} {(currentCashSession.expectedBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleClose} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-black block mb-1">
                  Monto Total Físico Contado en Gaveta ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl p-3 font-mono text-2xl font-black text-slate-900 focus:outline-none"
                />
              </div>

              {/* Diferencia si la hay */}
              {actualBalance && (
                <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-bold">
                  <span className="text-slate-600">Diferencia de Arqueo:</span>
                  <span
                    className={`font-mono text-sm ${
                      Math.abs(countedNum - currentCashSession.expectedBalance) < 0.01
                        ? 'text-emerald-700 font-black'
                        : 'text-red-600 font-black'
                    }`}
                  >
                    {Math.abs(countedNum - currentCashSession.expectedBalance) < 0.01
                      ? '✓ Cuadre Exacto (C$ 0.00)'
                      : `${settings.currencySymbol} ${(countedNum - currentCashSession.expectedBalance).toFixed(2)}`}
                  </span>
                </div>
              )}

              {/* TARJETA DESTACADA: REGLA DE BASE C$ 510 Y RETIRO DE VENTAS */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>Fondo Base que Queda en Gaveta:</span>
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                    {settings.currencySymbol} {baseNum.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-emerald-200">
                  <span className="font-black text-teal-950 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-teal-700" />
                    <span>Ventas a Sacar / Retirar de Caja:</span>
                  </span>
                  <span className="font-mono text-base font-black text-teal-700 bg-teal-100/80 px-2.5 py-0.5 rounded-lg border border-teal-300">
                    {settings.currencySymbol} {withdrawnSalesAmount.toFixed(2)}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-900 leading-tight pt-1">
                  ✓ Se dejan <strong>{settings.currencySymbol} {baseNum.toFixed(2)}</strong> fijos para cambio del siguiente turno.
                  <br />
                  ✓ Se extraen <strong>{settings.currencySymbol} {withdrawnSalesAmount.toFixed(2)}</strong> recaudados para entrega/depósito.
                </p>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Observaciones / Justificación de Cierre</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Cierre conforme de turno de tarde..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Cerrar: Dejar C$ 510 y Sacar C$ {withdrawnSalesAmount.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCloseModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimiento Manual */}
      {movementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900">Movimiento Extraordinario de Caja</h3>
            <form onSubmit={handleMovement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`py-2 rounded-xl font-bold border ${
                    movementType === 'OUT'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Retiro / Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`py-2 rounded-xl font-bold border ${
                    movementType === 'IN'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Ingreso Extra
                </button>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Monto ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Motivo / Justificación *</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ej: Pago de mensajería, cambio de billete..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold"
                >
                  Registrar Movimiento
                </button>
                <button
                  type="button"
                  onClick={() => setMovementModal(false)}
                  className="px-4 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TICKET / COMPROBANTE DE CORTE DE CAJA */}
      {corteModalSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-800 font-mono text-xs">
            <div className="text-center border-b border-slate-200 pb-3">
              <h2 className="font-black text-sm uppercase text-slate-900">Farmacia Espíritu Santo</h2>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Comprobante Oficial de Arqueo y Cierre</p>
              <div className="text-[10px] text-slate-400 mt-1">
                {corteModalSession.closedAt ? new Date(corteModalSession.closedAt).toLocaleString('es-SV') : ''}
              </div>
            </div>

            <div className="space-y-1.5 py-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Cajero:</span>
                <span className="font-bold text-slate-900">{corteModalSession.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sucursal:</span>
                <span className="font-bold text-slate-900">{currentBranch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fondo Base Inicial:</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol} {corteModalSession.openingBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Ventas en Efectivo:</span>
                <span className="font-black">+{settings.currencySymbol} {corteModalSession.cashSales.toFixed(2)}</span>
              </div>
              {corteModalSession.cardSales > 0 && (
                <div className="flex justify-between text-blue-700">
                  <span>Ventas Tarjeta:</span>
                  <span>{settings.currencySymbol} {corteModalSession.cardSales.toFixed(2)}</span>
                </div>
              )}
              {corteModalSession.transferSales > 0 && (
                <div className="flex justify-between text-purple-700">
                  <span>Ventas Transferencia:</span>
                  <span>{settings.currencySymbol} {corteModalSession.transferSales.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1 font-black text-slate-900">
                <span>Total Contado en Gaveta:</span>
                <span>{settings.currencySymbol} {(corteModalSession.actualBalance || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Recuadro de Liquidación C$ 510 y Ventas */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between font-black text-emerald-950">
                <span>🔒 Base Fija que Queda en Gaveta:</span>
                <span>{settings.currencySymbol} {(corteModalSession.retainedBase || 510).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-teal-800 pt-1 border-t border-emerald-200">
                <span>💰 Total Retirado de Ventas:</span>
                <span>{settings.currencySymbol} {(corteModalSession.withdrawnSales || Math.max(0, (corteModalSession.actualBalance || 0) - 510)).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setCorteModalSession(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
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
