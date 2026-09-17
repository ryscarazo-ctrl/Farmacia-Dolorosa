'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const MovementsView: React.FC = () => {
  const { movements, currentBranch } = usePharmacy();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const branchMovements = movements.filter((m) => m.branchId === currentBranch.id);

  const filtered = branchMovements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || m.movementType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Kardex / Movimientos Inmutables de Inventario</span>
          </h1>
          <p className="text-xs text-slate-500">
            Registro cronológico inalterable de cada entrada, salida y venta • Sucursal: {currentBranch.name}
          </p>
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
            placeholder="Buscar por producto, lote o referencia..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
        >
          <option value="ALL">Todos los Tipos</option>
          <option value="VENTA">Ventas</option>
          <option value="COMPRA">Compras</option>
          <option value="INICIAL">Inventario Inicial</option>
          <option value="AJUSTE_ENTRADA">Ajustes Entrada</option>
          <option value="AJUSTE_SALIDA">Ajustes Salida</option>
          <option value="TRANSFERENCIA_ENTRADA">Transferencia Entrada</option>
          <option value="TRANSFERENCIA_SALIDA">Transferencia Salida</option>
        </select>
      </div>

      {/* Tabla Kardex */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {new Date(m.createdAt).toLocaleString('es-SV')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                        m.movementType === 'VENTA'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : m.movementType === 'COMPRA'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-amber-600" />}
                      <span>{m.movementType}</span>
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                    {m.productName}
                  </td>
                  <td className="p-3 font-mono text-emerald-700 font-semibold text-[11px]">
                    {m.batchNumber || 'N/A'}
                  </td>
                  <td className="p-3 text-center font-mono font-black text-xs">
                    <span className={isPositive ? 'text-emerald-700' : 'text-amber-700'}>
                      {isPositive ? `+${m.quantity}` : m.quantity}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-slate-500">
                    {m.previousStock}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-900">
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
    </div>
  );
};
