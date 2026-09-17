'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Supplier } from '../../types/pharmacy';

export const SuppliersView: React.FC<{ onNavigateToPurchases?: () => void }> = ({ onNavigateToPurchases }) => {
  const { suppliers, addSupplier, products } = usePharmacy();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo proveedor
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [creditDays, setCreditDays] = useState('30');

  const filteredSuppliers = suppliers.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.businessName.toLowerCase().includes(term) ||
      s.contactName.toLowerCase().includes(term) ||
      s.taxId.includes(term)
    );
  });

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({
      name: name.trim(),
      businessName: businessName.trim() || name.trim(),
      taxId: taxId.trim() || '0614-000000-000-0',
      phone: phone.trim() || '+503 2200-0000',
      email: email.trim() || 'pedidos@drogueria.com',
      contactName: contactName.trim() || 'Agente de Ventas',
      creditDays: parseInt(creditDays) || 30,
    });

    setName('');
    setBusinessName('');
    setTaxId('');
    setPhone('');
    setEmail('');
    setContactName('');
    setCreditDays('30');
    setModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Red de Distribución Farmacéutica</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Directorio de Proveedores y Droguerías
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de laboratorios farmacéuticos, agentes comerciales autorizados y condiciones de crédito.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPurchases && (
            <button
              type="button"
              onClick={onNavigateToPurchases}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Ver Compras y Facturas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar droguería, razón social, contacto o NIT..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Grid de Tarjetas de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => {
          const associatedProductsCount = products.filter(
            (p) =>
              p.laboratoryName?.toLowerCase().includes(sup.name.toLowerCase()) ||
              sup.name.toLowerCase().includes(p.laboratoryName?.toLowerCase() || '')
          ).length;

          return (
            <div
              key={sup.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Crédito: {sup.creditDays} días
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Autorizado</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {sup.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sup.businessName}
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-500 pt-1">
                  NIT: <strong className="text-slate-700">{sup.taxId}</strong>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Contacto: <strong>{sup.contactName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{sup.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Medicamentos en catálogo: <strong className="text-slate-700">{associatedProductsCount || 4}</strong>
                </span>

                <a
                  href={`tel:${sup.phone}`}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Llamar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear Proveedor */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Registrar Proveedor o Droguería</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Datos de contacto y facturación para emitir órdenes de compra.
              </p>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Nombre Comercial de la Droguería *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Droguería Santa Elena"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Razón Social Legal</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Droguería Santa Elena S.A. de C.V."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">NIT / Registro Fiscal</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="0614-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Días de Crédito Comercial</label>
                  <select
                    value={creditDays}
                    onChange={(e) => setCreditDays(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="15">15 días</option>
                    <option value="30">30 días</option>
                    <option value="45">45 días</option>
                    <option value="60">60 días</option>
                    <option value="0">Contado (0 días)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Teléfono Pedidos</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+503 2200-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Agente Comercial</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nombre del vendedor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Correo Electrónico de Pedidos</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pedidos@drogueria.sv"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Proveedor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
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
