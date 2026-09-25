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
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const CashView: React.FC = () => {
  const {
    currentCashSession,
    cashSessions,
    openCashSession,
    closeCashSession,
    addCashMovement,
    currentBranch,
    settings,
  } = usePharmacy();

  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [movementModal, setMovementModal] = useState(false);

  const [openingBalance, setOpeningBalance] = useState('500.00');
  const [actualBalance, setActualBalance] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('OUT');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(parseFloat(openingBalance) || 0, notes);
    setOpenModal(false);
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashSession(parseFloat(actualBalance) || 0, notes);
    setCloseModal(false);
  };

  const handleMovement = (e: React.FormEvent) => {
    e.preventDefault();
    addCashMovement(movementType, parseFloat(movementAmount) || 0, movementReason);
    setMovementModal(false);
    setMovementAmount('');
    setMovementReason('');
  };

  const branchSessions = cashSessions.filter((cs) => cs.branchId === currentBranch.id);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Vault className="w-5 h-5 text-emerald-600" />
            <span>Control y Arqueo de Cajas</span>
          </h1>
          <p className="text-xs text-slate-500">
            Aperturas, ventas del turno, movimientos autorizados y cierre ciego • {currentBranch.name}
          </p>
        </div>

        <div className="flex gap-2">
          {!currentCashSession ? (
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer"
            >
              <Vault className="w-4 h-4" />
              <span>Abrir Turno de Caja</span>
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
                  setCloseModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-red-200 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cerrar Turno & Arqueo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Panel del Turno Activo */}
      {currentCashSession ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                TURNO ACTIVO • {currentCashSession.cashRegisterName}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Apertura: {new Date(currentCashSession.openedAt).toLocaleString('es-SV')} por <strong>{currentCashSession.userName}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold">Saldo Esperado en Caja</span>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {settings.currencySymbol} {(currentCashSession.expectedBalance || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Desglose de Caja */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Saldo Inicial</span>
              <div className="text-sm font-black text-slate-800 font-mono mt-0.5">
                {settings.currencySymbol} {currentCashSession.openingBalance.toFixed(2)}
              </div>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-800 uppercase font-bold">Ventas Efectivo</span>
              <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                {settings.currencySymbol} {currentCashSession.cashSales.toFixed(2)}
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
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-800 uppercase font-bold">Ingresos Extra</span>
              <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                +{settings.currencySymbol} {currentCashSession.cashIn.toFixed(2)}
              </div>
            </div>
            <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-100 text-center">
              <span className="text-[10px] text-red-800 uppercase font-bold">Retiros Extra</span>
              <div className="text-sm font-black text-red-700 font-mono mt-0.5">
                -{settings.currencySymbol} {currentCashSession.cashOut.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <Vault className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">No hay turno de caja abierto en esta sucursal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Para realizar ventas en el Punto de Venta (POS) y registrar cobros en efectivo, primero debe abrir un turno de caja con saldo inicial.
          </p>
          <button
            onClick={() => setOpenModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-200"
          >
            <Vault className="w-4 h-4" />
            <span>Abrir Turno de Caja</span>
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
                <th className="p-3 text-right">Saldo Esperado</th>
                <th className="p-3 text-right">Saldo Contado</th>
                <th className="p-3 text-center">Diferencia</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchSessions.map((cs) => (
                <tr key={cs.id} className="hover:bg-emerald-50/40">
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {new Date(cs.openedAt).toLocaleString('es-SV')}
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {cs.closedAt ? new Date(cs.closedAt).toLocaleString('es-SV') : 'En curso...'}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{cs.userName}</td>
                  <td className="p-3 text-right font-mono text-slate-600">{settings.currencySymbol} {cs.openingBalance.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-emerald-700 font-bold">{settings.currencySymbol} {cs.cashSales.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-800 font-medium">{settings.currencySymbol} {(cs.expectedBalance || 0).toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-900 font-bold">
                    {cs.actualBalance !== undefined ? `${settings.currencySymbol} ${(cs.actualBalance || 0).toFixed(2)}` : '-'}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apertura */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900">Apertura de Turno de Caja</h3>
            <form onSubmit={handleOpen} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Saldo Inicial en Efectivo ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-lg font-bold text-emerald-700"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  Confirmar Apertura
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cierre / Arqueo */}
      {closeModal && currentCashSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Vault className="w-4 h-4 text-emerald-600" />
              <span>Cierre de Turno y Arqueo Ciego</span>
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Saldo Inicial:</span>
                <span className="font-mono font-bold text-slate-900">{settings.currencySymbol} {currentCashSession.openingBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ventas Efectivo:</span>
                <span className="font-mono font-bold text-emerald-700">+{settings.currencySymbol} {currentCashSession.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Saldo Esperado en Gaveta:</span>
                <span className="font-mono text-emerald-700">{settings.currencySymbol} {(currentCashSession.expectedBalance || 0).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleClose} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Monto Físico Contado en Caja ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xl font-bold text-slate-900"
                />
              </div>

              {actualBalance && (
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold">
                  <span className="text-slate-600">Diferencia:</span>
                  <span
                    className={`font-mono text-sm ${
                      parseFloat(actualBalance) - currentCashSession.expectedBalance === 0
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {settings.currencySymbol} {(parseFloat(actualBalance) - currentCashSession.expectedBalance).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-red-200"
                >
                  Cerrar Caja Definitivamente
                </button>
                <button
                  type="button"
                  onClick={() => setCloseModal(false)}
                  className="px-4 bg-slate-100 text-slate-700 rounded-xl font-bold"
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold shadow-md shadow-emerald-200"
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
    </div>
  );
};
