'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Truck,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Printer,
  PackageCheck,
  AlertCircle,
  Building,
  Filter,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { PurchaseInvoice, PurchaseItemDetail } from '../../types/pharmacy';

export const PurchasesView: React.FC<{
  onNavigateToSuppliers?: () => void;
  onNavigateToSupplierPortal?: () => void;
}> = ({ onNavigateToSuppliers, onNavigateToSupplierPortal }) => {
  const { purchases, suppliers, products, currentBranch, addPurchase, supplierOrders, settings } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario de nueva compra
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-PROV-${Math.floor(10000 + Math.random() * 90000)}`);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerm, setPaymentTerm] = useState<'Contado' | 'Credito 15 dias' | 'Credito 30 dias' | 'Credito 45 dias'>('Credito 30 dias');
  const [notes, setNotes] = useState('');

  // Items de compra en el formulario
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemDetail[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || 'Medicamento',
      barcode: products[0]?.barcode || '750100100001',
      batchNumber: `LOTE-${new Date().getFullYear()}-01`,
      expirationDate: '2028-06-30',
      quantityOrdered: 100,
      quantityReceived: 100,
      unitCost: products[0]?.purchasePrice || 0.10,
      subtotal: (products[0]?.purchasePrice || 0.10) * 100,
    },
  ]);

  const totalCalculated = purchaseItems.reduce((sum, it) => sum + it.subtotal, 0);

  const handleAddItem = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        barcode: defaultProd.barcode,
        batchNumber: `LOTE-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
        expirationDate: '2028-12-31',
        quantityOrdered: 50,
        quantityReceived: 50,
        unitCost: defaultProd.purchasePrice,
        subtotal: defaultProd.purchasePrice * 50,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setPurchaseItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        unitCost: prod.purchasePrice,
        subtotal: next[index].quantityReceived * prod.purchasePrice,
      };
      return next;
    });
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemDetail, value: any) => {
    setPurchaseItems((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      if (field === 'quantityReceived' || field === 'unitCost') {
        const qty = field === 'quantityReceived' ? parseInt(value) || 0 : next[index].quantityReceived;
        const cost = field === 'unitCost' ? parseFloat(value) || 0 : next[index].unitCost;
        next[index].subtotal = qty * cost;
      }
      return next;
    });
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);

    addPurchase({
      invoiceNumber: invoiceNumber.trim(),
      supplierId,
      supplierName: sup?.name || 'Droguería Proveedora',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      orderDate,
      deliveryDate: orderDate,
      paymentTerm,
      paymentStatus: paymentTerm === 'Contado' ? 'Paid' : 'Pending',
      receptionStatus: 'Received',
      totalAmount: totalCalculated,
      items: purchaseItems,
      receivedBy: 'Carlos Rodríguez',
      notes: notes.trim() || 'Ingreso de pedido farmacéutico conforme.',
      createdAt: new Date().toISOString(),
    });

    setActiveTab('list');
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || p.paymentStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingDebt = purchases
    .filter((p) => p.paymentStatus === 'Pending')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Módulo de Abastecimiento • {currentBranch.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Compras Farmacéuticas y Facturas de Droguerías
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingreso oficial de pedidos a inventario con verificación de lotes, costos de compra y cuentas por pagar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onNavigateToSupplierPortal && (
            <button
              type="button"
              onClick={onNavigateToSupplierPortal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md shadow-emerald-200 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-300" />
              <span>Portal de Proveedores (B2B)</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {supplierOrders.length}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Facturas Registradas ({purchases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Registrar Compra / Factura</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Compras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras Acumuladas</div>
          <div className="text-2xl font-mono font-black text-slate-900">
            {settings.currencySymbol} {totalSpent.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {purchases.length} facturas ingresadas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuentas por Pagar (Crédito)</div>
          <div className="text-2xl font-mono font-black text-amber-700">
            {settings.currencySymbol} {pendingDebt.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-600 font-bold">
            Facturas pendientes a 30/45 días
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Droguerías Vinculadas</div>
          <div className="text-2xl font-mono font-black text-emerald-800">
            {suppliers.length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">
            Proveedores farmacéuticos activos
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inspección de Lotes</div>
          <div className="text-2xl font-mono font-black text-emerald-700 flex items-center gap-1.5">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span>100% FEFO</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Trazabilidad al ingresar almacén
          </div>
        </div>
      </div>

      {/* PESTAÑA 1: LISTADO DE COMPRAS */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Buscador y Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por N° Factura (ej. FAC-PROV-90821) o Droguería..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium shadow-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos los Estados de Pago</option>
              <option value="Paid">Facturas Pagadas</option>
              <option value="Pending">Pendientes de Pago (Crédito)</option>
            </select>
          </div>

          {/* Tabla de Facturas de Compra */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">N° Factura Proveedor</th>
                    <th className="p-3.5">Droguería / Laboratorio</th>
                    <th className="p-3.5">Fecha Pedido</th>
                    <th className="p-3.5">Condición de Pago</th>
                    <th className="p-3.5 text-center">Medicamentos</th>
                    <th className="p-3.5 text-center">Estado Pago</th>
                    <th className="p-3.5 text-right">Total Factura</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No hay facturas de compra registradas con estos filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-emerald-800">
                          {pur.invoiceNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{pur.supplierName}</div>
                          <div className="text-[10px] text-slate-400">Recepción: {pur.receivedBy}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          {pur.orderDate}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {pur.paymentTerm}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-mono font-bold text-slate-800">
                            {pur.items.length} ítems
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              pur.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {pur.paymentStatus === 'Paid' ? 'PAGADA' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                          {settings.currencySymbol} {pur.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(pur);
                              setModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-emerald-100/60 text-slate-600 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Ver Detalle de la Factura y Lotes"
                          >
                            <FileText className="w-4 h-4 text-emerald-600" />
                          </button>
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

      {/* PESTAÑA 2: REGISTRAR NUEVA COMPRA */}
      {activeTab === 'new' && (
        <form onSubmit={handleSavePurchase} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>Ingreso de Factura y Recepción de Lotes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Los medicamentos registrados se integrarán automáticamente al inventario activo con sus lotes y fechas de vencimiento para control FEFO.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Droguería / Proveedor *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.creditDays} días crédito)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">N° de Factura Impresa *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FAC-PROV-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Condición de Pago</label>
              <select
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Credito 30 dias">Crédito 30 días</option>
                <option value="Credito 45 dias">Crédito 45 días</option>
                <option value="Credito 15 dias">Crédito 15 días</option>
                <option value="Contado">Contado Inmediato</option>
              </select>
            </div>
          </div>

          {/* Tabla de Medicamentos y Lotes en la Factura */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Detalle de Medicamentos Recibidos:
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Medicamento</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {purchaseItems.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Medicamento</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.presentation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Lote Impreso</label>
                      <input
                        type="text"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Vencimiento</label>
                      <input
                        type="date"
                        value={item.expirationDate}
                        onChange={(e) => handleItemChange(idx, 'expirationDate', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-center pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Cantidad Recibida</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantityReceived}
                        onChange={(e) => handleItemChange(idx, 'quantityReceived', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Costo Unitario ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-xs text-slate-800"
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Subtotal</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">
                        {settings.currencySymbol} {item.subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      {purchaseItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Factura de Compra
              </span>
              <span className="text-2xl font-mono font-black text-emerald-950">
                {settings.currencySymbol} {totalCalculated.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Factura e Ingresar al Inventario</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal de Detalle de Factura */}
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <div className="font-black text-sm text-emerald-800 tracking-wider">
                COMPROBANTE DE COMPRA FARMACÉUTICA
              </div>
              <div className="text-xs font-bold text-slate-800">{selectedInvoice.supplierName}</div>
              <div className="text-[11px] font-mono text-slate-500">Factura: {selectedInvoice.invoiceNumber}</div>
            </div>

            <div className="text-xs font-mono space-y-1 text-slate-700 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha de Pedido:</span>
                <span>{selectedInvoice.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condición:</span>
                <span>{selectedInvoice.paymentTerm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recepción:</span>
                <span>{selectedInvoice.receivedBy}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-[10px] uppercase text-slate-400 border-b border-slate-100 pb-1">
                Lotes Ingresados al Inventario
              </div>
              {selectedInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                  <div>
                    <div className="font-bold text-slate-800">{it.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      {it.quantityReceived} unids • Lote: {it.batchNumber} (Vence: {it.expirationDate})
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">
                    {settings.currencySymbol} {it.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between items-center text-sm font-bold">
              <span>TOTAL COMPRA:</span>
              <span className="text-xl font-mono font-black text-emerald-700">
                {settings.currencySymbol} {selectedInvoice.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Detalle</span>
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
