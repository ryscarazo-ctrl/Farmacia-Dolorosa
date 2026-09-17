'use client';

import React, { useState } from 'react';
import {
  Package,
  PackagePlus,
  Search,
  Filter,
  Layers,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product } from '../../types/pharmacy';

interface InventoryViewProps {
  onNavigateToEntry?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigateToEntry }) => {
  const {
    products,
    categories,
    updateProduct,
    getAvailableStock,
    getProductBatches,
    currentBranch,
    settings,
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [genericName, setGenericName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [presentation, setPresentation] = useState('Caja con 30 Tabletas');
  const [concentration, setConcentration] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [isControlled, setIsControlled] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cat = categories.find((c) => c.id === categoryId);

    updateProduct({
      ...editingProduct,
      name,
      sku,
      barcode,
      genericName,
      categoryId,
      categoryName: cat?.name || 'General',
      presentation,
      concentration,
      purchasePrice: parseFloat(purchasePrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      minStock: parseInt(minStock) || 5,
      requiresPrescription,
      isControlled,
    });
    setModalOpen(false);
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.genericName && p.genericName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Catálogo Maestro de Productos y Medicamentos</span>
          </h1>
          <p className="text-xs text-slate-500">
            Sucursal actual: <strong className="text-emerald-700">{currentBranch.name}</strong> • Total registrados: {products.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToEntry && (
            <button
              onClick={onNavigateToEntry}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95 border border-emerald-500"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Ingresar Medicamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, principio activo, código de barras o SKU..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm font-medium"
        >
          <option value="ALL">Todas las Categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla Profesional de Productos */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3">Código / SKU</th>
                <th className="p-3">Medicamento / Descripción</th>
                <th className="p-3">Categoría / Lab</th>
                <th className="p-3 text-right">Precio Compra</th>
                <th className="p-3 text-right">Precio Venta</th>
                <th className="p-3 text-center">Stock Sede</th>
                <th className="p-3 text-center">Lotes</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const stock = getAvailableStock(prod.id);
                const batches = getProductBatches(prod.id);
                const isLow = stock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-emerald-700">{prod.sku}</div>
                      <div className="text-[10px] text-slate-400">{prod.barcode}</div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{prod.name}</span>
                        {prod.requiresPrescription && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Receta
                          </span>
                        )}
                      </div>
                      {prod.genericName && (
                        <div className="text-[10px] text-slate-500 italic">Genérico: {prod.genericName}</div>
                      )}
                      <div className="text-[10px] text-slate-400 truncate">{prod.presentation}</div>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-800 font-semibold">{prod.categoryName}</div>
                      <div className="text-[10px] text-slate-400">{prod.laboratoryName || 'N/A'}</div>
                    </td>

                    <td className="p-3 text-right font-mono text-slate-500 font-medium">
                      {settings.currencySymbol} {prod.purchasePrice.toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                      {settings.currencySymbol} {prod.salePrice.toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full border ${
                          stock === 0
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {stock}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className="text-[11px] text-slate-500 font-mono font-semibold">
                        {batches.length} lote(s)
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setName(prod.name);
                          setSku(prod.sku);
                          setBarcode(prod.barcode);
                          setGenericName(prod.genericName || '');
                          setCategoryId(prod.categoryId);
                          setPresentation(prod.presentation);
                          setConcentration(prod.concentration || '');
                          setPurchasePrice(prod.purchasePrice.toString());
                          setSalePrice(prod.salePrice.toString());
                          setMinStock(prod.minStock.toString());
                          setRequiresPrescription(prod.requiresPrescription);
                          setIsControlled(prod.isControlled);
                          setModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                        title="Editar Medicamento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Medicamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{editingProduct ? 'Editar Medicamento' : 'Nuevo Medicamento en Catálogo'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Acetaminofén Vijosa 500mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Principio Activo (Genérico)</label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="Ej: Paracetamol"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Presentación</label>
                  <input
                    type="text"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    placeholder="Ej: Caja con 30 Tabletas"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Precio Compra ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Precio Venta ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={requiresPrescription}
                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Requiere Receta Médica</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={isControlled}
                    onChange={(e) => setIsControlled(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Medicamento Controlado</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
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
