'use client';

import React, { useState, useRef } from 'react';
import {
  Package,
  Eye,
  Trash2,
  PackagePlus,
  Search,
  Filter,
  Layers,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Upload,
  Download,
  Check,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product } from '../../types/pharmacy';

interface InventoryViewProps {
  onNavigateToEntry?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigateToEntry }) => {
  const {
    openProductDetail,
    products,
    categories,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    addProduct,
    getAvailableStock,
    getProductBatches,
    currentBranch,
    settings,
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const totalPendingCount = products.filter((p) => {
    const pBatches = getProductBatches(p.id);
    return !p.salePrice || p.salePrice <= 0 || pBatches.length === 0;
  }).length;
  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importStatus, setImportStatus] = useState<{ count: number; message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = (prod: Product) => {
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
  };

  // Manejo de Importación de Excel / CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setImportStatus({ count: 0, message: 'El archivo Excel no contiene filas de medicamentos.', type: 'error' });
          return;
        }

        let importedCount = 0;
        jsonData.forEach((row, idx) => {
          const rowName = row['Nombre_Comercial'] || row['Nombre'] || row['Medicamento'] || row['Producto'];
          if (!rowName) return;

          let rawBarcode = row['Codigo_Barra'] || row['Codigo'] || row['Barcode'];
          let rowBarcode = '';
          if (typeof rawBarcode === 'number') {
            rowBarcode = BigInt(Math.floor(rawBarcode)).toString();
          } else if (rawBarcode) {
            rowBarcode = String(rawBarcode).trim();
          } else {
            rowBarcode = `750${Date.now().toString().slice(-7)}${idx}`;
          }
          const rowGeneric = row['Nombre_Generico'] || row['Generico'] || '';
          const rowCatName = row['Categoria'] || '';
          const foundCat = categories.find(c => c.name.toLowerCase().includes(String(rowCatName).toLowerCase())) || categories[0];
          const rowLab = row['Laboratorio'] || '';
          const rowPresentation = row['Presentacion'] || 'Caja / Unidad';
          const rowConcentration = row['Concentracion'] || '';
          const rowUnit = row['Unidad_Medida'] || 'Unidad';
          const rowCost = parseFloat(row['Costo_Compra_C$'] || row['Costo'] || row['Precio_Compra'] || 0);
          const rowSale = parseFloat(row['Precio_Venta_C$'] || row['Precio_Venta'] || row['Precio'] || (rowCost * 1.4));
          const rowMinStock = parseInt(row['Stock_Minimo_Alerta'] || row['Stock_Minimo'] || 10);
          const rowReceta = String(row['Requiere_Receta'] || '').toUpperCase() === 'SI';
          const rowControlado = String(row['Es_Controlado_Psicotropico'] || '').toUpperCase() === 'SI';

          const rowStock = parseInt(row['Stock_Inicial'] || row['Stock'] || row['Cantidad'] || 0);
          const rowBatch = String(row['Numero_Lote'] || row['Lote'] || `LOT-${Date.now().toString().slice(-4)}-${idx + 1}`);
          const rowExp = String(row['Fecha_Vencimiento_YYYY_MM_DD'] || row['Fecha_Vencimiento'] || row['Vencimiento'] || '2027-12-31');

          const newProdSku = `MED-${String(products.length + importedCount + 1).padStart(3, '0')}`;

          addProduct(
            {
              sku: newProdSku,
              barcode: rowBarcode,
              name: String(rowName),
              genericName: rowGeneric ? String(rowGeneric) : undefined,
              categoryId: foundCat?.id || 'cat-01',
              categoryName: foundCat?.name || 'General',
              laboratoryName: rowLab ? String(rowLab) : undefined,
              presentation: rowPresentation,
              concentration: rowConcentration,
              unitMeasure: rowUnit,
              purchasePrice: isNaN(rowCost) ? 0 : rowCost,
              salePrice: isNaN(rowSale) ? 0 : rowSale,
              minStock: isNaN(rowMinStock) ? 5 : rowMinStock,
              maxStock: (isNaN(rowMinStock) ? 5 : rowMinStock) * 10,
              requiresPrescription: rowReceta,
              isControlled: rowControlado,
              isActive: true,
            },
            rowStock > 0 ? {
              batchNumber: rowBatch,
              expirationDate: rowExp.includes('-') ? rowExp : '2027-12-31',
              quantity: rowStock,
              unitCost: isNaN(rowCost) ? 0 : rowCost,
            } : undefined
          );

          importedCount++;
        });

        setImportStatus({
          count: importedCount,
          message: `¡Se importaron con éxito ${importedCount} medicamento(s) con sus lotes y precios al sistema!`,
          type: 'success'
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setImportStatus({
          count: 0,
          message: `Error al procesar el archivo Excel: ${err?.message || 'Formato no reconocido'}`,
          type: 'error'
        });
      }
    };
    reader.readAsArrayBuffer(file);
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

        {/* Acciones Rápidas */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Input oculto para subir Excel */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <a
            href="/plantilla_medicamentos.xlsx"
            download="Plantilla_Ingreso_Medicamentos_Farmacia_Espiritu_Santo.xlsx"
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Descargar archivo Excel con formato y ejemplos listos para rellenar"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Descargar Plantilla Excel</span>
          </a>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            title="Subir archivo Excel o CSV relleno para importar medicamentos en masa"
          >
            <Upload className="w-4 h-4 text-emerald-300" />
            <span>Subir Excel / CSV</span>
          </button>

          {products.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              title="Quitar / Eliminar todos los medicamentos del catálogo para comenzar desde cero"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar Catálogo</span>
            </button>
          )}

          {onNavigateToEntry && (
            <button
              onClick={onNavigateToEntry}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95 border border-emerald-500"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Ingresar Medicamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Estado de Importación */}
      {importStatus && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs font-bold">{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros Rápidos de Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setShowOnlyPending(false)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !showOnlyPending
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Todos los Fármacos ({products.length})
        </button>

        <button
          onClick={() => setShowOnlyPending(true)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            showOnlyPending
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>⚠️ Pendientes de Venta ({totalPendingCount})</span>
        </button>
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Vista Móvil: Tarjetas Táctiles Verticales */}
        <div className="sm:hidden divide-y divide-slate-100 p-2 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600 text-xs">No hay medicamentos que coincidan</p>
            </div>
          ) : (
            filtered.map((prod) => {
              const stock = getAvailableStock(prod.id);
              const batches = getProductBatches(prod.id);
              const isLow = stock <= prod.minStock;

              return (
                <div
                  key={prod.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-emerald-50/40 rounded-xl border border-slate-100 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                          {prod.categoryName || 'General'}
                        </span>
                        {prod.requiresPrescription && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">
                            Receta
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">{prod.name}</h3>
                      {prod.genericName && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{prod.genericName}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">{prod.presentation}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-emerald-700 font-mono">
                        {settings.currencySymbol || 'C$'} {prod.salePrice.toFixed(2)}
                      </div>
                      <span
                        className={`inline-block mt-1 font-mono font-black text-[10px] px-2 py-0.5 rounded-full border ${
                          stock === 0
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {stock} disp.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] text-slate-400">
                      SKU: {prod.sku} • {batches.length} lote(s)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openProductDetail(prod)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha / Lotes</span>
                      </button>
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista Escritorio: Tabla Completa */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">No hay medicamentos registrados aún</p>
                      <p className="text-xs text-slate-400 max-w-md">
                        Puedes hacer clic en <strong>"+ Ingresar Medicamento"</strong> para añadir uno por uno o usar <strong>"Subir Excel / CSV"</strong> para importar tu lista completa en segundos.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
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
                        <div className="flex items-center justify-center gap-1">
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
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Ficha de Medicamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Quitar / Eliminar este Medicamento del Sistema"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición de Producto */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>Editar Producto: {editingProduct.sku}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Principio Activo (Genérico)
                  </label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Presentación
                  </label>
                  <input
                    type="text"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Costo Compra ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Precio Venta ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-center font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresPrescription}
                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Requiere Receta Médica</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isControlled}
                    onChange={(e) => setIsControlled(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                  />
                  <span>Controlado (Psicotrópico)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
