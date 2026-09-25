'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  Layers,
  History,
  Tag,
  DollarSign,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Save,
  Check,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product, ProductBatch } from '../../types/pharmacy';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const {
    getProductBatches,
    getAvailableStock,
    movements,
    updateProduct,
    addBatch,
    currentBranch,
    settings,
    currentUser,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'status' | 'batches' | 'history' | 'edit'>('status');
  const [costPrice, setCostPrice] = useState(product?.purchasePrice?.toString() || '0');
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '0');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newBatchExpDate, setNewBatchExpDate] = useState('');
  const [newBatchQty, setNewBatchQty] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [batchSaveSuccess, setBatchSaveSuccess] = useState(false);

  if (!product) return null;

  const batches = getProductBatches(product.id);
  const totalStock = getAvailableStock(product.id);
  const productMovements = movements.filter((m) => m.productId === product.id);

  // Validación de requisitos para la venta
  const missingSalePrice = !product.salePrice || product.salePrice <= 0;
  const missingPurchasePrice = !product.purchasePrice || product.purchasePrice <= 0;
  const missingBatches = batches.length === 0;
  const now = new Date();
  
  let nextBatch: ProductBatch | null = null;
  let daysRemaining: number | null = null;
  let allBatchesExpired = false;

  if (batches && batches.length > 0) {
    const sortedBatches = [...batches].sort(
      (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );
    nextBatch = sortedBatches[0];
    const expTime = new Date(nextBatch.expirationDate).getTime();
    daysRemaining = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));
    allBatchesExpired = sortedBatches.every(b => new Date(b.expirationDate) <= now);
  }

  const isPendingSale = missingSalePrice || missingBatches || allBatchesExpired;

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    const numericCost = parseFloat(costPrice) || 0;
    const numericSale = parseFloat(salePrice) || 0;

    updateProduct({
      ...product,
      purchasePrice: numericCost,
      salePrice: numericSale,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleAddNewBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchNumber || !newBatchExpDate) return;

    const qty = parseInt(newBatchQty) || 0;

    addBatch({
      productId: product.id,
      branchId: currentBranch.id,
      batchNumber: newBatchNumber.trim().toUpperCase(),
      expirationDate: newBatchExpDate,
      initialQuantity: qty,
      currentQuantity: qty,
      manufactureDate: new Date().toISOString().split('T')[0],
      unitCost: product.purchasePrice || 0,
      status: 'Available',
    });

    setNewBatchNumber('');
    setNewBatchExpDate('');
    setNewBatchQty('');
    setBatchSaveSuccess(true);
    setTimeout(() => {
      setBatchSaveSuccess(false);
    }, 2000);
  };

  const currency = settings.currencySymbol || 'C$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Cabecera Principal */}
        <div className={`p-4 sm:p-6 text-white ${
          isPendingSale
            ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-slate-800'
            : 'bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 rounded-full">
                  {product.categoryName || 'General'}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-black/30 rounded-full">
                  SKU: {product.sku}
                </span>
                {product.barcode && (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono bg-black/30 rounded-full">
                    Cód: {product.barcode}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                  isPendingSale
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : 'bg-emerald-400 text-emerald-950 font-black'
                }`}>
                  {isPendingSale ? '⚠️ PENDIENTE DE VENTA' : '✅ APTO PARA VENTA'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                {product.genericName ? `Principio Activo: ${product.genericName}` : product.presentation}
                {product.laboratoryName ? ` • ${product.laboratoryName}` : ''}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Próx. Vencimiento
              </div>
              <div className="text-sm sm:text-base font-black mt-0.5">
                {nextBatch ? (
                  new Date(nextBatch.expirationDate).toLocaleDateString('es-NI', {
                    month: 'short',
                    year: 'numeric',
                  })
                ) : (
                  <span className="text-amber-200">⚠️ Sin Lote</span>
                )}
              </div>
              <div className="text-[10px] font-medium text-white/80">
                {daysRemaining !== null
                  ? daysRemaining > 0
                    ? `Quedan ${daysRemaining} días`
                    : '¡Lote Vencido!'
                  : 'Requiere registrar lote'}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Existencias
              </div>
              <div className="text-sm sm:text-base font-black mt-0.5">
                {totalStock} {product.presentation || 'unidades'}
              </div>
              <div className="text-[10px] font-medium text-white/80">
                {totalStock <= product.minStock ? '⚠️ Stock Mínimo' : '✅ Stock Disponible'}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Precio de Venta
              </div>
              <div className="text-sm sm:text-base font-black mt-0.5">
                {product.salePrice > 0 ? (
                  `${currency} ${product.salePrice.toFixed(2)}`
                ) : (
                  <span className="text-amber-200">⚠️ Falta Precio</span>
                )}
              </div>
              <div className="text-[10px] font-medium text-white/80">
                Costo: {currency} {product.purchasePrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-6 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 py-3 px-3.5 font-bold text-xs border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Diagnóstico de Venta</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 py-3 px-3.5 font-bold text-xs border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4 text-teal-600" />
            <span>Historial & Kárdex ({productMovements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-1.5 py-3 px-3.5 font-bold text-xs border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'batches'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Lotes & Vencimiento ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 py-3 px-3.5 font-bold text-xs border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
            <span>Asignar Precios</span>
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800">
          
          {/* TAB 1: DIAGNÓSTICO DE REQUISITOS DE VENTA */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                isPendingSale ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
              }`}>
                <div className="flex items-start gap-3">
                  {isPendingSale ? (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-black text-sm ${isPendingSale ? 'text-amber-900' : 'text-emerald-900'}`}
                    >
                      {isPendingSale ? 'Medicamento Pendiente de Requisitos para Venta' : 'Medicamento 100% Habilitado y Apto para la Venta'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isPendingSale
                        ? 'Para que este fármaco pueda facturarse en el módulo POS de caja, debe contar con un Precio de Venta (PVP) mayor a C$ 0.00 y al menos un Lote con Fecha de Vencimiento vigente.'
                        : 'Este medicamento cumple con todos los requisitos fiscales, precio de venta al público y trazabilidad de lote FEFO.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist Visual de Requisitos */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Lista de Verificación Comercial:
                </h4>

                <div className="space-y-2.5">
                  {/* Requisito 1: Precio de Venta */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      {product.salePrice > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">1. Precio de Venta al Público (PVP)</div>
                        <div className="text-[11px] text-slate-500">
                          {product.salePrice > 0
                            ? `Asignado correctamente: ${currency} ${product.salePrice.toFixed(2)}`
                            : 'Falta asignar precio de venta (actualmente C$ 0.00)'}
                        </div>
                      </div>
                    </div>
                    {product.salePrice <= 0 && (
                      <button
                        onClick={() => setActiveTab('edit')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Asignar Precio
                      </button>
                    )}
                  </div>

                  {/* Requisito 2: Lote y Fecha de Vencimiento */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      {batches.length > 0 && !allBatchesExpired ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">2. Lote y Fecha de Vencimiento</div>
                        <div className="text-[11px] text-slate-500">
                          {batches.length > 0
                            ? `${batches.length} lote(s) registrado(s) • Próximo vence: ${nextBatch ? nextBatch.expirationDate : 'N/A'}`
                            : 'No tiene ningún lote ni fecha de caducidad registrada'}
                        </div>
                      </div>
                    </div>
                    {batches.length === 0 && (
                      <button
                        onClick={() => setActiveTab('batches')}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Agregar Lote
                      </button>
                    )}
                  </div>

                  {/* Requisito 3: Existencias */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      {totalStock > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">3. Existencias en Inventario</div>
                        <div className="text-[11px] text-slate-500">
                          {totalStock > 0
                            ? `${totalStock} unidades físicas en bodega/sucursal`
                            : 'Stock en cero (0 unidades)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORIAL Y KÁRDEX COMPLETO */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-teal-600" />
                  Kárdex y Registro Cronológico de Movimientos
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {productMovements.length} movimientos
                </span>
              </div>

              {productMovements.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">Carga Inicial de Inventario Registrada</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Este fármaco cuenta con su existencia física inicial de <strong>{totalStock} unidades</strong> y lote <strong>{nextBatch?.batchNumber || 'N/A'}</strong>. Las ventas y ajustes futuros aparecerán aquí cronológicamente.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  {productMovements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <div key={mov.id} className="p-3 sm:p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isPositive ? '+' : '-'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{mov.notes || mov.movementType || 'Movimiento de Inventario'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(mov.createdAt).toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' })}
                              {mov.userName ? ` • Por: ${mov.userName}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}
                          >
                            {isPositive ? `+${mov.quantity}` : mov.quantity} unid.
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Saldo: {mov.newStock} unid.
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOTES Y CADUCIDADES */}
          {activeTab === 'batches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Lotes Físicos y Control FEFO ({batches.length})
                </h3>
              </div>

              {batches.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  Sin lotes asignados. Utiliza el formulario abajo para registrar el primer lote.
                </div>
              ) : (
                <div className="space-y-2">
                  {batches.map((b) => {
                    const expTime = new Date(b.expirationDate).getTime();
                    const bDays = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isCrit = bDays <= 90;
                    const isNear = bDays > 90 && bDays <= 365;

                    return (
                      <div
                        key={b.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                          isCrit ? 'bg-red-50/70 border-red-200' : isNear ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 font-mono flex items-center gap-2">
                            <span>Lote: {b.batchNumber}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${
                              isCrit ? 'bg-red-600 text-white' : isNear ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {bDays <= 0 ? 'CADUCADO' : bDays <= 90 ? `${bDays} DÍAS (CRÍTICO)` : `VENCE EN ${Math.round(bDays / 30)} MESES`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Fecha de Vencimiento: <strong>{new Date(b.expirationDate).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-sm text-slate-900">
                            {b.currentQuantity} unid.
                          </div>
                          <div className="text-[10px] text-slate-400">Existencia Lote</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulario para Añadir Lote Rápido */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Registrar Nuevo Lote / Entrada Física</span>
                </h4>

                {batchSaveSuccess && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>¡Lote guardado exitosamente en el sistema!</span>
                  </div>
                )}

                <form onSubmit={handleAddNewBatch} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Número de Lote</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: LOT-2026-01"
                      value={newBatchNumber}
                      onChange={(e) => setNewBatchNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      required
                      value={newBatchExpDate}
                      onChange={(e) => setNewBatchExpDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Cantidad Inicial</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ej: 50"
                      value={newBatchQty}
                      onChange={(e) => setNewBatchQty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Guardar Lote</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ASIGNAR PRECIOS */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSavePrices} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-900">Configuración de Precios y Margen de Utilidad</h4>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Al asignar el precio de venta, el medicamento pasará inmediatamente a estado <strong>"APTO PARA VENTA"</strong> y podrá cobrarse en caja.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>¡Precios actualizados exitosamente! Medicamento listo para venta.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Costo de Compra ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">Costo neto pagado al laboratorio/distribuidor.</p>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-1.5">
                  <label className="block text-xs font-black text-emerald-900">
                    Precio de Venta al Público (PVP {currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[10px] text-emerald-700 font-semibold">Precio final al cliente en mostrador.</p>
                </div>
              </div>

              {/* Margen Calculado */}
              {parseFloat(costPrice) > 0 && parseFloat(salePrice) > 0 && (
                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700 font-medium">
                  <span>Margen Estimado de Ganancia:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {currency} {(parseFloat(salePrice) - parseFloat(costPrice)).toFixed(2)} ({Math.round(((parseFloat(salePrice) - parseFloat(costPrice)) / parseFloat(costPrice)) * 100)}%)
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Precios y Habilitar Venta</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};