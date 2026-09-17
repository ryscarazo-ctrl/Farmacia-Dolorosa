'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Barcode,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  PackageX,
  DollarSign,
  Printer,
  Calendar,
  Layers,
  ShieldAlert,
  UserCheck,
  FileText,
  Sparkles,
  Info,
  Building,
  Trash2,
  Clock,
  Search,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { BarcodeReturn } from '../../types/pharmacy';

export const ReturnsView: React.FC<{ onNavigateToSales?: () => void }> = () => {
  const {
    products,
    batches,
    barcodeReturns,
    processBarcodeReturn,
    currentBranch,
    currentUser,
    settings,
    currentCashSession,
  } = usePharmacy();

  // Pestañas principales
  const [activeTab, setActiveTab] = useState<'scan' | 'expired-area' | 'history'>('scan');

  // Input de código de barras
  const [scannedCode, setScannedCode] = useState('');
  const [detectedProduct, setDetectedProduct] = useState<(typeof products)[0] | null>(null);
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('');

  // Formulario de devolución
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Error de despacho en mostrador');
  const [sellerJustification, setSellerJustification] = useState('');
  const [destination, setDestination] = useState<'RESTOCK' | 'EXPIRED_QUARANTINE'>('RESTOCK');
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'Card' | 'CreditNote'>('Cash');
  const [customerName, setCustomerName] = useState('');

  // Estados de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastReturn, setLastReturn] = useState<BarcodeReturn | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<BarcodeReturn | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Autofocus en el campo de código de barras
  useEffect(() => {
    if (activeTab === 'scan') {
      barcodeInputRef.current?.focus();
    }
  }, [activeTab]);

  // Al escanear o escribir código de barras
  const handleBarcodeLookup = (codeToSearch: string) => {
    const code = codeToSearch.trim();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!code) {
      setDetectedProduct(null);
      return;
    }

    const found = products.find(
      (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setDetectedProduct(found);
      const prodBatches = batches.filter(
        (b) => b.productId === found.id && b.branchId === currentBranch.id
      );
      const firstBatch = prodBatches[0];
      setSelectedBatchNumber(firstBatch?.batchNumber || 'LOTE-DEFAULT');

      // Comprobar si el lote está vencido
      if (firstBatch && new Date(firstBatch.expirationDate) <= new Date()) {
        setDestination('EXPIRED_QUARANTINE');
        setReason('Medicamento Vencido / No Conforme');
      } else {
        setDestination('RESTOCK');
      }
    } else {
      setDetectedProduct(null);
      setErrorMessage(`No se encontró ningún medicamento con el código de barras "${code}".`);
    }
  };

  // Procesar devolución
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!detectedProduct) {
      setErrorMessage('Por favor escanea o ingresa un código de barras válido.');
      return;
    }

    if (!sellerJustification || sellerJustification.trim().length < 8) {
      setErrorMessage('Obligatorio: El vendedor debe ingresar una justificación detallada (mínimo 8 caracteres) del porqué se recibe este medicamento.');
      return;
    }

    const qtyNum = parseInt(quantity) || 1;
    const res = processBarcodeReturn({
      barcode: detectedProduct.barcode,
      batchNumber: selectedBatchNumber,
      quantity: qtyNum,
      reason,
      sellerJustification: sellerJustification.trim(),
      destination,
      refundMethod,
      customerName: customerName.trim() || 'Cliente Mostrador',
    });

    if (res.success && res.returnRecord) {
      setSuccessMessage(res.message);
      setLastReturn(res.returnRecord);
      setViewingRecord(res.returnRecord);
      setVoucherModalOpen(true);

      // Limpiar formulario para el siguiente escaneo
      setScannedCode('');
      setDetectedProduct(null);
      setQuantity('1');
      setSellerJustification('');
      setCustomerName('');
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 200);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Medicamentos en el Área de Vencidos y Cuarentena
  const expiredQuarantineItems = barcodeReturns.filter(
    (r) => r.destination === 'EXPIRED_QUARANTINE'
  );

  const totalLossInExpired = expiredQuarantineItems.reduce(
    (sum, r) => sum + r.totalRefundAmount,
    0
  );

  const selectedBatchObj = detectedProduct
    ? batches.find(
        (b) =>
          b.productId === detectedProduct.id &&
          b.batchNumber === selectedBatchNumber &&
          b.branchId === currentBranch.id
      )
    : null;

  const isSelectedBatchExpired = selectedBatchObj
    ? new Date(selectedBatchObj.expirationDate) <= new Date()
    : false;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Banner Principal Blanco y Verde */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
            <Barcode className="w-4 h-4 text-emerald-200" />
            <span>Control por Código de Barras • Sucursal {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Devolución de Medicamentos por Código de Barras
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl">
            Sin tickets ni facturas: escanea directamente la caja del medicamento devuelto. El vendedor debe justificar obligatoriamente la devolución y los medicamentos vencidos se derivan de inmediato a su área especial de cuarentena.
          </p>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="flex flex-wrap gap-2 bg-emerald-800/40 p-1.5 rounded-2xl border border-emerald-500/30">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-white text-emerald-800 shadow-md'
                : 'text-emerald-100 hover:bg-emerald-700/50'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Escanear Caja</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expired-area')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'expired-area'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-emerald-100 hover:bg-emerald-700/50'
            }`}
          >
            <PackageX className="w-4 h-4 text-red-300" />
            <span>Área Medicamentos Vencidos ({expiredQuarantineItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-emerald-800 shadow-md'
                : 'text-emerald-100 hover:bg-emerald-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Historial ({barcodeReturns.length})</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: ESCANEAR CÓDIGO DE BARRAS Y PROCESAR DEVOLUCIÓN */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulario Izquierdo: Escaneo y Justificación (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              {/* Buscador / Lector de Código de Barras */}
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Barcode className="w-4 h-4 text-emerald-600" />
                  <span>Escáner de Código de Barras (Caja del Medicamento)</span>
                </label>
                <div className="relative">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={scannedCode}
                    onChange={(e) => {
                      setScannedCode(e.target.value);
                      handleBarcodeLookup(e.target.value);
                    }}
                    placeholder="Pasa la pistola láser por el código de barras o escribe el código EAN..."
                    className="w-full bg-emerald-50/40 border-2 border-emerald-500 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Listo para escanear</span>
                  </div>
                </div>

                {/* Accesos rápidos de prueba de productos de la farmacia */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Probar Códigos:</span>
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setScannedCode(p.barcode);
                        handleBarcodeLookup(p.barcode);
                      }}
                      className="text-[10px] font-mono px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {p.name.split(' ')[0]} ({p.barcode})
                    </button>
                  ))}
                </div>

                {errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Si el medicamento fue detectado por el código de barras */}
              {detectedProduct && (
                <form onSubmit={handleSubmitReturn} className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Ficha del Medicamento Identificado */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-sm text-slate-900">
                          {detectedProduct.name}
                        </div>
                        {detectedProduct.genericName && (
                          <div className="text-xs text-emerald-800 font-semibold">
                            Principio Activo: {detectedProduct.genericName}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500">
                          {detectedProduct.presentation} • Laboratorio: <strong>{detectedProduct.laboratoryName || 'Vijosa'}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Precio Unitario</div>
                        <div className="text-lg font-mono font-black text-emerald-800">
                          ${detectedProduct.salePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Selector de Lote y Fecha de Vencimiento de la Caja */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Lote Impreso en la Caja:
                        </label>
                        <select
                          value={selectedBatchNumber}
                          onChange={(e) => {
                            setSelectedBatchNumber(e.target.value);
                            const b = batches.find(
                              (x) =>
                                x.productId === detectedProduct.id &&
                                x.batchNumber === e.target.value
                            );
                            if (b && new Date(b.expirationDate) <= new Date()) {
                              setDestination('EXPIRED_QUARANTINE');
                              setReason('Medicamento Vencido / No Conforme');
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                        >
                          {batches
                            .filter((b) => b.productId === detectedProduct.id)
                            .map((b) => (
                              <option key={b.id} value={b.batchNumber}>
                                {b.batchNumber} (Vence: {b.expirationDate})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Cantidad a Devolver (Unidades):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Alerta si el lote está vencido */}
                    {isSelectedBatchExpired && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2 font-bold animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                          <span>¡ALERTA SANITARIA! Este medicamento tiene fecha de caducidad vencida ({selectedBatchObj?.expirationDate}).</span>
                          <p className="text-[11px] font-normal text-red-800 mt-0.5">
                            Por ley no puede volver al estante. Debe enviarse al Área de Medicamentos Vencidos.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DESTINO DEL MEDICAMENTO: RE-STOCK vs ESPACIO DE VENCIDOS */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Destino del Medicamento Devuelto:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDestination('RESTOCK')}
                        disabled={isSelectedBatchExpired}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          destination === 'RESTOCK'
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 opacity-80'
                        } ${isSelectedBatchExpired ? 'cursor-not-allowed opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                          <span>Re-Stock (Estantería Vendible)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Caja sellada, intacta y vigente. Se suma de nuevo al inventario para venta.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDestination('EXPIRED_QUARANTINE')}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          destination === 'EXPIRED_QUARANTINE'
                            ? 'border-red-600 bg-red-50/80 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-red-800">
                          <PackageX className="w-4 h-4 text-red-600" />
                          <span>Área de Medicamentos Vencidos / Merma</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Medicamento vencido, alterado o abierto. Se aparta en el área de cuarentena sanitaria.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* JUSTIFICACIÓN OBLIGATORIA DEL VENDEDOR */}
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                        <UserCheck className="w-4 h-4 text-amber-700" />
                        <span>Justificación Obligatoria del Vendedor</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                        Requerido por Auditoría
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Motivo Principal
                        </label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                        >
                          <option value="Medicamento Vencido / No Conforme">Medicamento Vencido / Caducado</option>
                          <option value="Error de despacho en mostrador">Error del despachador al entregar producto</option>
                          <option value="Empaque abierto o dañado por el cliente">Empaque abierto o dañado por el cliente</option>
                          <option value="Cambio de receta médica o dosis">Cambio de receta médica o dosis</option>
                          <option value="Reacción alérgica del paciente">Reacción alérgica del paciente</option>
                          <option value="Desistimiento justificado del cliente">Desistimiento del cliente</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Forma de Reembolso
                        </label>
                        <select
                          value={refundMethod}
                          onChange={(e) => setRefundMethod(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                        >
                          <option value="Cash">Reembolso en Efectivo (Salida de Caja)</option>
                          <option value="Card">Reversión a Tarjeta</option>
                          <option value="CreditNote">Nota de Crédito / Saldo a Favor</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Explicación Detallada del Vendedor (Mínimo 8 caracteres) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={sellerJustification}
                        onChange={(e) => setSellerJustification(e.target.value)}
                        placeholder="Escribe la justificación exacta: ej. 'El cliente presentó la caja porque la fecha de caducidad estaba vencida. Se le reintegró el efectivo y se manda a custodia de vencidos.'"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                        <span>Vendedor responsable: <strong>{currentUser.firstName} {currentUser.lastName}</strong></span>
                        <span>{sellerJustification.length} caracteres</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Confirmación y Total */}
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Monto a Reembolsar al Cliente
                      </div>
                      <div className="text-2xl font-mono font-black text-emerald-900">
                        ${((parseInt(quantity) || 1) * detectedProduct.salePrice).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        Destino: {destination === 'EXPIRED_QUARANTINE' ? '🚫 Área Vencidos' : '🟢 Re-Stock Estante'} • {refundMethod}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-300 cursor-pointer transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Devolución</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Panel Derecho: Resumen Operativo y Accesos Rápidos (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tarjeta de Normativa Farmacéutica */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Protocolo de Devoluciones en Farmacia</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Identificación por Código de Barras:</strong> Asegura que el medicamento corresponda exactamente a la presentación y concentración del laboratorio registrado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Justificación del Vendedor:</strong> Registro inmutable en la bitácora de auditoría para prevenir mermas injustificadas o fraudes de mostrador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Área de Medicamentos Vencidos:</strong> Los productos caducados se aíslan automáticamente del inventario activo y quedan bajo resguardo para su acta de destrucción.</span>
                </li>
              </ul>
            </div>

            {/* Acceso Directo al Área de Vencidos */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <PackageX className="w-4 h-4 text-red-600" />
                  <span>Espacio de Vencidos y Bajas</span>
                </span>
                <span className="font-mono text-xs font-black bg-red-200/80 text-red-900 px-2 py-0.5 rounded-full">
                  {expiredQuarantineItems.length} en custodia
                </span>
              </div>
              <p className="text-xs text-red-700">
                Pérdida retenida en medicamentos vencidos devueltos: <strong className="font-mono">${totalLossInExpired.toFixed(2)}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('expired-area')}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ver Espacio de Medicamentos Vencidos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ÁREA EXCLUSIVA DE MEDICAMENTOS VENCIDOS Y CUARENTENA */}
      {activeTab === 'expired-area' && (
        <div className="space-y-4">
          {/* Header del Área de Vencidos */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-700 text-xs font-bold uppercase tracking-wider mb-0.5">
                <PackageX className="w-4 h-4 text-red-600" />
                <span>Custodia Sanitaria y Control de Mermas</span>
              </div>
              <h2 className="text-xl font-black text-red-950">
                Área Especial de Medicamentos Vencidos y Retirados
              </h2>
              <p className="text-xs text-red-700/90 mt-0.5 max-w-xl">
                Los medicamentos depositados aquí están aislados físicamente y bloqueados del sistema de ventas. Requieren acta de baja para su destrucción legal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-2xl border border-red-200 text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Pérdida Acumulada</div>
                <div className="text-xl font-mono font-black text-red-700">
                  ${totalLossInExpired.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Generar Acta de Destrucción</span>
              </button>
            </div>
          </div>

          {/* Tabla de Medicamentos en el Área de Vencidos */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Código Devolución</th>
                    <th className="p-3.5">Medicamento</th>
                    <th className="p-3.5">Código de Barras</th>
                    <th className="p-3.5">Lote / Caducidad</th>
                    <th className="p-3.5 text-center">Unidades</th>
                    <th className="p-3.5 text-right">Monto Pérdida</th>
                    <th className="p-3.5">Justificación del Vendedor</th>
                    <th className="p-3.5">Fecha Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiredQuarantineItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No hay medicamentos en el área de vencidos en esta sucursal.
                      </td>
                    </tr>
                  ) : (
                    expiredQuarantineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-red-50/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-red-800">
                          {item.returnNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-400">{item.presentation}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {item.barcode}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-slate-800">{item.batchNumber}</span>
                          <span className="block text-[10px] text-red-600 font-black">
                            Caducó: {item.expirationDate}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-red-700">
                          {item.quantityReturned}
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900">
                          ${item.totalRefundAmount.toFixed(2)}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="text-[11px] text-slate-700 italic bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                            "{item.sellerJustification}"
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Autorizó: <strong>{item.vendorName}</strong>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[10px]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: HISTORIAL COMPLETO DE DEVOLUCIONES POR CÓDIGO DE BARRAS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Historial General de Devoluciones Procesadas
              </h2>
              <p className="text-xs text-slate-500">
                Registro cronológico con justificación firmada por el vendedor y destino asignado.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {barcodeReturns.length} devoluciones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">N° Devolución</th>
                  <th className="p-3.5">Medicamento</th>
                  <th className="p-3.5">Código de Barras</th>
                  <th className="p-3.5 text-center">Destino Asignado</th>
                  <th className="p-3.5 text-center">Cant.</th>
                  <th className="p-3.5 text-right">Reembolsado</th>
                  <th className="p-3.5">Vendedor & Justificación</th>
                  <th className="p-3.5 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {barcodeReturns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {item.returnNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Lote: {item.batchNumber}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {item.barcode}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.destination === 'EXPIRED_QUARANTINE'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {item.destination === 'EXPIRED_QUARANTINE' ? 'Área Vencidos' : 'Re-Stock'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      {item.quantityReturned}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-slate-900">
                      ${item.totalRefundAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="text-[11px] text-slate-700 italic">
                        "{item.sellerJustification}"
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                        Vendedor: {item.vendorName} • {item.refundMethod}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingRecord(item);
                          setVoucherModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        title="Ver e Imprimir Comprobante"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Comprobante / Acta de Devolución */}
      {voucherModalOpen && viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            {/* Encabezado */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <div className="font-black text-sm text-emerald-800 tracking-wider">
                FARMACIA ESPÍRITU SANTO 🕊️
              </div>
              <div className="text-[11px] font-bold text-slate-700">{currentBranch.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">Control por Código de Barras</div>
              <div className="pt-2">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-300 uppercase">
                  COMPROBANTE DE DEVOLUCIÓN #{viewingRecord.returnNumber}
                </span>
              </div>
            </div>

            {/* Datos */}
            <div className="text-xs space-y-1 font-mono text-slate-700 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha/Hora:</span>
                <span>{new Date(viewingRecord.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Código de Barras:</span>
                <span className="font-bold text-slate-900">{viewingRecord.barcode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Medicamento:</span>
                <span className="font-bold">{viewingRecord.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lote Impreso:</span>
                <span>{viewingRecord.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vencimiento:</span>
                <span className={viewingRecord.destination === 'EXPIRED_QUARANTINE' ? 'text-red-600 font-bold' : ''}>
                  {viewingRecord.expirationDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destino Asignado:</span>
                <span className="font-bold">
                  {viewingRecord.destination === 'EXPIRED_QUARANTINE' ? 'ÁREA DE VENCIDOS' : 'RE-STOCK DISPONIBLE'}
                </span>
              </div>
            </div>

            {/* Justificación del Vendedor */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <div className="text-[10px] font-bold text-amber-900 uppercase">
                Justificación Registrada del Vendedor
              </div>
              <p className="italic text-slate-800 text-[11px]">
                "{viewingRecord.sellerJustification}"
              </p>
              <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                <span>Vendedor: <strong>{viewingRecord.vendorName}</strong></span>
                <span>Método: {viewingRecord.refundMethod}</span>
              </div>
            </div>

            {/* Total Reembolso */}
            <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-800">TOTAL REEMBOLSADO:</span>
              <span className="text-xl font-mono font-black text-emerald-700">
                ${viewingRecord.totalRefundAmount.toFixed(2)}
              </span>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
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
