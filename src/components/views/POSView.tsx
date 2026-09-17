'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Printer,
  CheckCircle,
  AlertTriangle,
  User,
  X,
  Package,
  PackagePlus,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product, PaymentMethod, Sale } from '../../types/pharmacy';

export const POSView: React.FC<{ onNavigate?: (view: any) => void }> = ({ onNavigate }) => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    updateCartDiscount,
    removeFromCart,
    clearCart,
    getCartTotals,
    processSale,
    getAvailableStock,
    getNextExpiringBatch,
    currentCashSession,
    settings,
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customerName, setCustomerName] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.genericName && p.genericName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const match = products.find((p) => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase());
      if (match) {
        const result = addToCart(match);
        if (result.success) {
          showToast(`+1 ${match.name}`);
          setSearchQuery('');
        } else {
          showToast(result.message, 'error');
        }
      } else if (filteredProducts.length === 1) {
        const result = addToCart(filteredProducts[0]);
        if (result.success) {
          showToast(`+1 ${filteredProducts[0].name}`);
          setSearchQuery('');
        } else {
          showToast(result.message, 'error');
        }
      }
    }
  };

  const totals = getCartTotals();
  const numAmountPaid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, numAmountPaid - totals.total);

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    setAmountPaid(totals.total.toFixed(2));
    setPaymentModalOpen(true);
  };

  const handleConfirmSale = () => {
    const result = processSale({
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? numAmountPaid : totals.total,
      customerName: customerName || 'Cliente Mostrador',
    });

    if (result.success && result.sale) {
      setLastSale(result.sale);
      setPaymentModalOpen(false);
      setReceiptModalOpen(true);
      setCustomerName('');
      setAmountPaid('');
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-fade-in border ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
              : 'bg-red-600 text-white border-red-500 shadow-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* LADO IZQUIERDO: Catálogo y Búsqueda */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-200 bg-slate-50/50">
        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Buscar por medicamento, principio activo o escanear código de barras..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('cat-01')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'cat-01'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Analgésicos
            </button>
            <button
              onClick={() => setSelectedCategory('cat-02')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'cat-02'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Antibióticos
            </button>
            <button
              onClick={() => setSelectedCategory('cat-03')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'cat-03'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Cardio
            </button>
            <button
              onClick={() => setSelectedCategory('cat-06')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'cat-06'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Vitaminas
            </button>
          </div>
        </div>

        {/* Grid de Productos en Blanco */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Catálogo de Medicamentos Vacío</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                El sistema está limpio y listo para operar. Escanea un código de barras o registra tus medicamentos reales con su lote inicial.
              </p>
              <button
                type="button"
                onClick={() => onNavigate?.('new-product')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-all"
              >
                <PackagePlus className="w-4 h-4" />
                <span>+ Ingresar Primer Medicamento</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const stock = getAvailableStock(product.id);
                const nextBatch = getNextExpiringBatch(product.id);
                const isOutOfStock = stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        const res = addToCart(product);
                        if (res.success) showToast(`+1 ${product.name}`);
                        else showToast(res.message, 'error');
                      }
                    }}
                    className={`bg-white border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                      isOutOfStock
                        ? 'border-slate-200 opacity-45 cursor-not-allowed'
                        : 'border-slate-200/80 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {product.sku}
                        </span>
                        {product.requiresPrescription && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Receta
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug mt-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {product.genericName || product.presentation}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-700'
                              : stock <= product.minStock
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          Stock: {stock}
                        </span>
                      </div>

                      {nextBatch && (
                        <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                          <span className="truncate">Lote: {nextBatch.batchNumber}</span>
                          <span className="text-emerald-700 font-semibold">
                            Vence: {new Date(nextBatch.expirationDate).toLocaleDateString('es-SV', { month: '2-digit', year: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: Carrito de Venta POS Blanco y Verde */}
      <div className="w-full lg:w-96 bg-white flex flex-col h-full border-l border-slate-200 shadow-sm">
        {/* Cabecera del Carrito */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/40">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Ticket de Venta Actual
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Selector de Cliente */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Cliente: Mostrador / General"
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Lista de Items en Carrito */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
              <Barcode className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
              <p>Escanea un producto o selecciónalo del catálogo</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {item.product.name}
                    </h4>
                    {item.allocatedBatch && (
                      <span className="text-[10px] text-emerald-700 font-mono">
                        FEFO: {item.allocatedBatch.batchNumber} (Vence: {item.allocatedBatch.expirationDate})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                  {/* Control de Cantidad */}
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-slate-900 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-700 font-mono">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ${item.unitPrice.toFixed(2)} c/u
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Totales y Botón Cobrar Verde */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-900">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento:</span>
                <span className="font-mono">-${totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Impuesto (0% exento):</span>
              <span className="font-mono text-slate-900">$0.00</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
              <span>Total a Pagar:</span>
              <span className="text-emerald-700 text-xl font-mono font-black">${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200 cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>COBRAR (${totals.total.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Procesar Pago</span>
              </h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total a Pagar Destacado */}
            <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100">
              <span className="text-xs text-emerald-800 uppercase tracking-wider font-bold">Total a Pagar</span>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-0.5">
                ${totals.total.toFixed(2)}
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tarjeta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Transfer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'Transfer'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transferencia</span>
                </button>
              </div>
            </div>

            {/* Cálculo de Cambio en Efectivo */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Monto Entregado por Cliente</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>

                <div className="flex gap-1.5">
                  {[5, 10, 20, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountPaid(val.toString())}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700 border border-slate-200 shadow-sm"
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmountPaid(totals.total.toFixed(2))}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold"
                  >
                    Exacto
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600 font-bold">Cambio / Vuelto:</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmSale}
              disabled={paymentMethod === 'Cash' && numAmountPaid < totals.total}
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                paymentMethod !== 'Cash' || numAmountPaid >= totals.total
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>CONFIRMAR Y EMITIR TICKET</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE RECIBO / FACTURA TÉRMICA */}
      {receiptModalOpen && lastSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-3 font-mono text-xs border border-slate-200">
            {/* Header del Ticket */}
            <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
              <h3 className="font-extrabold text-sm uppercase text-emerald-900">{settings.pharmacyName}</h3>
              <p className="text-[10px] text-gray-700">{lastSale.branchName}</p>
              <p className="text-[10px] text-gray-700">NIT: {settings.taxNumber} • Tel: {settings.phone}</p>
              <div className="font-bold text-xs pt-1 text-black">FACTURA: {lastSale.invoiceNumber}</div>
              <div className="text-[10px] text-gray-600">
                {new Date(lastSale.createdAt).toLocaleString('es-SV')}
              </div>
              <div className="text-[10px] text-gray-600">Cajero: {lastSale.userName}</div>
              <div className="text-[10px] text-gray-600">Cliente: {lastSale.customerName}</div>
            </div>

            {/* Detalle de Artículos y Lotes */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-gray-400">
              {lastSale.items.map((it, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between font-bold">
                    <span className="truncate">{it.productName}</span>
                    <span>${it.total.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 flex justify-between">
                    <span>{it.quantity} x ${it.unitPrice.toFixed(2)} (Lote: {it.batchNumber})</span>
                    <span>Vence: {it.expirationDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-1 text-right text-xs pt-1 border-b border-dashed border-gray-400 pb-2">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>${lastSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-emerald-900">
                <span>TOTAL A PAGAR:</span>
                <span>${lastSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>FORMA DE PAGO:</span>
                <span>{lastSale.paymentMethod}</span>
              </div>
              {lastSale.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span>RECIBIDO:</span>
                    <span>${lastSale.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>CAMBIO:</span>
                    <span>${lastSale.changeAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Mensaje de Despedida */}
            <div className="text-center text-[10px] text-gray-700 pt-2 leading-tight">
              {settings.ticketFooter}
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 pt-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-emerald-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-800 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-800 py-2 rounded-xl font-bold hover:bg-slate-200"
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
