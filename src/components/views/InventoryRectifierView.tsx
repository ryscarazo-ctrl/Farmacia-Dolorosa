'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const InventoryRectifierView: React.FC<{ onNavigateToCatalog?: () => void }> = ({
  onNavigateToCatalog,
}) => {
  const {
    products,
    batches,
    categories,
    currentBranch,
    settings,
    bulkUpsertProducts,
  } = usePharmacy();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzedData, setAnalyzedData] = useState<{
    fileName: string;
    totalRows: number;
    barcodesUpdated: number;
    pricesUpdated: number;
    newProducts: number;
    unchanged: number;
    itemsToUpsert: any[];
    diffDetails: Array<{
      sku: string;
      name: string;
      changeType: 'BARCODE' | 'PRICE' | 'NEW' | 'STOCK' | 'NONE';
      oldBarcode?: string;
      newBarcode?: string;
      oldPrice?: number;
      newPrice?: number;
      oldStock?: number;
      newStock?: number;
    }>;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diffFilter, setDiffFilter] = useState<'ALL' | 'CHANGES' | 'BARCODE' | 'PRICE' | 'NEW'>('CHANGES');

  // Estadísticas actuales
  const productsWithBarcode = products.filter((p) => p.barcode && p.barcode.trim().length > 0);
  const productsPendingBarcode = products.filter((p) => !p.barcode || p.barcode.trim().length === 0);

  // 1. FUNCIÓN PARA DESCARGAR EL INVENTARIO COMPLETO EN EXCEL
  const handleExportExcel = () => {
    try {
      const rows = products.map((p) => {
        const pBatches = batches.filter((b) => b.productId === p.id && b.branchId === currentBranch.id);
        const totalStock = pBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
        const primaryBatch = pBatches[0];
        const margin = p.purchasePrice > 0 ? (((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1) : '40.0';

        return {
          SKU: p.sku || '',
          Codigo_Barra: p.barcode || '',
          Nombre_Comercial: p.name || '',
          Nombre_Generico: p.genericName || '',
          Categoria: p.categoryName || 'General',
          Laboratorio: p.laboratoryName || 'Genérico / Comercial',
          Presentacion: p.presentation || 'Caja / Unidad',
          Concentracion: p.concentration || '',
          Unidad_Medida: p.unitMeasure || 'Unidad',
          'Costo_Compra_C$': p.purchasePrice || 0,
          'Precio_Venta_C$': p.salePrice || 0,
          'Margen_Ganancia_%': `${margin}%`,
          Stock_Actual: totalStock,
          Stock_Minimo_Alerta: p.minStock || 5,
          Numero_Lote: primaryBatch?.batchNumber || `LOT-${new Date().getFullYear()}-01`,
          Fecha_Vencimiento_YYYY_MM_DD: primaryBatch?.expirationDate || '2027-12-31',
          Requiere_Receta: p.requiresPrescription ? 'SI' : 'NO',
          Es_Controlado_Psicotropico: p.isControlled ? 'SI' : 'NO',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario_Rectificacion');

      // Ajuste de anchos de columna
      worksheet['!cols'] = [
        { wch: 12 }, // SKU
        { wch: 18 }, // Codigo_Barra
        { wch: 38 }, // Nombre_Comercial
        { wch: 28 }, // Nombre_Generico
        { wch: 22 }, // Categoria
        { wch: 22 }, // Laboratorio
        { wch: 20 }, // Presentacion
        { wch: 14 }, // Concentracion
        { wch: 14 }, // Unidad_Medida
        { wch: 16 }, // Costo_Compra_C$
        { wch: 16 }, // Precio_Venta_C$
        { wch: 18 }, // Margen_Ganancia_%
        { wch: 14 }, // Stock_Actual
        { wch: 18 }, // Stock_Minimo_Alerta
        { wch: 18 }, // Numero_Lote
        { wch: 28 }, // Fecha_Vencimiento
        { wch: 16 }, // Requiere_Receta
        { wch: 24 }, // Es_Controlado
      ];

      XLSX.writeFile(
        workbook,
        `Inventario_Farmacia_EspirituSanto_Rectificar_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err: any) {
      setErrorMessage(`Error al descargar el archivo Excel: ${err?.message || 'Error desconocido'}`);
    }
  };

  // 2. FUNCIÓN PARA ANALIZAR Y PREVISUALIZAR EL ARCHIVO EXCEL SUBIDO
  const handleFileAnalyze = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setErrorMessage('El archivo Excel subido está vacío o no contiene filas de medicamentos.');
          setIsProcessing(false);
          return;
        }

        const itemsToUpsert: any[] = [];
        const diffDetails: any[] = [];
        let barcodesUpdated = 0;
        let pricesUpdated = 0;
        let newProducts = 0;
        let unchanged = 0;

        jsonData.forEach((row, idx) => {
          const rowName = row['Nombre_Comercial'] || row['Nombre'] || row['Medicamento'] || row['Producto'];
          if (!rowName) return;

          const rowSku = row['SKU'] || row['Sku'] || row['Codigo_Interno'] || '';

          let rawBarcode = row['Codigo_Barra'] || row['Codigo'] || row['Barcode'];
          let rowBarcode = '';
          if (typeof rawBarcode === 'number') {
            rowBarcode = BigInt(Math.floor(rawBarcode)).toString();
          } else if (rawBarcode) {
            rowBarcode = String(rawBarcode).trim();
          }

          const rowGeneric = row['Nombre_Generico'] || row['Generico'] || '';
          const rowCatName = row['Categoria'] || '';
          const foundCat = categories.find((c) => c.name.toLowerCase().includes(String(rowCatName).toLowerCase())) || categories[0];
          const rowLab = row['Laboratorio'] || '';
          const rowPresentation = row['Presentacion'] || 'Caja / Unidad';
          const rowConcentration = row['Concentracion'] || '';
          const rowUnit = row['Unidad_Medida'] || 'Unidad';
          const rowCost = parseFloat(row['Costo_Compra_C$'] || row['Costo'] || row['Precio_Compra'] || 0);
          const rowSale = parseFloat(row['Precio_Venta_C$'] || row['Precio_Venta'] || row['Precio'] || (rowCost * 1.4));
          const rowMinStock = parseInt(row['Stock_Minimo_Alerta'] || row['Stock_Minimo'] || 10);
          const rowReceta = String(row['Requiere_Receta'] || '').toUpperCase() === 'SI';
          const rowControlado = String(row['Es_Controlado_Psicotropico'] || '').toUpperCase() === 'SI';

          const rowStock = parseInt(row['Stock_Actual'] || row['Stock_Inicial'] || row['Stock'] || row['Cantidad'] || 0);
          const rowBatch = String(row['Numero_Lote'] || row['Lote'] || `LOT-${Date.now().toString().slice(-4)}-${idx + 1}`);
          const rowExp = String(row['Fecha_Vencimiento_YYYY_MM_DD'] || row['Fecha_Vencimiento'] || row['Vencimiento'] || '2027-12-31');

          // Comparar con el producto existente en el sistema
          const normRowSku = rowSku ? String(rowSku).trim().toLowerCase() : '';
          const normRowName = String(rowName).trim().toLowerCase();

          const existing = products.find((p) => {
            if (normRowSku && p.sku && p.sku.trim().toLowerCase() === normRowSku) return true;
            if (p.name && p.name.trim().toLowerCase() === normRowName) return true;
            return false;
          });

          const itemPayload = {
            sku: rowSku ? String(rowSku).trim() : undefined,
            barcode: rowBarcode,
            name: String(rowName).trim(),
            genericName: rowGeneric ? String(rowGeneric).trim() : undefined,
            categoryId: foundCat?.id || 'cat-01',
            categoryName: foundCat?.name || 'General',
            laboratoryName: rowLab ? String(rowLab).trim() : undefined,
            presentation: rowPresentation,
            concentration: rowConcentration,
            unitMeasure: rowUnit,
            purchasePrice: isNaN(rowCost) ? 0 : rowCost,
            salePrice: isNaN(rowSale) ? 0 : rowSale,
            minStock: isNaN(rowMinStock) ? 5 : rowMinStock,
            requiresPrescription: rowReceta,
            isControlled: rowControlado,
            batch: rowStock > 0 ? {
              batchNumber: rowBatch,
              expirationDate: rowExp.includes('-') ? rowExp : '2027-12-31',
              quantity: rowStock,
              unitCost: isNaN(rowCost) ? 0 : rowCost,
            } : undefined,
          };

          itemsToUpsert.push(itemPayload);

          if (!existing) {
            newProducts++;
            diffDetails.push({
              sku: rowSku || `MED-${idx + 1}`,
              name: String(rowName),
              changeType: 'NEW',
              newBarcode: rowBarcode,
              newPrice: rowSale,
              newStock: rowStock,
            });
          } else {
            const hasBarcodeChange = (rowBarcode || '') !== (existing.barcode || '');
            const hasPriceChange = !isNaN(rowSale) && rowSale > 0 && Math.abs(rowSale - (existing.salePrice || 0)) > 0.01;

            if (hasBarcodeChange) barcodesUpdated++;
            if (hasPriceChange) pricesUpdated++;

            if (hasBarcodeChange || hasPriceChange) {
              diffDetails.push({
                sku: existing.sku || rowSku,
                name: existing.name,
                changeType: hasBarcodeChange ? 'BARCODE' : 'PRICE',
                oldBarcode: existing.barcode || 'Sin código',
                newBarcode: rowBarcode || 'Sin código',
                oldPrice: existing.salePrice,
                newPrice: rowSale,
              });
            } else {
              unchanged++;
              diffDetails.push({
                sku: existing.sku || rowSku,
                name: existing.name,
                changeType: 'NONE',
                oldBarcode: existing.barcode,
                newBarcode: rowBarcode,
                oldPrice: existing.salePrice,
                newPrice: rowSale,
              });
            }
          }
        });

        setAnalyzedData({
          fileName: file.name,
          totalRows: jsonData.length,
          barcodesUpdated,
          pricesUpdated,
          newProducts,
          unchanged,
          itemsToUpsert,
          diffDetails,
        });

        setIsProcessing(false);
      } catch (err: any) {
        setErrorMessage(`Error al leer el archivo Excel: ${err?.message || 'Formato no reconocido'}`);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 3. APLICAR LA RECTIFICACIÓN AL SISTEMA
  const handleApplyRectification = () => {
    if (!analyzedData || analyzedData.itemsToUpsert.length === 0) return;

    setIsProcessing(true);
    try {
      const result = bulkUpsertProducts(analyzedData.itemsToUpsert);

      setSuccessMessage(
        `¡Rectificación aplicada con éxito total! Se actualizaron ${result.updatedCount} medicamento(s) existentes con sus nuevos códigos de barra y precios, y se crearon ${result.createdCount} nuevos medicamentos. Todos los cambios están disponibles en vivo en el POS.`
      );

      setAnalyzedData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMessage(`Error al aplicar los cambios al sistema: ${err?.message || 'Error inesperado'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrado de detalles para la tabla de previsualización
  const filteredDiffs = analyzedData
    ? analyzedData.diffDetails.filter((d) => {
        if (diffFilter === 'CHANGES') return d.changeType !== 'NONE';
        if (diffFilter === 'BARCODE') return d.changeType === 'BARCODE';
        if (diffFilter === 'PRICE') return d.changeType === 'PRICE';
        if (diffFilter === 'NEW') return d.changeType === 'NEW';
        return true;
      })
    : [];

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header del Rectificador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
              <Wrench className="w-3.5 h-3.5 text-emerald-700" />
              <span>Módulo Oficial</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {currentBranch.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Centro de Rectificación & Sincronización de Inventario (Excel)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Descarga tu inventario en Excel, modifica o agrega códigos de barra y precios en tu equipo, y súbelo aquí para que el sistema <strong>rectifique y actualice todo automáticamente sin duplicar nada</strong>.
          </p>
        </div>

        {onNavigateToCatalog && (
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Ver Catálogo</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Resumen del Inventario Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-emerald-200/80 rounded-3xl p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Medicamentos Registrados
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-1">
            {products.length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Listos en el catálogo de la farmacia
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Con Código de Barra Asignado</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {productsWithBarcode.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Escaneables directamente en caja POS
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pendientes de Código de Barra</span>
          </div>
          <div className="text-3xl font-black text-amber-900 font-mono mt-1">
            {productsPendingBarcode.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {productsPendingBarcode.length === 0
              ? '¡Excelente! Todos los productos tienen código.'
              : 'Puedes asignárselos en el Excel descargado.'}
          </div>
        </div>
      </div>

      {/* MENSAJES DE ALERTA O ÉXITO */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-900 font-bold flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-red-100 rounded-lg text-red-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WORKFLOW EN 3 PASOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PASO 1: DESCARGAR */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-black text-slate-900">
                Descargar Inventario Actual (Excel)
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Descarga la hoja de cálculo completa con todos los <strong>{products.length} medicamentos</strong>, incluyendo sus columnas de SKU, nombres, costos, precios y lotes actuales.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instrucciones para modificar en tu computadora / celular:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                <li>Escribe o pega los códigos de barra en la columna <strong>`Codigo_Barra`</strong>.</li>
                <li>Puedes ajustar precios de venta en <strong>`Precio_Venta_C$`</strong> o costos.</li>
                <li><strong>No modifiques la columna `SKU`</strong> (el sistema la usa para identificar cada medicamento existente y no duplicarlo).</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Archivo Excel para Rectificar (.XLSX)</span>
          </button>
        </div>

        {/* PASO 2 & 3: SUBIR Y RECTIFICAR */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-black text-slate-900">
                Subir Archivo Excel Modificado
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sube el archivo Excel que acabas de guardar con los códigos de barra o precios nuevos. El sistema analizará las diferencias automáticamente.
            </p>

            {/* Input File Oculto + Zona de Arrastrar */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAnalyze}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xs text-emerald-950">
                Haz clic aquí para seleccionar el archivo Excel (.xlsx)
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Soporta archivos Excel (.xlsx, .xls) y CSV
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium text-center">
            El sistema reconocerá automáticamente los medicamentos modificados sin crear duplicados.
          </div>
        </div>
      </div>

      {/* PANEL DE PREVISUALIZACIÓN DE CAMBIOS ANTES DE APLICAR */}
      {analyzedData && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Informe de Rectificación
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Archivo: <strong className="text-slate-800">{analyzedData.fileName}</strong>
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Previsualización de Cambios Detectados</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnalyzedData(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyRectification}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-300 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>⚡ APLICAR Y RECTIFICAR CAMBIOS AHORA</span>
              </button>
            </div>
          </div>

          {/* Métricas de Cambios Detectados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] font-black uppercase text-emerald-800">
                Códigos de Barra Nuevos
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                {analyzedData.barcodesUpdated}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-[10px] font-black uppercase text-blue-800">
                Precios Modificados
              </div>
              <div className="text-2xl font-black text-blue-950 font-mono mt-1">
                {analyzedData.pricesUpdated}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
              <div className="text-[10px] font-black uppercase text-purple-800">
                Nuevos Medicamentos
              </div>
              <div className="text-2xl font-black text-purple-950 font-mono mt-1">
                {analyzedData.newProducts}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-black uppercase text-slate-600">
                Sin Cambios
              </div>
              <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                {analyzedData.unchanged}
              </div>
            </div>
          </div>

          {/* Filtro de Pestañas de Cambios */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-xs font-bold">
            <button
              onClick={() => setDiffFilter('CHANGES')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                diffFilter === 'CHANGES' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Solo Modificados ({analyzedData.diffDetails.filter((d) => d.changeType !== 'NONE').length})
            </button>
            <button
              onClick={() => setDiffFilter('BARCODE')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                diffFilter === 'BARCODE' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Con Código Nuevo ({analyzedData.barcodesUpdated})
            </button>
            <button
              onClick={() => setDiffFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                diffFilter === 'ALL' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todos ({analyzedData.diffDetails.length})
            </button>
          </div>

          {/* Tabla de Cambios */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Medicamento</th>
                  <th className="py-2.5 px-3">Tipo de Cambio</th>
                  <th className="py-2.5 px-3">Código de Barra</th>
                  <th className="py-2.5 px-3 text-right">Precio Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDiffs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No hay registros para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredDiffs.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{d.sku}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="py-2 px-3">
                        {d.changeType === 'BARCODE' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            🔍 Código Asignado
                          </span>
                        )}
                        {d.changeType === 'PRICE' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            💲 Precio Modificado
                          </span>
                        )}
                        {d.changeType === 'NEW' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                            ✨ Nuevo Producto
                          </span>
                        )}
                        {d.changeType === 'NONE' && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            Sin Cambios
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs">
                        {d.changeType === 'BARCODE' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 line-through">{d.oldBarcode}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {d.newBarcode}
                            </span>
                          </div>
                        ) : (
                          <span>{d.newBarcode || 'Sin código'}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {settings.currencySymbol} {(d.newPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
