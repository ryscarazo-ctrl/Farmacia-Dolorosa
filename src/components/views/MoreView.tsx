'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Vault,
  DollarSign,
  Building2,
  UserCog,
  HardDrive,
  Settings as SettingsIcon,
  BookOpen,
  Download,
  ChevronRight,
  LogOut,
  Bell,
  CheckCircle2,
  Shield,
  FileText,
  Calculator,
  Globe,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';
import { NavSection } from '../layout/Sidebar';
import { InstallAppModal } from '../modals/InstallAppModal';

interface MoreViewProps {
  onNavigate: (view: NavSection) => void;
}

export const MoreView: React.FC<MoreViewProps> = ({ onNavigate }) => {
  const { currentUser, currentBranch, logout, alerts, settings } = usePharmacy();
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const menuSections = [
    {
      title: 'OPERACIONES & CONTROL',
      items: [
        {
          id: 'inventory-rectifier' as NavSection,
          icon: Wrench,
          label: 'Rectificar Inventario',
          description: 'Sincronizar stock, precios y lotes en tiempo real',
          color: 'text-emerald-700 bg-emerald-50',
        },
        {
          id: 'cash' as NavSection,
          icon: Vault,
          label: 'Arqueo & Cierre de Caja',
          description: 'Base fija C$ 510.00 y corte de ventas del turno',
          color: 'text-amber-700 bg-amber-50',
        },
        {
          id: 'sales-periods' as NavSection,
          icon: Calculator,
          label: 'Cierres Día / Semana / Mes',
          description: 'Resumen diario, semanal y cierre contable mensual',
          color: 'text-teal-700 bg-teal-50',
        },
        {
          id: 'operational-expenses' as NavSection,
          icon: DollarSign,
          label: 'Estado de Resultados & Gastos',
          description: 'Libro diario, ingresos vs egresos, OPEX y ganancia neta',
          color: 'text-blue-700 bg-blue-50',
        },
        {
          id: 'bank-reconciliation' as NavSection,
          icon: Building2,
          label: 'Conciliación Bancaria',
          description: 'Cruce de cobros POS con tarjeta y transferencias',
          color: 'text-indigo-700 bg-indigo-50',
        },
      ],
    },
    {
      title: 'ADMINISTRACIÓN & SISTEMA',
      items: [
        {
          id: 'admin-branches' as NavSection,
          icon: Building2,
          label: 'Sucursales & Sedes',
          description: `${currentBranch.name} • ${currentBranch.code}`,
          color: 'text-purple-700 bg-purple-50',
        },
        {
          id: 'admin-users' as NavSection,
          icon: UserCog,
          label: 'Personal y Roles',
          description: 'Control de accesos para Jonathan, María y Fátima',
          color: 'text-indigo-700 bg-indigo-50',
        },
        {
          id: 'admin-backup' as NavSection,
          icon: HardDrive,
          label: 'Copia de Seguridad (Backup)',
          description: 'Exportar respaldo completo del sistema y kardex',
          color: 'text-teal-700 bg-teal-50',
        },
        {
          id: 'admin-settings' as NavSection,
          icon: SettingsIcon,
          label: 'Configuración General',
          description: 'Datos de facturación, tickets e impresoras térmicas',
          color: 'text-slate-700 bg-slate-100',
        },
      ],
    },
    {
      title: 'AYUDA & APLICACIÓN',
      items: [
        {
          id: 'manual' as NavSection,
          icon: BookOpen,
          label: 'Manual de Usuario',
          description: 'Guía paso a paso para ventas, compras y arqueo',
          color: 'text-emerald-700 bg-emerald-50',
        },
      ],
    },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 select-none">
      {/* Encabezado */}
      <div className="bg-[#0B1E2E] text-white px-4 pt-5 pb-6">
        <h1 className="text-xl font-black tracking-tight mb-4">Más Opciones</h1>

        {/* Tarjeta de Perfil de Usuario (Estilo Tecnomax) */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#162D42] border-2 border-emerald-400 text-white flex items-center justify-center text-lg font-black shrink-0">
              {currentUser?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>{currentUser?.firstName} {currentUser?.lastName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {currentUser?.username} • {currentUser?.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                {unreadAlerts.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido en Tarjetas Agrupadas */}
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Botón de Instalar Aplicación */}
        <button
          onClick={() => setShowInstallModal(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-3.5 rounded-2xl font-black text-xs flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-white/20">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm">📲 Instalar como App Oficial</div>
              <div className="text-[10px] text-emerald-100 font-medium">En tu computadora o teléfono celular</div>
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-white/20 text-[10px] font-bold">Instalar</span>
        </button>

        {/* Grupos de Opciones */}
        {menuSections.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              {group.title}
            </h2>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${item.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sección Sistema Web (Estilo Tecnomax Frame 00:12) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2.5">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
            SISTEMA FARMACIA ESPÍRITU SANTO
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Control integral de inventario FEFO, lote y vencimiento con facturación POS en vivo.
          </p>
          <button
            onClick={() => onNavigate('pos')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Ir a la Facturación POS</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Versión y Cerrar Sesión */}
        <div className="pt-2 pb-6 space-y-3 text-center">
          <p className="text-[11px] font-bold text-slate-400">
            Versión instalada: 2.3 • Farmacia Espíritu Santo
          </p>

          <button
            onClick={logout}
            className="w-full py-3 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión (Finalizar Turno)</span>
          </button>
        </div>
      </div>

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};