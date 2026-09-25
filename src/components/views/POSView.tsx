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
  Check,
  AlertTriangle,
  User,
  X,
  Package,
  PackagePlus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Tag,
  Layers,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product, PaymentMethod, Sale } from '../../types/pharmacy';

export const POSView: React.FC<{ onNavigate?: (view: any) => void }> = ({ onNavigate }) => {
  const {
    openProductDetail,
    products,
    categories,
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

  // Modo de pestaña en teléfonos móviles (catálogo vs carrito)
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Función de normalización insensible a mayúsculas, tildes y espacios
  const normalize = (str?: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const filteredProducts = products.filter((p) => {
    if (p.isActive === false) return false;

    // Filtro por categoría
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
      return false;
    }

    // Si no hay texto de búsqueda, mostrar todos
    if (!searchQuery || !searchQuery.trim()) {
      return true;
    }

    const queryNorm = normalize(searchQuery);
    const rawQuery = searchQuery.trim().toLowerCase();

    const nameNorm = normalize(p.name);
    const genericNorm = normalize(p.genericName);
    const skuNorm = normalize(p.sku);
    const barcodeRaw = (p.barcode || '').trim().toLowerCase();
    const labNorm = normalize(p.laboratoryName);
    const presNorm = normalize(p.presentation);

    return (
      nameNorm.includes(queryNorm) ||
      genericNorm.includes(queryNorm) ||
      skuNorm.includes(queryNorm) ||
      barcodeRaw.includes(rawQuery) ||
      labNorm.includes(queryNorm) ||
      presNorm.includes(queryNorm)
    );
  });

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      const match = products.find(
        (p) =>
          (p.barcode && p.barcode.trim().toLowerCase() === q) ||
          (p.sku && p.sku.trim().toLowerCase() === q)
      );

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
          showToast(`+1 ${filteredProducts[0]?.name || 'Medicamento'}`);
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
      setMobileTab('catalog'); // Volver al catálogo en móvil tras cobrar
      showToast(result.message, 'success');
    } else {
      showToast(result.message || 'Error al procesar la venta', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50 text-slate-800 relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-fade-in border ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
              : 'bg-red-600 text-white border-red-500 shadow-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SELECTOR DE PESTAÑAS EN MÓVIL (PANTALLAS PEQUEÑAS) */}
      <div className="lg:hidden p-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            Carrito ({cart.reduce((sum, i) => sum + i.quantity, 0)}) • {settings.currencySymbol}{' '}
            {totals.total.toFixed(2)}
          </span>
        </button>
      </div>

      {/* LADO IZQUIERDO: Catálogo y Búsqueda */}
      <div
        className={`flex-1 flex-col p-3 sm:p-4 overflow-hidden border-r border-slate-200 bg-slate-50/50 ${
          mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Barra de Búsqueda y Filtros */}
        <div className="space-y-2 mb-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Buscar por nombre, código de barra, SKU, o principio activo..."
              className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categorías Dinámicas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              if (count === 0 && selectedCategory !== cat.id) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto pr-1 pb-20 lg:pb-2">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                No se encontraron medicamentos con &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Prueba buscando por otra palabra clave, código de barra o selecciona la categoría &quot;Todos&quot;.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 cursor-pointer"
                >
                  Limpiar Búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map((product) => {
                const stock = getAvailableStock(product.id);
                const nextBatch = getNextExpiringBatch(product.id);
                const isOutOfStock = stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (product.salePrice <= 0) {
                        openProductDetail(product);
                        showToast(`Configura el precio de venta para ${product.name}`, 'error');
                        return;
                      }
                      const res = addToCart(product);
                      if (res.success) showToast(`+1 ${product.name}`);
                      else showToast(res.message, 'error');
                    }}
                    className={`bg-white border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-95 select-none ${
                      isOutOfStock
                        ? 'border-slate-200 opacity-60 hover:border-slate-300'
                        : 'border-slate-200/90 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 shadow-2xs'
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
                        {product.genericName || product.presentation || 'Medicamento'}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        {product.salePrice > 0 ? (
                          <span className="text-sm font-black text-emerald-950 font-mono">
                            {settings.currencySymbol} {(product.salePrice || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            ⚠️ Falta Precio
                          </span>
                        )}
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

                      {product.barcode && (
                        <div className="text-[9px] text-slate-400 font-mono mt-1 truncate">
                          Barra: {product.barcode}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BARRA FLOTANTE EN MÓVIL CUANDO HAY ITEMS EN CARRITO */}
        {cart.length > 0 && mobileTab === 'catalog' && (
          <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom duration-200">
            <div>
              <div className="text-[10px] text-emerald-300 font-bold uppercase">
                Carrito: {cart.reduce((sum, i) => sum + i.quantity, 0)} item(s)
              </div>
              <div className="text-base font-black text-white font-mono">
                {settings.currencySymbol} {totals.total.toFixed(2)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileTab('cart')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/50 cursor-pointer active:scale-95"
            >
              <span>Ver Carrito & Cobrar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* LADO DERECHO: Carrito de Venta POS */}
      <div
        className={`w-full lg:w-96 bg-white flex-col h-full border-l border-slate-200 shadow-sm ${
          mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Cabecera del Carrito */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/40 shrink-0">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Ticket de Venta Actual
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Botón Volver al Catálogo en Móvil */}
        <div className="lg:hidden p-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('catalog')}
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>⬅️ Seguir Buscando Medicamentos</span>
          </button>
        </div>

        {/* Selector de Cliente */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-[10px] text-slate-500">
                      {settings.currencySymbol} {item.unitPrice.toFixed(2)} c/u
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold font-mono text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right font-mono font-black text-emerald-950 text-sm">
                    {settings.currencySymbol} {(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Totales y Botón de Cobro */}
        <div className="p-3.5 bg-white border-t border-slate-200 space-y-3 shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">
                {settings.currencySymbol} {totals.subtotal.toFixed(2)}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Descuento:</span>
                <span className="font-mono">
                  - {settings.currencySymbol} {totals.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
              <span className="font-black text-sm text-slate-900">TOTAL A COBRAR:</span>
              <div className="text-right">
                <div className="text-xl font-black text-emerald-900 font-mono">
                  {settings.currencySymbol} {totals.total.toFixed(2)}
                </div>
                
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer active:scale-98"
          >
            <Banknote className="w-4 h-4" />
            <span>COBRAR ({settings.currencySymbol} {totals.total.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-300" />
                <h3 className="font-black text-sm">Completar Cobro & Facturación</h3>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="text-center p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-black uppercase">
                  Total a Pagar
                </span>
                <div className="text-3xl font-black text-emerald-950 font-mono mt-0.5">
                  {settings.currencySymbol} {totals.total.toFixed(2)}
                </div>
              </div>

              {/* Forma de Pago */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Forma de Pago:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'Card'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transfer')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'Transfer'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Monto Recibido si es Efectivo */}
              {paymentMethod === 'Cash' && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Monto Entregado por Cliente:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-emerald-300 rounded-xl text-lg font-black font-mono text-slate-900 focus:outline-none focus:bg-white"
                  />

                  {/* Vuelto / Cambio */}
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-600">Cambio / Vuelto:</span>
                    <span
                      className={`text-xl font-black font-mono ${
                        change >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {settings.currencySymbol} {change.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSale}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 cursor-pointer transition-all active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>CONFIRMAR Y EMITIR TICKET</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPROBANTE / TICKET FINALIZADO */}
      {receiptModalOpen && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-700 text-white p-4 text-center">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-200 mb-1" />
              <h3 className="font-black text-base">¡Venta Completada!</h3>
              <p className="text-[10px] text-emerald-100">
                {lastSale.invoiceNumber} • {new Date(lastSale.createdAt).toLocaleTimeString('es-SV')}
              </p>
            </div>

            <div className="p-4 space-y-3 text-xs max-h-72 overflow-y-auto font-mono">
              <div className="text-center pb-2 border-b border-dashed border-slate-200">
                <div className="font-black text-slate-900 font-sans">
                  FARMACIA ESPÍRITU SANTO
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  {lastSale.branchName}
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                {(lastSale.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[180px]">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-bold">
                      {settings.currencySymbol} {item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-black text-sm text-slate-900">
                  <span>TOTAL:</span>
                  <span>{settings.currencySymbol} {lastSale.totalAmount.toFixed(2)}</span>
                </div>
                {lastSale.paymentMethod === 'Cash' && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Cambio Entregado:</span>
                    <span>{settings.currencySymbol} {lastSale.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptModalOpen(false);
                  setLastSale(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer text-center"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
