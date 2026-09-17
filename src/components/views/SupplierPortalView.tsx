'use client';

import React, { useState } from 'react';
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
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Send,
  Boxes,
  ExternalLink,
  Info,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { SupplierOrder, SupplierOrderStatus } from '../../types/pharmacy';

export const SupplierPortalView: React.FC = () => {
  const {
    supplierOrders,
    suppliers,
    currentBranch,
    settings,
    updateOrderStatusBySupplier,
  } = usePharmacy();

  // Filtro por proveedor o código de acceso
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('ALL');
  const [accessCodeSearch, setAccessCodeSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal de actualización de despacho
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<SupplierOrder | null>(null);
  const [modalStatus, setModalStatus] = useState<SupplierOrderStatus>('IN_PREPARATION');
  const [modalInvoice, setModalInvoice] = useState<string>('');
  const [modalDeliveryDate, setModalDeliveryDate] = useState<string>('');
  const [modalDriver, setModalDriver] = useState<string>('');
  const [modalDriverPhone, setModalDriverPhone] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalActor, setModalActor] = useState<string>('');

  // Modal de vista de impresión / orden oficial
  const [viewingOrderPrint, setViewingOrderPrint] = useState<SupplierOrder | null>(null);

  // Filtrado de órdenes
  const filteredOrders = supplierOrders.filter((order) => {
    // Filtro por proveedor
    if (selectedSupplierId !== 'ALL' && order.supplierId !== selectedSupplierId) {
      return false;
    }
    // Filtro por código de acceso o número de orden
    if (accessCodeSearch.trim()) {
      const q = accessCodeSearch.toLowerCase().trim();
      const matchCode = order.accessCode.toLowerCase().includes(q);
      const matchOrder = order.orderNumber.toLowerCase().includes(q);
      const matchSupplier = order.supplierName.toLowerCase().includes(q);
      if (!matchCode && !matchOrder && !matchSupplier) return false;
    }
    // Filtro por estado
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Métricas
  const pendingCount = supplierOrders.filter((o) => o.status === 'PENDING_REVIEW').length;
  const inPrepCount = supplierOrders.filter((o) => o.status === 'IN_PREPARATION').length;
  const shippedCount = supplierOrders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = supplierOrders.filter((o) => o.status === 'DELIVERED').length;
  const totalVolume = supplierOrders.reduce((sum, o) => sum + o.totalEstimated, 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openUpdateModal = (order: SupplierOrder) => {
    setSelectedOrderForUpdate(order);
    setModalStatus(order.status === 'PENDING_REVIEW' ? 'IN_PREPARATION' : order.status);
    setModalInvoice(order.supplierInvoiceNumber || '');
    setModalDeliveryDate(order.estimatedDeliveryDate ? order.estimatedDeliveryDate.slice(0, 16) : '');
    setModalDriver(order.deliveryDriver || '');
    setModalDriverPhone(order.driverPhone || '');
    setModalNotes(order.supplierNotes || '');
    setModalActor(order.supplierName);
  };

  const handleSaveSupplierUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForUpdate) return;

    updateOrderStatusBySupplier({
      orderId: selectedOrderForUpdate.id,
      newStatus: modalStatus,
      supplierInvoiceNumber: modalInvoice.trim() || undefined,
      estimatedDeliveryDate: modalDeliveryDate || undefined,
      deliveryDriver: modalDriver.trim() || undefined,
      driverPhone: modalDriverPhone.trim() || undefined,
      supplierNotes: modalNotes.trim() || undefined,
      actor: modalActor.trim() || selectedOrderForUpdate.supplierName,
    });

    setSelectedOrderForUpdate(null);
  };

  const getStatusBadge = (status: SupplierOrderStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            Pendiente de Revisión
          </span>
        );
      case 'IN_PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Boxes className="w-3.5 h-3.5 text-blue-600" />
            En Preparación / Bodega
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm shadow-emerald-100">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            Despachado / En Ruta
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Entregado en Sucursal
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Cancelado
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: 'NORMAL' | 'URGENTE' | 'CRITICO') => {
    switch (urgency) {
      case 'CRITICO':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
            🚨 Despacho Crítico
          </span>
        );
      case 'URGENTE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white">
            ⚡ Urgente
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
            Prioridad Regular
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Banner B2B Institucional */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-6 py-4 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
              <Truck className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-400/30 uppercase tracking-widest">
                  PORTAL B2B PROVEEDORES
                </span>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Conexión Directa Segura
                </span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Gestión de Pedidos & Órdenes para Proveedores
              </h1>
              <p className="text-xs text-emerald-100">
                Cliente Comprador: <strong className="text-white">Farmacia Espíritu Santo</strong> — {currentBranch.name} ({currentBranch.code})
              </p>
            </div>
          </div>

          {/* Selector de Acceso Directo por Proveedor y Enlace Público */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/portal-proveedores"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm"
              title="Abrir página pública que ven los proveedores sin ingresar a la farmacia"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Portal Público (/portal-proveedores)</span>
            </a>

            <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-100 whitespace-nowrap hidden sm:inline">
                Proveedor:
              </span>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="bg-white text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-400 outline-none border-0 shadow-sm"
              >
                <option value="ALL">🏢 Ver Todos (Modo Central)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal con Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Tarjetas de Métricas B2B */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Por Revisar</p>
              <p className="text-xl font-black text-amber-700">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En Bodega</p>
              <p className="text-xl font-black text-blue-700">{inPrepCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">En Ruta</p>
              <p className="text-xl font-black text-emerald-700">{shippedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entregados</p>
              <p className="text-xl font-black text-slate-700">{deliveredCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm col-span-2 md:col-span-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-base">
              $
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pedidos</p>
              <p className="text-xl font-black text-slate-800">${totalVolume.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros de Estado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por N° de orden (ORD-...), código de acceso o producto..."
              value={accessCodeSearch}
              onChange={(e) => setAccessCodeSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Estado:</span>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'PENDING_REVIEW', label: 'Por Revisar' },
              { id: 'IN_PREPARATION', label: 'En Preparación' },
              { id: 'SHIPPED', label: 'En Ruta' },
              { id: 'DELIVERED', label: 'Entregados' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Órdenes de Pedido */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">
                No se encontraron pedidos con los filtros aplicados
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Verifique el proveedor seleccionado o el código de acceso ingresado en el buscador.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Cabecera de la Orden */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-black text-slate-800 font-mono tracking-tight">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                    {getUrgencyBadge(order.urgency)}
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Emitido:{' '}
                      {new Date(order.issueDate).toLocaleDateString('es-SV', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Acciones de Cabecera */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón para Abrir Vista Pública del Proveedor */}
                    <a
                      href={`/portal-proveedores?codigo=${order.accessCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all"
                      title="Abrir enlace público directo de este pedido"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Link Público</span>
                    </a>

                    {/* Código de Acceso Único */}
                    <button
                      onClick={() => handleCopyCode(order.accessCode)}
                      title="Copiar código de acceso exclusivo para el proveedor"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-50 transition-colors"
                    >
                      {copiedCode === order.accessCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{order.accessCode}</span>
                    </button>

                    <button
                      onClick={() => setViewingOrderPrint(order)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Hoja de Bodega</span>
                    </button>

                    <button
                      onClick={() => openUpdateModal(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-200 transition-all hover:scale-[1.02]"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Gestionar Despacho</span>
                    </button>
                  </div>
                </div>

                {/* Cuerpo de la Orden */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna Izquierda: Datos del Proveedor y Destino */}
                  <div className="space-y-4">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Laboratorio / Proveedor Solicitado:
                      </div>
                      <p className="text-sm font-black text-slate-800">{order.supplierName}</p>
                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.supplierPhone}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.supplierEmail}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        Destino de Entrega (Farmacia):
                      </div>
                      <p className="text-xs font-bold text-slate-800">{order.branchName}</p>
                      <p className="text-xs text-slate-500">
                        Recepción de mercadería en horario de 8:00 AM a 5:00 PM.
                      </p>
                    </div>

                    {/* Datos de Despacho registrados por el proveedor */}
                    {(order.supplierInvoiceNumber || order.estimatedDeliveryDate || order.deliveryDriver) && (
                      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1.5">
                        <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600" />
                          Información de Despacho Ingresada:
                        </p>
                        {order.supplierInvoiceNumber && (
                          <p className="text-xs text-slate-700">
                            <strong>N° Factura Proveedor:</strong>{' '}
                            <span className="font-mono text-emerald-800 font-bold">
                              {order.supplierInvoiceNumber}
                            </span>
                          </p>
                        )}
                        {order.estimatedDeliveryDate && (
                          <p className="text-xs text-slate-700">
                            <strong>Llegada Estimada:</strong>{' '}
                            {new Date(order.estimatedDeliveryDate).toLocaleString('es-SV')}
                          </p>
                        )}
                        {order.deliveryDriver && (
                          <p className="text-xs text-slate-700">
                            <strong>Transportista:</strong> {order.deliveryDriver}
                          </p>
                        )}
                        {order.supplierNotes && (
                          <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded mt-1 border border-amber-100">
                            "{order.supplierNotes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha: Detalle de Medicamentos Solicitados */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        Medicamentos e Insumos Requeridos ({order.items.length} ítems)
                      </h4>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Total Estimado: <strong className="text-emerald-700 text-sm">${order.totalEstimated.toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                            <th className="py-2.5 px-3">Medicamento</th>
                            <th className="py-2.5 px-3">Código de Barra</th>
                            <th className="py-2.5 px-3">Presentación</th>
                            <th className="py-2.5 px-3 text-center">Cant. Solicitada</th>
                            <th className="py-2.5 px-3 text-right">Costo Est.</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3">
                                <p className="font-bold text-slate-800">{item.productName}</p>
                                {item.genericName && (
                                  <p className="text-[11px] text-slate-500">{item.genericName}</p>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                                {item.barcode}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                {item.presentation}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-md text-xs">
                                  {item.quantityRequested} unids
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                                ${item.estimatedUnitCost.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                ${item.subtotal.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bitácora de Movimientos de la Orden */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Historial de Estados y Comunicaciones:
                      </p>
                      <div className="space-y-1.5 text-xs">
                        {order.history.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div className="flex-1 text-slate-700">
                              <span className="font-bold text-slate-800">{h.actor}:</span> {h.note}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                              {new Date(h.timestamp).toLocaleTimeString('es-SV', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL PARA ACTUALIZAR ESTADO DE DESPACHO (POR EL PROVEEDOR) */}
      {selectedOrderForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 max-w-xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-200">
                  ACTUALIZACIÓN DE ESTADO POR EL PROVEEDOR
                </span>
                <h3 className="text-base font-black">
                  Despacho de Pedido {selectedOrderForUpdate.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForUpdate(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplierUpdate} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 space-y-1">
                <p className="text-xs font-bold text-emerald-900">
                  Laboratorio: {selectedOrderForUpdate.supplierName}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Farmacia Destino: {selectedOrderForUpdate.branchName} • Total Estimado: $
                  {selectedOrderForUpdate.totalEstimated.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nuevo Estado del Pedido <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as SupplierOrderStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="IN_PREPARATION">📦 En Preparación / Embalaje en Bodega</option>
                  <option value="SHIPPED">🚚 Despachado / En Ruta hacia Farmacia</option>
                  <option value="DELIVERED">✅ Entregado y Recibido Conforme en Farmacia</option>
                  <option value="CANCELLED">❌ Cancelar Pedido (Sin stock disponible)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    N° Factura o Remisión del Proveedor
                  </label>
                  <input
                    type="text"
                    placeholder="ej. FAC-VIJ-2026-901"
                    value={modalInvoice}
                    onChange={(e) => setModalInvoice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Fecha y Hora Estimada de Llegada
                  </label>
                  <input
                    type="datetime-local"
                    value={modalDeliveryDate}
                    onChange={(e) => setModalDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Transportista / Conductor
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Juan Pérez (Camión #3)"
                    value={modalDriver}
                    onChange={(e) => setModalDriver(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Teléfono del Conductor
                  </label>
                  <input
                    type="text"
                    placeholder="ej. +503 7123-4567"
                    value={modalDriverPhone}
                    onChange={(e) => setModalDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Observaciones / Notas del Laboratorio
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Mercadería embalada completa con cadena de frío garantizada."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre del Asesor o Despachador
                </label>
                <input
                  type="text"
                  placeholder="ej. Lic. Roberto Mendoza (Despacho Vijosa)"
                  value={modalActor}
                  onChange={(e) => setModalActor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForUpdate(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Guardar y Notificar a Farmacia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HOJA DE BODEGA / PREPARACIÓN DE PEDIDO (IMPRIMIBLE) */}
      {viewingOrderPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header del comprobante */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Hoja Oficial de Picking & Preparación de Pedido
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Hoja
                </button>
                <button
                  onClick={() => setViewingOrderPrint(null)}
                  className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Documento Imprimible */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
              <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4">
                <div>
                  <h2 className="text-lg font-black text-emerald-900">
                    FARMACIA ESPÍRITU SANTO
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">{currentBranch.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {currentBranch.address} • Tel: {currentBranch.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-black text-sm">
                    {viewingOrderPrint.orderNumber}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Código de Consulta: <strong>{viewingOrderPrint.accessCode}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Fecha: {new Date(viewingOrderPrint.issueDate).toLocaleDateString('es-SV')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">PROVEEDOR / LABORATORIO:</p>
                  <p className="text-sm font-black text-slate-800">{viewingOrderPrint.supplierName}</p>
                  <p className="text-xs text-slate-600">{viewingOrderPrint.supplierPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">CONDICIONES DE RECEPCIÓN:</p>
                  <p className="text-xs text-slate-700">
                    <strong>Entrega en:</strong> {viewingOrderPrint.branchName}
                  </p>
                  <p className="text-xs text-slate-700">
                    <strong>Prioridad:</strong> {viewingOrderPrint.urgency}
                  </p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="border border-slate-300 p-2 w-10 text-center">Check</th>
                    <th className="border border-slate-300 p-2 text-left">Medicamento / Descripción</th>
                    <th className="border border-slate-300 p-2 text-left">Código de Barra</th>
                    <th className="border border-slate-300 p-2 text-center">Cantidad</th>
                    <th className="border border-slate-300 p-2 text-left">Lote Asignado</th>
                    <th className="border border-slate-300 p-2 text-left">Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrderPrint.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center">
                        <div className="w-4 h-4 border-2 border-slate-400 rounded mx-auto" />
                      </td>
                      <td className="border border-slate-300 p-2 font-bold text-slate-800">
                        {item.productName}
                        <span className="block font-normal text-[11px] text-slate-500">
                          {item.presentation}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 font-mono text-slate-600">
                        {item.barcode}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-extrabold text-emerald-800">
                        {item.quantityRequested}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-400 italic">
                        [ Escribir Lote ]
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-400 italic">
                        [ MM/AAAA ]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Despachado Por (Laboratorio)</p>
                  <p className="text-slate-500 text-[11px]">Firma y Sello de Bodega</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Recibido Por (Farmacia Espíritu Santo)</p>
                  <p className="text-slate-500 text-[11px]">Firma y Sello de Recepción</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
