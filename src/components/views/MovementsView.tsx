'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  Building2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const MovementsView: React.FC = () => {
  const { movements, currentBranch, branches, syncNow, isSyncing } = usePharmacy();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  // Filtrado robusto (permite ver todas o por sucursal específica)
  const branchMovements = (movements || []).filter((m) => {
    if (selectedBranchId === 'ALL') return true;
    return !m.branchId || m.branchId === selectedBranchId;
  });

  const filtered = branchMovements.filter((m) => {
    const matchesSearch =
      (m.productName && m.productName.toLowerCase().includes(search.toLowerCase())) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
      (m.userName && m.userName.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || m.movementType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Métricas rápidas
  const totalSalidas = branchMovements
    .filter((m) => m.movementType === 'VENTA' || m.quantity < 0)
    .reduce((acc, m) => acc + Math.abs(m.quantity), 0);
  const totalEntradas = branchMovements
    .filter((m) => m.movementType === 'COMPRA' || m.movementType === 'INICIAL' || m.quantity > 0)
    .reduce((acc, m) => acc + Math.abs(m.quantity), 0);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Kardex / Movimientos Inmutables de Inventario</span>
          </h1>
          <p className="text-xs text-slate-500">
            Registro cronológico inalterable de cada entrada, salida y venta en tiempo real.
          </p>
        </div>

        <button
          onClick={syncNow}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Actualizar Kardex'}</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Movimientos</div>
            <div className="text-xl font-black text-slate-900">{branchMovements.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Salidas / Ventas</div>
            <div className="text-xl font-black text-blue-600">{totalSalidas} unids</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Entradas / Compras</div>
            <div className="text-xl font-black text-emerald-600">{totalEntradas} unids</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por medicamento, lote, usuario o factura..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
          />
        </div>

        {/* Filtro por Sucursal */}
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-bold"
        >
          <option value="ALL">🏢 Todas las Sucursales</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              📍 {b.name}
            </option>
          ))}
        </select>

        {/* Filtro por Tipo */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-bold"
        >
          <option value="ALL">🔄 Todos los Tipos</option>
          <option value="VENTA">🛒 Ventas (Salidas)</option>
          <option value="COMPRA">📦 Compras (Entradas)</option>
          <option value="INICIAL">✨ Inventario Inicial</option>
          <option value="AJUSTE_ENTRADA">➕ Ajustes Entrada</option>
          <option value="AJUSTE_SALIDA">➖ Ajustes Salida</option>
          <option value="TRANSFERENCIA_ENTRADA">📥 Transferencia Entrada</option>
          <option value="TRANSFERENCIA_SALIDA">📤 Transferencia Salida</option>
        </select>
      </div>

      {/* Tabla Kardex */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No hay movimientos con los filtros actuales</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Cada venta realizada en el Punto de Venta o entrada de inventario quedará registrada aquí de forma inmutable.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Tipo Movimiento</th>
                  <th className="p-3">Medicamento</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-center">Stock Previo</th>
                  <th className="p-3 text-center">Stock Nuevo</th>
                  <th className="p-3">Usuario / Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString('es-SV')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            m.movementType === 'VENTA'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : m.movementType === 'COMPRA'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{m.movementType}</span>
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                        {m.productName}
                      </td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold text-[11px] whitespace-nowrap">
                        {m.batchNumber || 'N/A'}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-xs whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-700' : 'text-blue-700'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 whitespace-nowrap">
                        {m.previousStock}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                        {m.newStock}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        <span className="text-slate-800 font-bold">{m.userName}</span>
                        {m.notes && <div className="text-[10px] text-slate-400 truncate">{m.notes}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
