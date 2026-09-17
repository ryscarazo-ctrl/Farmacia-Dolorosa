'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  Truck,
  X,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const TransfersView: React.FC = () => {
  const {
    transfers,
    branches,
    currentBranch,
    products,
    batches,
    createTransfer,
    receiveTransfer,
  } = usePharmacy();

  const [modalOpen, setModalOpen] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState(
    branches.find((b) => b.id !== currentBranch.id)?.id || ''
  );
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('10');

  const currentBranchBatches = batches.filter(
    (b) => b.productId === selectedProductId && b.branchId === currentBranch.id && b.status === 'Available'
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTransfer(targetBranchId, [
      {
        productId: selectedProductId,
        batchNumber: selectedBatchNumber || currentBranchBatches[0]?.batchNumber || 'LOTE-DEFAULT',
        quantity: parseInt(quantity) || 1,
      },
    ]);
    setModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            <span>Transferencias de Inventario Entre Sucursales</span>
          </h1>
          <p className="text-xs text-slate-500">
            Control de envíos y recepciones con trazabilidad de lotes • Sucursal: {currentBranch.name}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Transferencia</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <th className="p-3">Número</th>
              <th className="p-3">Origen</th>
              <th className="p-3">Destino</th>
              <th className="p-3">Medicamentos / Lotes</th>
              <th className="p-3">Enviado por</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transfers.map((trf) => (
              <tr key={trf.id} className="hover:bg-emerald-50/40">
                <td className="p-3 font-mono font-bold text-emerald-700">{trf.transferNumber}</td>
                <td className="p-3 text-slate-700">{trf.sourceBranchName}</td>
                <td className="p-3 text-slate-900 font-bold">{trf.targetBranchName}</td>
                <td className="p-3">
                  {trf.items.map((it, idx) => (
                    <div key={idx} className="text-slate-900 font-medium">
                      {it.productName} ({it.quantity} uds - Lote: {it.batchNumber})
                    </div>
                  ))}
                </td>
                <td className="p-3 text-slate-500">{trf.originUserName}</td>
                <td className="p-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      trf.status === 'InTransit'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : trf.status === 'Received'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {trf.status === 'InTransit' ? 'EN TRÁNSITO' : trf.status === 'Received' ? 'RECIBIDO' : trf.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {trf.status === 'InTransit' && trf.targetBranchId === currentBranch.id && (
                    <button
                      onClick={() => receiveTransfer(trf.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm"
                    >
                      Recibir Lotes
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Transferencia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <span>Crear Transferencia entre Sucursales</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Sucursal de Destino *</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {branches
                    .filter((b) => b.id !== currentBranch.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Medicamento a Trasladar</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Lote Disponible</label>
                  <select
                    value={selectedBatchNumber}
                    onChange={(e) => setSelectedBatchNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  >
                    {currentBranchBatches.map((b) => (
                      <option key={b.id} value={b.batchNumber}>
                        {b.batchNumber} (Stock: {b.currentQuantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cantidad a Enviar</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  Despachar Transferencia
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
