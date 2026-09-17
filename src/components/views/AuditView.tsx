'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  User,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export const AuditView: React.FC = () => {
  const { auditLogs } = usePharmacy();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter((log) => {
    return (
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <span>Bitácora de Auditoría Forense Global</span>
          </h1>
          <p className="text-xs text-slate-500">
            Registro inmutable de eventos de seguridad, aperturas de caja, ventas, cambios de datos e IPs de acceso
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por usuario, acción, módulo o detalle..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Módulo</th>
              <th className="p-3">Detalle del Evento</th>
              <th className="p-3">Dirección IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-emerald-50/40">
                <td className="p-3 font-mono text-slate-500 text-[11px]">
                  {new Date(log.createdAt).toLocaleString('es-SV')}
                </td>
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{log.userName}</span>
                </td>
                <td className="p-3">
                  <span className="font-mono text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 text-slate-700 font-semibold">{log.module}</td>
                <td className="p-3 text-slate-800">{log.details}</td>
                <td className="p-3 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
