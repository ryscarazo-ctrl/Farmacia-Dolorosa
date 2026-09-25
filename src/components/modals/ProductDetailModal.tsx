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
  Check
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
    settings,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'batches' | 'history' | 'edit'>('batches');
  const [costPrice, setCostPrice] = useState(product?.purchasePrice?.toString() || '0');
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '0');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!product) return null;

  const batches = getProductBatches(product.id);
  const totalStock = getAvailableStock(product.id);
  const productMovements = movements.filter((m) => m.productId === product.id);

  let nextBatch: ProductBatch | null = null;
  let daysRemaining: number | null = null;
  let expirationStatus: 'critical' | 'warning' | 'ok' = 'ok';

  if (batches && batches.length > 0) {
    const sortedBatches = [...batches].sort(
      (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );
    nextBatch = sortedBatches[0];

    const expTime = new Date(nextBatch.expirationDate).getTime();
    const nowTime = new Date().getTime();
    daysRemaining = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 60) {
      expirationStatus = 'critical';
    } else if (daysRemaining <= 180) {
      expirationStatus = 'warning';
    } else {
      expirationStatus = 'ok';
    }
  }

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct({
      ...product,
      purchasePrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const currency = settings.currencySymbol || 'C$';

  let headerBgClass = 'bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800';
  if (expirationStatus === 'critical') {
    headerBgClass = 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600';
  } else if (expirationStatus === 'warning') {
    headerBgClass = 'bg-gradient-to-r from-amber-600 to-emerald-700';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className={'p-5 sm:p-6 text-white transition-all ' + headerBgClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
                  {product.categoryName || 'Medicamento'}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-black/20 rounded-full">
                  SKU: {product.sku}
                </span>
                {product.barcode && (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono bg-black/20 rounded-full">
                    Cód: {product.barcode}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                {product.genericName ? 'Principio Activo: ' + product.genericName : product.presentation}
                {product.laboratoryName ? ' • ' + product.laboratoryName : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Tiempo de Vencimiento
              </div>
              <div className="text-base sm:text-lg font-black mt-0.5">
                {nextBatch ? (
                  new Date(nextBatch.expirationDate).toLocaleDateString('es-NI', {
                    month: 'short',
                    year: 'numeric',
                  })
                ) : (
                  'No registrado'
                )}
              </div>
              <div className="text-[11px] font-semibold text-white/90">
                {daysRemaining !== null
                  ? daysRemaining > 0
                    ? 'Quedan ' + daysRemaining + ' días'
                    : '¡Lote Vencido!'
                  : 'Sin lotes'}
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Stock Disponible
              </div>
              <div className="text-base sm:text-lg font-black mt-0.5">
                {totalStock} {product.presentation || 'Unidades'}
              </div>
              <div className="text-[11px] font-semibold text-white/90">
                {totalStock <= product.minStock ? '⚠️ Stock Bajo' : '✅ Stock Óptimo'}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Precio de Venta
              </div>
              <div className="text-base sm:text-lg font-black mt-0.5">
                {product.salePrice > 0 ? currency + ' ' + product.salePrice.toFixed(2) : 'Pendiente (C$ 0.00)'}
              </div>
              <div className="text-[11px] font-semibold text-white/90">
                Costo: {currency} {product.purchasePrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('batches')}
            className={'flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ' +
              (activeTab === 'batches'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Lotes y Vencimientos ({batches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={'flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ' +
              (activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            <History className="w-4 h-4 text-teal-600" />
            <span>Historial de Movimientos ({productMovements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={'flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ' +
              (activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
            <span>Asignar Precios</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'batches' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Control de Lotes y Caducidades (Sistema FEFO)
                </h3>
                <span className="text-xs text-slate-500">
                  Total de existencias: <strong className="text-slate-800">{totalStock} unidades</strong>
                </span>
              </div>

              {batches.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold">No hay lotes activos registrados para este producto.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {batches.map((batch) => {
                    const batchExpTime = new Date(batch.expirationDate).getTime();
                    const bDays = Math.ceil((batchExpTime - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = bDays <= 60;
                    const isNear = bDays <= 180 && !isUrgent;

                    return (
                      <div
                        key={batch.id}
                        className={'p-3 sm:p-4 flex items-center justify-between transition-colors ' +
                          (isUrgent ? 'bg-red-50/70' : isNear ? 'bg-amber-50/50' : 'bg-white hover:bg-slate-50')}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              Lote: {batch.batchNumber}
                            </span>
                            {isUrgent ? (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full animate-pulse">
                                🚨 Vence en {bDays} días ({batch.expirationDate})
                              </span>
                            ) : isNear ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white rounded-full">
                                ⚠️ Vence en {bDays} días
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                                ✅ Válido hasta {batch.expirationDate}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600">
                            Caducidad: <strong>{new Date(batch.expirationDate).toLocaleDateString('es-NI', { dateStyle: 'long' })}</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">
                            {batch.currentQuantity} <span className="text-xs font-normal text-slate-500">{product.presentation || 'unidades'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Inicial: {batch.initialQuantity} un.
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Kárdex y Registro de Auditoría
                </h3>
                <span className="text-xs text-slate-500">{productMovements.length} movimientos</span>
              </div>

              {productMovements.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <History className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-600">Carga Inicial de Inventario</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Este producto fue ingresado con {totalStock} unidades en stock inicial. Aún no registra salidas ni ventas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {productMovements.map((mov) => (
                    <div key={mov.id} className="p-3 sm:p-4 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div
                          className={'w-8 h-8 rounded-xl flex items-center justify-center ' +
                            (mov.movementType === 'VENTA'
                              ? 'bg-rose-100 text-rose-700'
                              : mov.movementType === 'COMPRA' || mov.movementType === 'INICIAL'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700')}
                        >
                          {mov.movementType === 'VENTA' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {mov.movementType} {(mov as any).reason || (mov as any).notes || "" ? '• ' + (mov as any).reason || (mov as any).notes || "" : ''}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(mov.createdAt).toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={'font-mono font-bold text-xs ' +
                            (mov.movementType === 'VENTA' ? 'text-rose-600' : 'text-emerald-600')}
                        >
                          {mov.movementType === 'VENTA' ? '-' + mov.quantity : '+' + mov.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSavePrices} className="space-y-4 max-w-lg mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Actualizar Precios y Rentabilidad
              </h3>

              {saveSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Precios actualizados correctamente.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Costo de Compra ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio de Venta al Público ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              {parseFloat(costPrice) > 0 && parseFloat(salePrice) > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                  <span>Margen de Ganancia estimado:</span>
                  <span className="font-extrabold text-sm">
                    {(((parseFloat(salePrice) - parseFloat(costPrice)) / parseFloat(costPrice)) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Guardar Precios
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Sucursal: <strong className="text-slate-700">Central 19 de Julio</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
