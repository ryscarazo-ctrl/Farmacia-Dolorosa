'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Wrench,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  Layers,
  Package,
  Barcode,
  Sparkles,
  Info,
  Check,
  X,
  FileCheck,
  Search,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Tag,
  Scan,
  History,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Product } from '../../types/pharmacy';

interface PendingRowChange {
  productId: string;
  originalBarcode: string;
  originalStock: number;
  originalPrice: number;
  newBarcode: string;
  newStock: number;
  newPrice: number;
  isModified: boolean;
}

export const InventoryRectifierView: React.FC<{ onNavigateToCatalog?: () => void }> = ({
  onNavigateToCatalog,
}) => {
  const {
    products,
    batches,
    categories,
    currentBranch,
    settings,
    rectifyProductInventory,
    bulkRectifyInventory,
    movements,
  } = usePharmacy();

  // Modo de vista: 'direct' (tabla interactiva en vivo) | 'excel' (importar/exportar) | 'history' (kardex)
  const [activeTab, setActiveTab] = useState<'direct' | 'excel' | 'history'>('direct');

  // Filtros de búsqueda
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'NO_BARCODE' | 'ZERO_STOCK' | 'MODIFIED'>('ALL');

  // Input de Escáner Rápido (Pistola de Códigos)
  const [scannerInput, setScannerInput] = useState('');
  const [scannerNotification, setScannerNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  // Registro de cambios pendientes en memoria { [productId]: PendingRowChange }
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingRowChange>>({});

  // Feedback de guardado
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cálculo de stock actual por producto
  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
      const total = pBatches.reduce((acc, b) => acc + (b.currentQuantity || 0), 0);
      map.set(p.id, total);
    });
    return map;
  }, [products, batches, currentBranch.id]);

  // Obtener valores actuales o modificados de una fila
  const getRowValues = (prod: Product) => {
    const pending = pendingChanges[prod.id];
    const currentStock = stockMap.get(prod.id) ?? 0;
    if (pending) {
      return {
        barcode: pending.newBarcode,
        stock: pending.newStock,
        price: pending.newPrice,
        isModified: pending.isModified,
        stockDiff: pending.newStock - pending.originalStock,
        barcodeChanged: pending.newBarcode !== pending.originalBarcode,
      };
    }
    return {
      barcode: prod.barcode || '',
      stock: currentStock,
      price: prod.salePrice || 0,
      isModified: false,
      stockDiff: 0,
      barcodeChanged: false,
    };
  };

  // Manejador de cambio de código de barras
  const handleBarcodeChange = (prod: Product, newBarcode: string) => {
    const currentStock = stockMap.get(prod.id) ?? 0;
    const current = pendingChanges[prod.id] || {
      productId: prod.id,
      originalBarcode: prod.barcode || '',
      originalStock: currentStock,
      originalPrice: prod.salePrice || 0,
      newBarcode: prod.barcode || '',
      newStock: currentStock,
      newPrice: prod.salePrice || 0,
      isModified: false,
    };

    const updated: PendingRowChange = {
      ...current,
      newBarcode: newBarcode.trim(),
      isModified:
        newBarcode.trim() !== current.originalBarcode ||
        current.newStock !== current.originalStock ||
        current.newPrice !== current.originalPrice,
    };

    setPendingChanges((prev) => ({ ...prev, [prod.id]: updated }));
  };

  // Manejador de cambio de stock
  const handleStockChange = (prod: Product, newStock: number) => {
    const sanitizedStock = Math.max(0, isNaN(newStock) ? 0 : Math.round(newStock));
    const currentStock = stockMap.get(prod.id) ?? 0;
    const current = pendingChanges[prod.id] || {
      productId: prod.id,
      originalBarcode: prod.barcode || '',
      originalStock: currentStock,
      originalPrice: prod.salePrice || 0,
      newBarcode: prod.barcode || '',
      newStock: currentStock,
      newPrice: prod.salePrice || 0,
      isModified: false,
    };

    const updated: PendingRowChange = {
      ...current,
      newStock: sanitizedStock,
      isModified:
        current.newBarcode !== current.originalBarcode ||
        sanitizedStock !== current.originalStock ||
        current.newPrice !== current.originalPrice,
    };

    setPendingChanges((prev) => ({ ...prev, [prod.id]: updated }));
  };

  // Sumar o restar stock rápidamente
  const handleQuickStockStep = (prod: Product, step: number) => {
    const row = getRowValues(prod);
    handleStockChange(prod, row.stock + step);
  };

  // Generador automático de código de barras para productos sin barra
  const handleGenerateEan = (prod: Product) => {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const newBarcode = `743${randomSuffix}`;
    handleBarcodeChange(prod, newBarcode);
    setScannerNotification({
      message: `Código EAN generado para ${prod.name}: ${newBarcode}`,
      type: 'info',
    });
    setTimeout(() => setScannerNotification(null), 3000);
  };

  // Manejador de Pistola de Código de Barras (Escáner Rápido)
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scannerInput.trim();
    if (!code) return;

    // 1. Buscar si ya existe un producto con este código
    const foundProduct = products.find(
      (p) => (p.barcode && p.barcode.trim() === code) || (p.sku && p.sku.trim() === code)
    );

    if (foundProduct) {
      setSearch(foundProduct.name);
      setScannerNotification({
        message: `¡Medicamento encontrado!: "${foundProduct.name}". Puedes rectificar su cantidad directamente.`,
        type: 'success',
      });
      // Sumar 1 a la cantidad rectificada
      handleQuickStockStep(foundProduct, 1);
    } else {
      setScannerNotification({
        message: `Código "${code}" no está asignado a ningún medicamento aún. Búscalo en la lista para asignárselo.`,
        type: 'info',
      });
    }

    setScannerInput('');
    setTimeout(() => setScannerNotification(null), 4000);
  };

  // Guardar cambio individual de una fila
  const handleSaveSingleRow = (prod: Product) => {
    const pending = pendingChanges[prod.id];
    if (!pending || !pending.isModified) return;

    setIsSaving(true);
    const res = rectifyProductInventory({
      productId: prod.id,
      newStock: pending.newStock,
      newBarcode: pending.newBarcode,
      newPrice: pending.newPrice,
      notes: `Rectificación individual: Stock ${pending.originalStock} ➔ ${pending.newStock}, Barra: "${pending.newBarcode}"`,
    });

    setIsSaving(false);
    if (res.success) {
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[prod.id];
        return copy;
      });
      setSaveSuccessMessage(`✅ ${prod.name} rectificado y guardado con éxito.`);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } else {
      setSaveErrorMessage(`❌ Error al guardar ${prod.name}: ${res.message}`);
      setTimeout(() => setSaveErrorMessage(null), 4000);
    }
  };

  // Guardar TODOS los cambios pendientes de una sola vez
  const handleSaveAllPending = () => {
    const changedList = Object.values(pendingChanges).filter((p) => p.isModified);
    if (changedList.length === 0) return;

    setIsSaving(true);
    const itemsToRectify = changedList.map((c) => ({
      productId: c.productId,
      newStock: c.newStock,
      newBarcode: c.newBarcode,
      newPrice: c.newPrice,
      notes: `Rectificación masiva en pantalla: Stock ajustado a ${c.newStock}`,
    }));

    const res = bulkRectifyInventory(itemsToRectify);
    setIsSaving(false);

    if (res.success) {
      setPendingChanges({});
      setSaveSuccessMessage(
        `🎉 ¡Excelente! Se guardaron y rectificaron exitosamente ${res.count} medicamento(s) en el inventario.`
      );
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } else {
      setSaveErrorMessage('❌ Hubo un error al guardar las modificaciones masivas.');
      setTimeout(() => setSaveErrorMessage(null), 4000);
    }
  };

  // Cancelar todos los cambios pendientes
  const handleDiscardAll = () => {
    if (window.confirm('¿Seguro que deseas descartar todos los cambios sin guardar?')) {
      setPendingChanges({});
    }
  };

  // Filtrado de productos en la tabla
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Búsqueda por texto
      if (search.trim()) {
        const q = search.toLowerCase();
        const row = getRowValues(prod);
        const matchName = (prod.name || '').toLowerCase().includes(q);
        const matchGeneric = (prod.genericName || '').toLowerCase().includes(q);
        const matchBarcode = (row.barcode || '').toLowerCase().includes(q);
        const matchSku = (prod.sku || '').toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBarcode && !matchSku) return false;
      }

      // Filtro de categoría
      if (selectedCategory !== 'ALL' && prod.categoryId !== selectedCategory) {
        return false;
      }

      // Filtro por tipo
      const row = getRowValues(prod);
      if (filterType === 'NO_BARCODE' && row.barcode.trim().length > 0) return false;
      if (filterType === 'ZERO_STOCK' && row.stock > 0) return false;
      if (filterType === 'MODIFIED' && !row.isModified) return false;

      return true;
    });
  }, [products, search, selectedCategory, filterType, pendingChanges, stockMap]);

  // Contadores métricas
  const totalWithBarcode = products.filter((p) => p.barcode && p.barcode.trim().length > 0).length;
  const totalPendingBarcode = products.length - totalWithBarcode;
  const modifiedCount = Object.values(pendingChanges).filter((p) => p.isModified).length;

  // Lógica de Importación / Exportación Excel
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelStatus, setExcelStatus] = useState<string | null>(null);

  const handleExportExcel = () => {
    try {
      const rows = products.map((p) => {
        const currentStock = stockMap.get(p.id) ?? 0;
        return {
          ID_SISTEMA: p.id,
          SKU: p.sku || '',
          Codigo_Barra: p.barcode || '',
          Nombre_Comercial: p.name || '',
          Nombre_Generico: p.genericName || '',
          Categoria: p.categoryName || 'General',
          Laboratorio: p.laboratoryName || 'General',
          Stock_Actual: currentStock,
          Nuevo_Stock_Rectificado: currentStock,
          Nuevo_Codigo_Barra_Rectificado: p.barcode || '',
          Precio_Venta_C$: p.salePrice || 0,
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rectificacion_Inventario');
      const filename = `Rectificacion_Inventario_Farmacia_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
      setExcelStatus(`✅ Plantilla descargada exitosamente como "${filename}".`);
      setTimeout(() => setExcelStatus(null), 4000);
    } catch (e: any) {
      setExcelStatus(`❌ Error al exportar: ${e.message}`);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        if (!rows || rows.length === 0) {
          setExcelStatus('❌ El archivo Excel está vacío.');
          return;
        }

        const itemsToRectify: Array<{ productId: string; newStock?: number; newBarcode?: string }> = [];

        rows.forEach((r) => {
          const sysId = r['ID_SISTEMA'] || r['id'] || r['ID'];
          const sku = r['SKU'] || r['sku'];
          const barcode = r['Codigo_Barra'] || r['Nuevo_Codigo_Barra_Rectificado'] || r['codigo_barra'];
          const stock = r['Nuevo_Stock_Rectificado'] ?? r['Stock_Actual'] ?? r['stock'];

          // Buscar producto coincidente
          const matchedProd = products.find(
            (p) =>
              (sysId && p.id === String(sysId).trim()) ||
              (sku && p.sku && p.sku.trim() === String(sku).trim()) ||
              (barcode && p.barcode && p.barcode.trim() === String(barcode).trim())
          );

          if (matchedProd) {
            itemsToRectify.push({
              productId: matchedProd.id,
              newStock: stock !== undefined ? Number(stock) : undefined,
              newBarcode: barcode ? String(barcode).trim() : undefined,
            });
          }
        });

        if (itemsToRectify.length === 0) {
          setExcelStatus('⚠️ No se encontraron productos coincidentes en el archivo Excel.');
          return;
        }

        const res = bulkRectifyInventory(itemsToRectify);
        setExcelStatus(`🎉 ¡Éxito! Se rectificaron ${res.count} medicamentos desde el archivo Excel.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setExcelStatus(null), 6000);
      } catch (err: any) {
        setExcelStatus(`❌ Error al procesar el Excel: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Historial de ajustes recientes (Kardex de rectificaciones)
  const recentAdjustments = useMemo(() => {
    return movements
      .filter((m) => m.movementType === 'AJUSTE')
      .slice(0, 50);
  }, [movements]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. HEADER HERO DEL MÓDULO */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Gestión Operativa de Stock & Códigos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Módulo de Rectificación de Inventario 📋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Actualiza conteos físicos en tiempo real, corrige códigos de barra con pistola lectora y sincroniza
              los datos con precisión quirúrgica en todos los dispositivos.
            </p>
          </div>

          {/* Botón de Catálogo y Sucursal */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
              📍 Sede: {currentBranch.name}
            </span>
            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="text-xs font-bold text-white hover:text-emerald-200 underline flex items-center gap-1"
              >
                <span>Ir al Catálogo General</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200 font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>Total Medicamentos</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{products.length}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200 font-bold flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5" />
              <span>Con Código de Barra</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-emerald-300">
              {totalWithBarcode}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-amber-200 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Sin Código de Barra</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-amber-300">
              {totalPendingBarcode}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Cambios por Guardar</span>
            </div>
            <div
              className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                modifiedCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'
              }`}
            >
              {modifiedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVEGACIÓN POR PESTAÑAS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'direct'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Rectificación en Pantalla (En Vivo)</span>
            {modifiedCount > 0 && (
              <span className="bg-amber-400 text-slate-900 font-black text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {modifiedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'excel'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Importar / Exportar Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Historial de Ajustes</span>
          </button>
        </div>

        {/* ACCIONES GLOBALES DE GUARDADO (VISIBLES SIEMPRE QUE HAYA CAMBIOS) */}
        {modifiedCount > 0 && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <button
              onClick={handleDiscardAll}
              disabled={isSaving}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar ({modifiedCount})</span>
            </button>

            <button
              onClick={handleSaveAllPending}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Cambios ({modifiedCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* MENSAJES DE NOTIFICACIÓN FLOTANTES O GLOBALES */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}
      {saveErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveErrorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 1: RECTIFICACIÓN DIRECTA EN PANTALLA */}
      {/* ========================================================================= */}
      {activeTab === 'direct' && (
        <div className="space-y-4">
          {/* BARRA DE HERRAMIENTAS: ESCÁNER CON PISTOLA & BUSCADOR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            {/* 1. MODO PISTOLA DE CÓDIGO DE BARRAS */}
            <form onSubmit={handleScanSubmit} className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                <Barcode className="w-5 h-5 animate-pulse" />
              </div>
              <input
                ref={scannerInputRef}
                type="text"
                placeholder="⚡ Escanear con pistola lectora o ingresar código..."
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-emerald-50/60 border border-emerald-300 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder:text-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Escanear</span>
              </button>
            </form>

            {/* 2. BUSCADOR GENERAL DE MEDICAMENTOS */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, genérico, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3. FILTRO POR CATEGORÍA */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NOTIFICACIÓN DE ESCANEO */}
          {scannerNotification && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn border ${
                scannerNotification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{scannerNotification.message}</span>
            </div>
          )}

          {/* FILTROS RÁPIDOS POR PÍLDORAS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterType('NO_BARCODE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterType === 'NO_BARCODE'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Sin Código de Barra ({totalPendingBarcode})</span>
            </button>
            <button
              onClick={() => setFilterType('ZERO_STOCK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterType === 'ZERO_STOCK'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>Agotados (0 Stock)</span>
            </button>
            {modifiedCount > 0 && (
              <button
                onClick={() => setFilterType('MODIFIED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  filterType === 'MODIFIED'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Modificados en Esta Sesión ({modifiedCount})</span>
              </button>
            )}

            <div className="ml-auto text-xs font-semibold text-slate-500">
              Mostrando {filteredProducts.length} de {products.length} medicamentos
            </div>
          </div>

          {/* TABLA PRINCIPAL DE RECTIFICACIÓN DIRECTA */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Medicamento / Presentación</th>
                    <th className="py-3 px-3 w-64">Código de Barra</th>
                    <th className="py-3 px-3 text-center w-28">Stock Sistema</th>
                    <th className="py-3 px-3 text-center w-48">Nuevo Stock Físico</th>
                    <th className="py-3 px-3 text-center w-24">Ajuste</th>
                    <th className="py-3 px-3 text-right w-28">Precio Venta</th>
                    <th className="py-3 px-4 text-center w-28">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <div className="font-bold text-sm">No se encontraron medicamentos</div>
                        <div className="text-xs">Prueba ajustando los filtros de búsqueda.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const row = getRowValues(prod);
                      const isPending = row.isModified;

                      return (
                        <tr
                          key={prod.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isPending ? 'bg-amber-50/40 font-medium' : ''
                          }`}
                        >
                          {/* 1. MEDICAMENTO */}
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900 text-xs leading-snug">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              {prod.genericName && (
                                <span className="text-slate-600 italic">{prod.genericName}</span>
                              )}
                              {prod.presentation && (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                                  {prod.presentation}
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-slate-400">
                                SKU: {prod.sku || prod.id.slice(-6)}
                              </span>
                            </div>
                          </td>

                          {/* 2. CÓDIGO DE BARRA EDITABLE */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  placeholder="Sin código..."
                                  value={row.barcode}
                                  onChange={(e) => handleBarcodeChange(prod, e.target.value)}
                                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                    row.barcode.trim()
                                      ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                                      : 'bg-amber-50 border-amber-300 text-amber-800 placeholder:text-amber-600/60'
                                  }`}
                                />
                              </div>
                              {!row.barcode.trim() && (
                                <button
                                  type="button"
                                  onClick={() => handleGenerateEan(prod)}
                                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-all shrink-0 cursor-pointer"
                                  title="Generar código EAN automático"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 3. STOCK ACTUAL EN SISTEMA */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-black font-mono text-xs px-2.5 py-1 rounded-xl inline-block ${
                                row.stock === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {stockMap.get(prod.id) ?? 0} uds
                            </span>
                          </td>

                          {/* 4. NUEVO STOCK FÍSICO CON CONTROLES RÁPIDOS */}
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickStockStep(prod, -1)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs transition-all active:scale-90 cursor-pointer"
                                title="Restar 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={row.stock}
                                onChange={(e) => handleStockChange(prod, Number(e.target.value))}
                                className={`w-20 py-1 px-2 text-center rounded-xl border text-xs font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                  row.stockDiff !== 0
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-extrabold'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => handleQuickStockStep(prod, 1)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs transition-all active:scale-90 cursor-pointer"
                                title="Sumar 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              {/* Botón rápido para poner 0 */}
                              <button
                                type="button"
                                onClick={() => handleStockChange(prod, 0)}
                                className="text-[10px] px-1.5 py-1 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 font-bold ml-0.5 cursor-pointer"
                                title="Marcar como agotado (0)"
                              >
                                0
                              </button>
                            </div>
                          </td>

                          {/* 5. DIFERENCIA / VARIACIÓN */}
                          <td className="py-3 px-3 text-center">
                            {row.stockDiff > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 font-mono">
                                <TrendingUp className="w-3 h-3" />
                                +{row.stockDiff}
                              </span>
                            ) : row.stockDiff < 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 font-mono">
                                <TrendingDown className="w-3 h-3" />
                                {row.stockDiff}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px] font-semibold">
                                = 0
                              </span>
                            )}
                          </td>

                          {/* 6. PRECIO VENTA */}
                          <td className="py-3 px-3 text-right">
                            <span className="font-mono font-bold text-slate-800 text-xs">
                              C$ {row.price.toFixed(2)}
                            </span>
                          </td>

                          {/* 7. ACCIÓN INDIVIDUAL */}
                          <td className="py-2 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSaveSingleRow(prod)}
                              disabled={!isPending || isSaving}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 mx-auto ${
                                isPending
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95 cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                              }`}
                              title={isPending ? 'Guardar cambios de esta fila' : 'Sin cambios'}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isPending ? 'Guardar' : 'Listo'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: IMPORTAR Y EXPORTAR ARCHIVO EXCEL */}
      {/* ========================================================================= */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-lg font-black text-slate-900">
                Rectificación Masiva mediante Archivo Excel 📊
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Descarga la plantilla con todos tus medicamentos, actualiza las columnas de cantidades y códigos
                de barra en Excel en tu computadora, y vuelve a subirla aquí para rectificar todo de una vez.
              </p>
            </div>

            {excelStatus && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{excelStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* PASO 1: DESCARGAR PLANTILLA */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    1
                  </div>
                  <h3 className="font-black text-sm text-slate-900">
                    Paso 1: Descargar Inventario Actualizado
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Genera una hoja de cálculo con los {products.length} productos registrados, con sus IDs,
                    códigos de barra actuales y existencias listas para editar.
                  </p>
                </div>

                <button
                  onClick={handleExportExcel}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Plantilla Excel ({products.length} medicamentos)</span>
                </button>
              </div>

              {/* PASO 2: SUBIR PLANTILLA RECTIFICADA */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                    2
                  </div>
                  <h3 className="font-black text-sm text-slate-900">
                    Paso 2: Subir Excel Rectificado
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sube tu archivo editado con las nuevas cantidades contadas o los nuevos códigos de barra.
                    El sistema detectará las diferencias y las aplicará de inmediato.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo Excel Rectificado</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: HISTORIAL DE AJUSTES (KARDEX AUDITORÍA) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Historial de Rectificaciones & Ajustes de Inventario
              </h2>
              <p className="text-xs text-slate-500">
                Registro de auditoría de todos los cambios de stock físico realizados en el sistema.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-xl">
              {recentAdjustments.length} movimientos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                  <th className="py-2.5 px-3">Fecha / Hora</th>
                  <th className="py-2.5 px-3">Medicamento</th>
                  <th className="py-2.5 px-3 text-center">Stock Previo</th>
                  <th className="py-2.5 px-3 text-center">Stock Ajustado</th>
                  <th className="py-2.5 px-3 text-center">Variación</th>
                  <th className="py-2.5 px-3">Responsable</th>
                  <th className="py-2.5 px-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hay registros de rectificaciones en esta sesión.
                    </td>
                  </tr>
                ) : (
                  recentAdjustments.map((mov) => {
                    const diff = (mov.newStock ?? 0) - (mov.previousStock ?? 0);
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {new Date(mov.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {mov.productName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {mov.previousStock ?? 0}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {mov.newStock ?? 0}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {diff > 0 ? (
                            <span className="text-emerald-700 font-black font-mono">+{diff}</span>
                          ) : diff < 0 ? (
                            <span className="text-rose-700 font-black font-mono">{diff}</span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {mov.userName || 'Sistema'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {mov.notes}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
