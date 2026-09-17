'use client';

import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { ProductBatch } from '../../types/pharmacy';

export const BatchesView: React.FC<{ filterOnlyExpirations?: boolean }> = ({ filterOnlyExpirations }) => {
  const { batches, products, addBatch, currentBranch, settings } = usePharmacy();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity) || 0;
    addBatch({
      productId: selectedProductId,
      branchId: currentBranch.id,
      batchNumber,
      expirationDate,
      initialQuantity: qty,
      currentQuantity: qty,
      unitCost: parseFloat(unitCost) || 0,
      status: 'Available',
    });
    setModalOpen(false);
  };

  const branchBatches = batches.filter((b) => b.branchId === currentBranch.id);

  const filtered = branchBatches
    .filter((b) => {
      const prod = products.find((p) => p.id === b.productId);
      const prodName = prod?.name.toLowerCase() || '';
      const matchesSearch =
        prodName.includes(search.toLowerCase()) ||
        b.batchNumber.toLowerCase().includes(search.toLowerCase());

      if (filterOnlyExpirations) {
        const exp = new Date(b.expirationDate);
        return matchesSearch && (b.status === 'Expired' || exp <= ninetyDays);
      }

      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>
              {filterOnlyExpirations
                ? 'Semáforo y Auditoría de Vencimientos'
                : 'Control de Lotes y Trazabilidad FEFO'}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Prioridad de despacho <strong>FEFO (First Expired, First Out)</strong> • Sucursal: {currentBranch.name}
          </p>
        </div>

        {!filterOnlyExpirations && (
          <button
            onClick={() => {
              setBatchNumber(`LOTE-${Math.floor(1000 + Math.random() * 9000)}`);
              setExpirationDate('2027-06-30');
              setQuantity('100');
              setUnitCost('0.10');
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Lote</span>
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por lote o medicamento..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        {!filterOnlyExpirations && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Available">Disponibles</option>
            <option value="Expired">Vencidos</option>
            <option value="Damaged">Dañados</option>
            <option value="Depleted">Agotados</option>
          </select>
        )}
      </div>

      {/* Tabla de Lotes */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <th className="p-3">Prioridad FEFO</th>
              <th className="p-3">Medicamento</th>
              <th className="p-3">Número de Lote</th>
              <th className="p-3">Fecha Vencimiento</th>
              <th className="p-3 text-right">Costo Unit.</th>
              <th className="p-3 text-center">Inicial</th>
              <th className="p-3 text-center">Disponible</th>
              <th className="p-3 text-center">Estado Semáforo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((batch, index) => {
              const prod = products.find((p) => p.id === batch.productId);
              const exp = new Date(batch.expirationDate);
              const isExpired = batch.status === 'Expired' || exp <= now;
              const isCrit = exp <= thirtyDays && !isExpired;
              const isWarn = exp <= ninetyDays && !isCrit && !isExpired;

              return (
                <tr key={batch.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                    {prod?.name || 'Medicamento'}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {batch.batchNumber}
                  </td>
                  <td className="p-3 font-mono text-slate-600 font-semibold">
                    {batch.expirationDate}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-500">
                    {settings.currencySymbol} {batch.unitCost.toFixed(2)}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">
                    {batch.initialQuantity}
                  </td>
                  <td className="p-3 text-center font-mono font-black text-slate-900 text-sm">
                    {batch.currentQuantity}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                        isExpired
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isCrit
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isWarn
                          ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isExpired ? (
                        <>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>VENCIDO (BLOQUEADO)</span>
                        </>
                      ) : isCrit ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>CRÍTICO (&lt;30d)</span>
                        </>
                      ) : isWarn ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                          <span>ATENCIÓN (&lt;90d)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>ÓPTIMO</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Lote */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900">Ingreso Manual de Lote y Vencimiento</h3>

            <form onSubmit={handleSaveBatch} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Medicamento</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Número de Lote</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cantidad Inicial</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Costo Unitario ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Lote</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
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
