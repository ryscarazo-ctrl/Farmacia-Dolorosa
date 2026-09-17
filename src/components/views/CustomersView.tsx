'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  UserCheck,
  CheckCircle2,
  Receipt,
  Building,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { Customer } from '../../types/pharmacy';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, sales } = usePharmacy();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo cliente
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.taxId.includes(term) ||
      c.phone.includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      name: name.trim(),
      taxId: taxId.trim() || '00000000-0',
      phone: phone.trim() || '+503 7000-0000',
      email: email.trim() || 'cliente@farmacia.com',
      address: address.trim() || 'San Salvador, El Salvador',
    });

    setName('');
    setTaxId('');
    setPhone('');
    setEmail('');
    setAddress('');
    setModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Padrón de Pacientes y Clientes</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Directorio de Clientes y Médicos Prescriptores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de pacientes frecuentes, recetas médicas asociadas y facturación directa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Cliente / Paciente</span>
        </button>
      </div>

      {/* Tarjetas KPI de Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Clientes Registrados</div>
          <div className="text-2xl font-mono font-black text-slate-900">
            {customers.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            Pacientes y médicos en base de datos
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pacientes Frecuentes / Crónicos</div>
          <div className="text-2xl font-mono font-black text-emerald-700 flex items-center gap-1.5">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
            <span>3 pacientes</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Tratamientos mensuales continuos
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas Vinculadas</div>
          <div className="text-2xl font-mono font-black text-slate-800">
            {sales.length}
          </div>
          <div className="text-[10px] text-slate-500">
            Historial de tickets emitidos
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DUI, teléfono o dirección..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Nombre del Cliente / Paciente</th>
                <th className="p-3.5">DUI / NIT</th>
                <th className="p-3.5">Teléfono</th>
                <th className="p-3.5">Correo Electrónico</th>
                <th className="p-3.5">Dirección / Clínica</th>
                <th className="p-3.5 text-center">Compras Registradas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No se encontraron clientes coincidentes.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const customerSalesCount = sales.filter(
                    (s) => s.customerName?.toLowerCase() === cust.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={cust.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {cust.name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {cust.taxId}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {cust.phone}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {cust.email}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">
                        {cust.address}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {customerSalesCount} compra(s)
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Registrar Cliente o Paciente</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Datos personales para facturación y seguimiento de tratamientos.
              </p>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Don Antonio Palacios"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">DUI o NIT</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="00000000-0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+503 7000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Dirección de Residencia / Clínica</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Barrio El Centro, Dolores..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Cliente</span>
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
