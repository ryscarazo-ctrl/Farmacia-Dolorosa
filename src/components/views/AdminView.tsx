'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { initialUsers } from '../../data/mockData';

export const AdminView: React.FC<{ initialTab?: 'branches' | 'users' | 'settings' }> = ({ initialTab = 'settings' }) => {
  const {
    branches,
    settings,
    updateSettings,
    products,
    batches,
    sales,
    operationalExpenses,
    clearAllDemoData,
    restoreDemoData,
  } = usePharmacy();
  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'settings'>(initialTab);

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

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Administración General del Sistema</span>
          </h1>
          <p className="text-xs text-slate-500">
            Parámetros institucionales, monedas, sucursales y permisos de seguridad
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'branches'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Sucursales ({branches.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Usuarios ({initialUsers.length})
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <>
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl text-slate-800">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Datos Institucionales y Moneda</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Nombre de la Farmacia</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Número de Registro / NIT</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Dirección Principal</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Moneda Principal</label>
              <input
                type="text"
                value={primaryCurrency}
                onChange={(e) => setPrimaryCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Símbolo</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Tasa IVA Medicamentos (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-700 font-bold block mb-1">Mensaje al Pie del Recibo/Factura</label>
            <textarea
              rows={2}
              value={ticketFooter}
              onChange={(e) => setTicketFooter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>

            {saved && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuración guardada exitosamente</span>
              </span>
            )}
          </div>
        </form>

        {/* Panel de Control de Base de Datos y Producción */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Base de Datos y Producción Real</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Modo Producción Activo
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Tu sistema guarda automáticamente todos los medicamentos, lotes, ventas, movimientos y gastos en el almacenamiento permanente local del navegador.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900 font-mono">{products.length}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Medicamentos</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900 font-mono">{batches.length}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Lotes FEFO</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900 font-mono">{sales.length}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Ventas Emitidas</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900 font-mono">{operationalExpenses.length}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Gastos Registrados</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Seguro que deseas reiniciar la base de datos a 0 registros? Esta acción dejará el sistema totalmente limpio.')) {
                  clearAllDemoData();
                  alert('Base de datos limpiada. El sistema está 100% en blanco para operar.');
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Limpiar Todo (Iniciar en Blanco)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas recargar los datos de prueba de medicamentos y ventas de demostración?')) {
                  restoreDemoData();
                  alert('Datos de prueba cargados.');
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Cargar Datos Demo</span>
            </button>
          </div>
        </div>
      </>
    )}

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
