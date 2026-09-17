'use client';

import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  UserCog,
  Shield,
  Database,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  FileCheck,
  AlertTriangle,
  HardDrive,
  Layers,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { initialUsers } from '../../data/mockData';

export const AdminView: React.FC<{ initialTab?: 'branches' | 'users' | 'settings' | 'backup' }> = ({ initialTab = 'settings' }) => {
  const {
    branches,
    settings,
    updateSettings,
    products,
    batches,
    sales,
    customers,
    suppliers,
    operationalExpenses,
    clearAllDemoData,
    restoreDemoData,
    exportBackupData,
    importBackupData,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'settings' | 'backup'>(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Settings form state
  const [pharmacyName, setPharmacyName] = useState(settings.pharmacyName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber);
  const [primaryCurrency, setPrimaryCurrency] = useState(settings.primaryCurrency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [ticketFooter, setTicketFooter] = useState(settings.ticketFooter);
  const [saved, setSaved] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      pharmacyName,
      address,
      phone,
      taxNumber,
      primaryCurrency,
      currencySymbol,
      taxRate: parseFloat(taxRate) || 0,
      ticketFooter,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const res = exportBackupData();
    if (res.success) {
      setBackupMessage({
        text: `¡Copia de seguridad descargada exitosamente como "${res.filename}"!`,
        type: 'success',
      });
      setTimeout(() => setBackupMessage(null), 5000);
    } else {
      setBackupMessage({
        text: `Error al generar la copia de seguridad: ${res.filename}`,
        type: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importBackupData(content);
        if (res.success) {
          setBackupMessage({ text: res.message, type: 'success' });
          setTimeout(() => setBackupMessage(null), 6000);
        } else {
          setBackupMessage({ text: res.message, type: 'error' });
        }
      } catch (err: any) {
        setBackupMessage({
          text: `Error al leer el archivo JSON: ${err.message || 'Formato incorrecto'}`,
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Toast Alert */}
      {backupMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border shadow-lg animate-fade-in ${
            backupMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
              : 'bg-red-600 text-white border-red-500 shadow-red-200'
          }`}
        >
          {backupMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{backupMessage.text}</span>
        </div>
      )}

      {/* Encabezado y Pestañas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Administración General & Respaldos</span>
          </h1>
          <p className="text-xs text-slate-500">
            Parámetros institucionales, copias de seguridad de datos, sucursales y personal
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'backup'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copia de Seguridad (Backup)</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'branches'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Sucursales ({branches.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Personal y Roles
          </button>
        </div>
      </div>

      {/* PESTAÑA: COPIA DE SEGURIDAD (BACKUP) */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Tarjeta Informativa Respaldo */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-900/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
              <HardDrive className="w-4 h-4" />
              <span>Centro de Copias de Seguridad & Respaldo Permanente</span>
            </div>
            <h2 className="text-xl font-black">Protege toda la información de Farmacia Espíritu Santo 🕊️</h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Descarga un archivo con toda la base de datos completa (medicamentos, lotes, clientes, ventas y cierres de caja). Puedes guardar este archivo en tu computadora, USB o teléfono y restaurarlo cuando quieras.
            </p>

            {/* Métricas de registros en base de datos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-600/60">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
                <div className="text-[11px] text-emerald-200 font-semibold">Medicamentos</div>
                <div className="text-xl font-black font-mono mt-0.5">{products.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
                <div className="text-[11px] text-emerald-200 font-semibold">Lotes Activos</div>
                <div className="text-xl font-black font-mono mt-0.5">{batches.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
                <div className="text-[11px] text-emerald-200 font-semibold">Ventas Registradas</div>
                <div className="text-xl font-black font-mono mt-0.5">{sales.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
                <div className="text-[11px] text-emerald-200 font-semibold">Clientes</div>
                <div className="text-xl font-black font-mono mt-0.5">{customers.length}</div>
              </div>
            </div>
          </div>

          {/* Grid de Acciones de Respaldo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Descargar Respaldo */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">1. Descargar Copia de Seguridad</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Genera un archivo seguro <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800">.json</code> con la fecha y hora exacta que contiene toda la información de la farmacia.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Copia de Seguridad (.JSON)</span>
              </button>
            </div>

            {/* 2. Restaurar Respaldo */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">2. Restaurar Copia de Seguridad</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sube un archivo de respaldo previo para restablecer todo el catálogo, precios, clientes y ventas en este u otro dispositivo.
                </p>
              </div>

              {/* Input de Archivo Oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivo de Respaldo (.JSON)</span>
              </button>
            </div>
          </div>

          {/* Mantenimiento y Limpieza */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Opciones Avanzadas de Mantenimiento</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('⚠️ ¿Estás seguro de que deseas reiniciar la base de datos a 0 registros? Esta acción borrará los datos cargados en este navegador.')) {
                    clearAllDemoData();
                    alert('✅ Base de datos limpiada correctamente.');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Limpiar Base de Datos (Iniciar en 0)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas recargar los datos de prueba de medicamentos y ventas de demostración?')) {
                    restoreDemoData();
                    alert('✅ Datos de prueba cargados.');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Cargar Medicamentos Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: CONFIGURACIÓN GENERAL */}
      {activeTab === 'settings' && (
        <>
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre Institucional</label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de Registro / NIT</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Teléfono Principal</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dirección Matriz</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Moneda de Facturación</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={primaryCurrency}
                    onChange={(e) => setPrimaryCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="$"
                    className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-center focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tasa de IVA / Impuesto (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mensaje de Pie en Tickets de Venta</label>
              <textarea
                rows={2}
                value={ticketFooter}
                onChange={(e) => setTicketFooter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saved ? '¡Configuración Guardada!' : 'Guardar Parámetros'}</span>
              </button>
            </div>
          </form>

          {/* Acceso Rápido a Copia de Seguridad desde Configuración */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white text-emerald-700 rounded-2xl border border-emerald-200 shadow-xs">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">Respaldo Rápido de Base de Datos</h3>
                <p className="text-xs text-emerald-800">
                  Descarga una copia de seguridad con todos tus {products.length} medicamentos y {sales.length} ventas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Copia (.JSON)</span>
            </button>
          </div>
        </>
      )}

      {/* PESTAÑA: SUCURSALES */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {b.code}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Activa</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
              <p className="text-xs text-slate-500">{b.address}</p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                Tel: {b.phone}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PESTAÑA: PERSONAL Y ROLES */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {initialUsers.map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {u.role}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{u.firstName} {u.lastName}</h3>
                <p className="text-xs text-slate-500">@{u.username} • {u.email}</p>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-mono flex items-center justify-between">
                <span>Tel: {u.phone}</span>
                <span className="text-emerald-700 font-bold">Sede 19-JUL</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
