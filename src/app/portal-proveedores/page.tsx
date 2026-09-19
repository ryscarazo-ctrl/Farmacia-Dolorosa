'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  Boxes,
  ExternalLink,
  ChevronRight,
  Info,
  MapPin,
  Barcode,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { SupplierOrder, SupplierOrderStatus } from '../../types/pharmacy';

function PublicSupplierPortalContent() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get('codigo') || searchParams.get('token') || '';

  const {
    supplierOrders,
    suppliers,
    currentBranch,
    settings,
    updateOrderStatusBySupplier,
  } = usePharmacy();

  const [inputCode, setInputCode] = useState<string>(urlCode);
  const [activeOrder, setActiveOrder] = useState<SupplierOrder | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formulario de despacho
  const [dispatchStatus, setDispatchStatus] = useState<SupplierOrderStatus>('IN_PREPARATION');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [actorName, setActorName] = useState('');

  // Auto-seleccionar si viene por URL
  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      const found = supplierOrders.find(
        (o) =>
          o.accessCode.toLowerCase() === urlCode.toLowerCase().trim() ||
          o.orderNumber.toLowerCase() === urlCode.toLowerCase().trim()
      );
      if (found) {
        setActiveOrder(found);
      }
    } else if (supplierOrders.length > 0 && !activeOrder) {
      // Si no viene código, pre-cargar la primera orden activa para demostración inmediata
      setActiveOrder(supplierOrders[0]);
      setInputCode(supplierOrders[0].accessCode);
    }
  }, [urlCode, supplierOrders]);

  // Actualizar estado del formulario cuando cambia el pedido activo
  useEffect(() => {
    if (activeOrder) {
      setDispatchStatus(
        activeOrder.status === 'PENDING_REVIEW' ? 'IN_PREPARATION' : activeOrder.status
      );
      setInvoiceNumber(activeOrder.supplierInvoiceNumber || '');
      setEstimatedArrival(
        activeOrder.estimatedDeliveryDate ? activeOrder.estimatedDeliveryDate.slice(0, 16) : ''
      );
      setDriverName(activeOrder.deliveryDriver || '');
      setDriverPhone(activeOrder.driverPhone || '');
      setSupplierNotes(activeOrder.supplierNotes || '');
      setActorName(activeOrder.supplierName);
    }
  }, [activeOrder]);

  const handleSearchOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputCode.trim().toLowerCase();
    const found = supplierOrders.find(
      (o) =>
        o.accessCode.toLowerCase() === query ||
        o.orderNumber.toLowerCase() === query
    );
    if (found) {
      setActiveOrder(found);
      setSuccessMessage(null);
    } else {
      alert(`No se encontró ningún pedido con el código o token "${inputCode}". Verifique con Farmacia Espíritu Santo.`);
    }
  };

  const handleUpdateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const res = updateOrderStatusBySupplier({
      orderId: activeOrder.id,
      newStatus: dispatchStatus,
      supplierInvoiceNumber: invoiceNumber.trim() || undefined,
      estimatedDeliveryDate: estimatedArrival || undefined,
      deliveryDriver: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      supplierNotes: supplierNotes.trim() || undefined,
      actor: actorName.trim() || activeOrder.supplierName,
    });

    if (res.success) {
      setSuccessMessage('¡Estado y datos de despacho confirmados y notificados a Farmacia Espíritu Santo!');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleCopyPublicLink = () => {
    if (!activeOrder) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/portal-proveedores?codigo=${activeOrder.accessCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getStatusBadge = (status: SupplierOrderStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-4 h-4 animate-pulse text-amber-600" />
            Pendiente de Confirmación
          </span>
        );
      case 'IN_PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Boxes className="w-4 h-4 text-blue-600" />
            En Preparación / Embalaje en Bodega
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm shadow-emerald-100">
            <Truck className="w-4 h-4 text-emerald-600" />
            Despachado / En Ruta hacia Farmacia
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            Entregado y Recibido Conforme
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Cancelado por Proveedor
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Público con Identidad Institucional de la Farmacia */}
      <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl || '/logo.jpg'}
              alt="Logo Farmacia Espíritu Santo"
              className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-emerald-300 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 tracking-wider uppercase">
                  ACCESO PÚBLICO PARA PROVEEDORES
                </span>
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Portal Oficial B2B
                </span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                FARMACIA ESPÍRITU SANTO 🕊️
              </h1>
              <p className="text-xs text-slate-500">
                {currentBranch.name} • {currentBranch.address}
              </p>
            </div>
          </div>

          {/* Buscador de Pedido por Código Público */}
          <form
            onSubmit={handleSearchOrder}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Código de Acceso (ej: PROV-VIJOSA-7892)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Consultar
            </button>
          </form>
        </div>

        {/* Acceso Rápido por Código de Proveedor */}
        <div className="bg-emerald-50/60 border-t border-emerald-100 py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs overflow-x-auto">
            <span className="text-slate-500 font-bold whitespace-nowrap flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Pedidos Disponibles para Consulta:
            </span>
            <div className="flex items-center gap-2">
              {supplierOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => {
                    setInputCode(ord.accessCode);
                    setActiveOrder(ord);
                  }}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border transition-all whitespace-nowrap ${
                    activeOrder?.id === ord.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {ord.orderNumber} ({ord.supplierName.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mensaje de Éxito Flotante */}
      {successMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {activeOrder ? (
          <div className="space-y-6">
            {/* Banner de Estado del Pedido */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {activeOrder.orderNumber}
                  </span>
                  {getStatusBadge(activeOrder.status)}
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Prioridad: {activeOrder.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Emitido el {new Date(activeOrder.issueDate).toLocaleDateString('es-SV', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  por <strong className="text-slate-700">Farmacia Espíritu Santo</strong>
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPublicLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-600" />
                      <span>Copiar Enlace Público</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir Orden</span>
                </button>
              </div>
            </div>

            {/* Cuadrícula de 2 Columnas: Datos y Formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Información de Entrega y Proveedor */}
              <div className="space-y-4">
                {/* Datos del Proveedor Destinatario */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Proveedor / Laboratorio Asignado
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">{activeOrder.supplierName}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {activeOrder.supplierPhone}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {activeOrder.supplierEmail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Token de Autenticación:{' '}
                      <strong className="font-mono text-emerald-700 font-bold">
                        {activeOrder.accessCode}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Destino de la Entrega (Farmacia) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Lugar y Condiciones de Recepción
                  </h3>
                  <div className="space-y-1 text-xs">
                    <p className="font-black text-slate-800">{activeOrder.branchName}</p>
                    <p className="text-slate-600">{currentBranch.address}</p>
                    <p className="text-slate-600">Teléfono Bodega: {currentBranch.phone}</p>
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-medium border border-emerald-100">
                      🕒 <strong>Horario de Recepción:</strong> Lunes a Sábado de 8:00 AM a 5:00 PM.
                    </div>
                  </div>
                </div>

                {/* Resumen Económico */}
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
                  <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
                    Total Estimado de la Orden
                  </p>
                  <p className="text-3xl font-black font-mono tracking-tight text-white">
                    ${activeOrder.totalEstimated.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-emerald-200">
                    {activeOrder.items.length} productos farmacéuticos solicitados
                  </p>
                </div>
              </div>

              {/* Columna Central/Derecha: Detalle de Medicamentos & Formulario de Despacho */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tabla de Medicamentos Solicitados */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      Medicamentos Solicitados para Despacho
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {activeOrder.items.reduce((acc, it) => acc + it.quantityRequested, 0)} unidades en total
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                          <th className="py-3 px-4">Medicamento / Principio Activo</th>
                          <th className="py-3 px-3">Código de Barra</th>
                          <th className="py-3 px-3">Presentación</th>
                          <th className="py-3 px-3 text-center">Cantidad Solicitada</th>
                          <th className="py-3 px-4 text-right">Costo Unit.</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <p className="font-extrabold text-slate-800">{item.productName}</p>
                              {item.genericName && (
                                <p className="text-[11px] text-slate-500">{item.genericName}</p>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                <Barcode className="w-3 h-3 text-slate-400" />
                                {item.barcode}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-[11px]">
                              {item.presentation}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-xs">
                                {item.quantityRequested} unids
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">
                              ${item.estimatedUnitCost.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                              ${item.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Formulario de Confirmación y Despacho para el Proveedor */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest">
                        ACCIÓN DEL PROVEEDOR
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        Confirmar y Actualizar Estado del Despacho
                      </h3>
                    </div>
                    <Truck className="w-5 h-5 text-emerald-600" />
                  </div>

                  <form onSubmit={handleUpdateDispatch} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Estado Actual del Pedido por el Laboratorio <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={dispatchStatus}
                        onChange={(e) => setDispatchStatus(e.target.value as SupplierOrderStatus)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="IN_PREPARATION">
                          📦 Pedido Aceptado — En Preparación / Bodega
                        </option>
                        <option value="SHIPPED">
                          🚚 Pedido Despachado — En Ruta hacia Farmacia Espíritu Santo
                        </option>
                        <option value="DELIVERED">
                          ✅ Pedido Entregado en Sucursal
                        </option>
                        <option value="CANCELLED">
                          ❌ Cancelar Pedido (Sin existencias en inventario)
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          N° Factura o Remisión del Proveedor
                        </label>
                        <input
                          type="text"
                          placeholder="ej. FAC-VIJ-2026-1049"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Fecha y Hora Estimada de Llegada a Farmacia
                        </label>
                        <input
                          type="datetime-local"
                          value={estimatedArrival}
                          onChange={(e) => setEstimatedArrival(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Transportista / Conductor Asignado
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Juan Carlos Quintanilla"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Teléfono del Conductor / Despacho
                        </label>
                        <input
                          type="text"
                          placeholder="ej. +503 7123-4567"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Observaciones para la Farmacia
                      </label>
                      <textarea
                        rows={2}
                        placeholder="ej. Mercadería completa, lote LOTE-ACT-2027 asignado con cadena de frío garantizada."
                        value={supplierNotes}
                        onChange={(e) => setSupplierNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-slate-500">
                        La confirmación se registrará en el sistema central de Farmacia Espíritu Santo.
                      </span>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Confirmar Despacho a Farmacia</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-300 mx-auto" />
            <h2 className="text-lg font-black text-slate-800">
              Ingrese el Código de Acceso del Pedido
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilice el código único de seguimiento enviado por Farmacia Espíritu Santo (ejemplo:{' '}
              <strong className="text-emerald-700 font-mono">PROV-VIJOSA-7892</strong>) en la barra superior para consultar el pedido.
            </p>
          </div>
        )}
      </main>

      {/* Footer Público */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          © {new Date().getFullYear()} Farmacia Espíritu Santo • Sistema de Gestión y Portal de Proveedores B2B
        </p>
      </footer>
    </div>
  );
}

export default function PublicSupplierPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500">
          Cargando Portal de Proveedores...
        </div>
      }
    >
      <PublicSupplierPortalContent />
    </Suspense>
  );
}
