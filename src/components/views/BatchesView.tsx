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
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { ProductBatch } from '../../types/pharmacy';

export const BatchesView: React.FC<{ filterOnlyExpirations?: boolean }> = ({ filterOnlyExpirations }) => {
  const { batches, products, openProductDetail, currentBranch } = usePharmacy();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const now = new Date();

  const sortedBatches = [...batches].sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  );

  const filteredBatches = sortedBatches.filter((b) => {
    const prod = products.find((p) => p.id === b.productId);
    const prodName = prod?.name.toLowerCase() || '';
    const matchesSearch =
      prodName.includes(search.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      (prod?.categoryName && prod.categoryName.toLowerCase().includes(search.toLowerCase()));

    const expTime = new Date(b.expirationDate).getTime();
    const days = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));

    if (categoryFilter === 'CRITICAL') {
      return matchesSearch && days <= 90;
    }
    if (categoryFilter === 'NEAR') {
      return matchesSearch && days > 90 && days <= 365;
    }
    if (categoryFilter === 'SAFE') {
      return matchesSearch && days > 365;
    }

    return matchesSearch;
  });

  return (
    <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-800 text-white p-4 sm:p-6 rounded-3xl shadow-md space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-emerald-300" />
          <span>Control FEFO y Caducidades</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Semáforo de Vencimientos
        </h1>
        <p className="text-xs text-white/80">
          Monitoreo de lotes por fecha de caducidad. Toca cualquier medicamento para ver su ficha.
        </p>
      </div>

      {/* Filtros rápidos estilo pastilla */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            categoryFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Todos ({batches.length})
        </button>
        <button
          onClick={() => setCategoryFilter('CRITICAL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            categoryFilter === 'CRITICAL'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          }`}
        >
          🔴 Urgentes (≤ 90 días)
        </button>
        <button
          onClick={() => setCategoryFilter('NEAR')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            categoryFilter === 'NEAR'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          🟡 Medio Plazo (2027)
        </button>
        <button
          onClick={() => setCategoryFilter('SAFE')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            categoryFilter === 'SAFE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          🟢 Seguro (2028+)
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar fármaco o lote..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Lista de Tarjetas Verticales para Celular y Tablet */}
      <div className="space-y-2.5">
        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No se encontraron lotes para este filtro.
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const prod = products.find((p) => p.id === batch.productId);
            const expTime = new Date(batch.expirationDate).getTime();
            const daysRemaining = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));
            const isCritical = daysRemaining <= 90;
            const isNear = daysRemaining > 90 && daysRemaining <= 365;

            return (
              <div
                key={batch.id}
                onClick={() => prod && openProductDetail(prod)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-98 bg-white hover:border-emerald-300 shadow-xs ${
                  isCritical
                    ? 'border-red-300 bg-red-50/40'
                    : isNear
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {prod?.name || 'Medicamento'}
                      </span>
                      {isCritical ? (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full">
                          🚨 Vence en {daysRemaining} días
                        </span>
                      ) : isNear ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full">
                          ⚠️ {daysRemaining} días
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                          ✅ Seguro
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {prod?.genericName ? `Principio: ${prod.genericName}` : prod?.presentation}
                      {prod?.laboratoryName ? ` • ${prod.laboratoryName}` : ''}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        Lote: {batch.batchNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Vence: <strong>{new Date(batch.expirationDate).toLocaleDateString('es-NI', { month: 'long', year: 'numeric' })}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-slate-900">
                      {batch.currentQuantity} <span className="text-xs font-normal text-slate-500">{prod?.presentation || 'un.'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      Ver Ficha →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
