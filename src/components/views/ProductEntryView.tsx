'use client';

import React, { useState } from 'react';
import {
  PackagePlus,
  Barcode,
  Sparkles,
  Layers,
  DollarSign,
  Calendar,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  List,
  RefreshCw,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

interface ProductEntryViewProps {
  onNavigateToCatalog?: () => void;
}

export const ProductEntryView: React.FC<ProductEntryViewProps> = ({ onNavigateToCatalog }) => {
  const {
    products,
    categories,
    suppliers,
    currentBranch,
    addProduct,
    settings,
  } = usePharmacy();

  // Estados del Formulario de Medicamento
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [sku, setSku] = useState(`MED-${String(products.length + 1).padStart(3, '0')}`);
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [laboratory, setLaboratory] = useState('Laboratorios Vijosa');
  const [presentation, setPresentation] = useState('Caja con 30 Tabletas');
  const [concentration, setConcentration] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('Unidad');

  // Precios y Margen
  const [purchasePrice, setPurchasePrice] = useState('0.10');
  const [marginPercent, setMarginPercent] = useState('50');
  const [salePrice, setSalePrice] = useState('0.15');
  const [minStock, setMinStock] = useState('20');
  const [maxStock, setMaxStock] = useState('200');

  // Control médico
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [isControlled, setIsControlled] = useState(false);

  // Lote de Entrada Inicial
  const [batchNumber, setBatchNumber] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expirationDate, setExpirationDate] = useState('2028-12-31');
  const [initialQuantity, setInitialQuantity] = useState('100');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');

  // Estado de Confirmación
  const [lastSaved, setLastSaved] = useState<{ name: string; sku: string; qty: number; batch: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Autocalcular precio de venta según margen
  const handlePurchasePriceChange = (val: string) => {
    setPurchasePrice(val);
    const cost = parseFloat(val) || 0;
    const margin = parseFloat(marginPercent) || 0;
    const calculated = cost * (1 + margin / 100);
    setSalePrice(calculated.toFixed(2));
  };

  const handleMarginChange = (val: string) => {
    setMarginPercent(val);
    const cost = parseFloat(purchasePrice) || 0;
    const margin = parseFloat(val) || 0;
    const calculated = cost * (1 + margin / 100);
    setSalePrice(calculated.toFixed(2));
  };

  // Generar código de barras aleatorio
  const generateBarcode = () => {
    const randomCode = `750100${Math.floor(1000000 + Math.random() * 9000000)}`;
    setBarcode(randomCode);
  };

  // Guardar Medicamento
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === categoryId);
    const costNum = parseFloat(purchasePrice) || 0;
    const saleNum = parseFloat(salePrice) || 0;
    const qtyNum = parseInt(initialQuantity) || 0;

    addProduct(
      {
        sku: sku.trim() || `MED-${Date.now().toString().slice(-4)}`,
        barcode: barcode.trim() || `750${Date.now()}`,
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        categoryId,
        categoryName: cat?.name || 'General',
        laboratoryName: laboratory,
        presentation,
        concentration: concentration.trim() || undefined,
        unitMeasure,
        purchasePrice: costNum,
        salePrice: saleNum,
        minStock: parseInt(minStock) || 10,
        maxStock: parseInt(maxStock) || 500,
        requiresPrescription,
        isControlled,
        isActive: true,
      },
      qtyNum > 0
        ? {
            batchNumber: batchNumber.trim() || `LOTE-${Date.now().toString().slice(-5)}`,
            expirationDate: expirationDate || '2028-12-31',
            quantity: qtyNum,
            unitCost: costNum,
          }
        : undefined
    );

    setLastSaved({
      name: name.trim(),
      sku: sku.trim(),
      qty: qtyNum,
      batch: batchNumber.trim(),
    });

    setToastMessage(`¡Medicamento "${name.trim()}" ingresado exitosamente con ${qtyNum} unidades en ${currentBranch.name}!`);
    setTimeout(() => setToastMessage(null), 5000);

    // Preparar el formulario para el siguiente registro
    setName('');
    setGenericName('');
    setConcentration('');
    setSku(`MED-${String(products.length + 2).padStart(3, '0')}`);
    setBarcode('');
    setBatchNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Últimos 5 productos agregados para referencia inmediata
  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header del Espacio de Ingreso */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Módulo de Inventario • Entrada Directa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-emerald-600" />
            <span>Ingreso y Registro de Medicamentos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresa nuevos productos, define su precio, asigna el lote con vencimiento y súmalo al stock de <strong className="text-emerald-700">{currentBranch.name}</strong>.
          </p>
        </div>

        {onNavigateToCatalog && (
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-200 shadow-sm transition-all"
          >
            <List className="w-4 h-4 text-emerald-600" />
            <span>Ver Catálogo Completo</span>
          </button>
        )}
      </div>

      {/* Tarjeta de Confirmación de Último Ingreso */}
      {lastSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950">
                Último medicamento ingresado: <span className="text-emerald-800">{lastSaved.name}</span> ({lastSaved.sku})
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                Lote registrado: <strong>{lastSaved.batch}</strong> • Cantidad: <strong>{lastSaved.qty} unidades</strong> disponibles en caja y POS
              </div>
            </div>
          </div>
          <span className="text-[11px] bg-white text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-200 shadow-xs">
            Disponible en POS
          </span>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: Datos del Medicamento */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">1</div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Identificación del Medicamento</h2>
              <p className="text-[11px] text-slate-400">Datos comerciales y clasificación</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Nombre Comercial del Medicamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Acetaminofén Vijosa 500mg"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Principio Activo (Genérico)
              </label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="Ej: Paracetamol"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Código SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">Código Barras</label>
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Generar
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Escanear o escribir..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 p-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Laboratorio</label>
                <input
                  type="text"
                  value={laboratory}
                  onChange={(e) => setLaboratory(e.target.value)}
                  placeholder="Ej: Laboratorios Vijosa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Presentación</label>
                <input
                  type="text"
                  value={presentation}
                  onChange={(e) => setPresentation(e.target.value)}
                  placeholder="Ej: Caja con 30 Tabletas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Concentración</label>
                <input
                  type="text"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                  placeholder="Ej: 500 mg / 10 ml"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Requisitos sanitarios */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={requiresPrescription}
                  onChange={(e) => setRequiresPrescription(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Requiere Receta Médica</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={isControlled}
                  onChange={(e) => setIsControlled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Medicamento Controlado (Estupefaciente/Psicotrópico)</span>
              </label>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Precios, Costos y Márgenes */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">2</div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Precios y Rentabilidad</h2>
                <p className="text-[11px] text-slate-400">Costo de compra, margen y precio de venta</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Precio de Compra (Costo por Unidad en {settings.currencySymbol}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">{settings.currencySymbol}</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={purchasePrice}
                    onChange={(e) => handlePurchasePriceChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 p-2.5 text-slate-900 font-mono text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Margen de Ganancia Deseado (%)
                </label>
                <div className="flex gap-1.5 mb-1.5">
                  {['25', '35', '50', '75', '100'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleMarginChange(pct)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        marginPercent === pct
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="1"
                  value={marginPercent}
                  onChange={(e) => handleMarginChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Precio de Venta al Público ({settings.currencySymbol}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 font-mono font-bold">{settings.currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl pl-9 pr-3 p-2.5 text-emerald-900 font-mono text-base font-black focus:bg-white focus:outline-none focus:border-emerald-600 shadow-inner"
                  />
                </div>
              </div>

              {/* Indicador de Ganancia Neta por Unidad */}
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Ganancia Bruta x Unidad</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    +{settings.currencySymbol} {Math.max(0, (parseFloat(salePrice) || 0) - (parseFloat(purchasePrice) || 0)).toFixed(2)}
                  </span>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Stock Máximo</label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-xs focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: Lote Inicial & Guardar */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">3</div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Lote Inicial y Vencimiento</h2>
                <p className="text-[11px] text-slate-400">Trazabilidad FEFO y existencias de entrada</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Número de Lote de Fábrica <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Ej: LOT-2026-A1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Fecha de Vencimiento / Caducidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Cantidad de Unidades a Ingresar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(e.target.value)}
                  placeholder="100"
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl p-2.5 text-emerald-900 font-mono text-base font-black focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Se sumarán de inmediato al inventario de {currentBranch.name}.
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Proveedor Distribuidor</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.taxId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botón de Envío Principal */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer active:scale-98"
            >
              <PackagePlus className="w-5 h-5" />
              <span>INGRESAR Y REGISTRAR MEDICAMENTO</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              Al guardar, se creará el medicamento en el catálogo, su lote FEFO y el movimiento en el Kardex.
            </p>
          </div>
        </div>
      </form>

      {/* SECCIÓN DE HISTORIAL RECIENTE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <List className="w-4 h-4 text-emerald-600" />
            <span>Últimos Medicamentos Registrados en el Sistema</span>
          </h3>
          <span className="text-xs text-slate-400">Total en catálogo: {products.length} productos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {recentProducts.map((p) => (
            <div key={p.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {p.sku}
                </span>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1">{p.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{p.categoryName}</p>
              </div>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-200">
                <span className="font-black text-xs text-emerald-700 font-mono">{settings.currencySymbol} {(p.salePrice || 0).toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">Min: {p.minStock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
