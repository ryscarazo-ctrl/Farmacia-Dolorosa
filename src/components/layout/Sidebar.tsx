'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Users,
  Package,
  PackagePlus,
  Layers,
  Calendar,
  History,
  ArrowLeftRight,
  ShoppingBag,
  Truck,
  Vault,
  TrendingUp,
  Boxes,
  ShieldAlert,
  Building2,
  UserCog,
  Settings as SettingsIcon,
  DollarSign,
} from 'lucide-react';
import { usePharmacy } from '../../contexts/PharmacyContext';

export type NavSection =
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'returns'
  | 'customers'
  | 'new-product'
  | 'products'
  | 'batches'
  | 'expirations'
  | 'movements'
  | 'counts'
  | 'adjustments'
  | 'transfers'
  | 'purchases'
  | 'suppliers'
  | 'supplier-portal'
  | 'cash'
  | 'bank-reconciliation'
  | 'operational-expenses'
  | 'reports-sales'
  | 'reports-profit'
  | 'reports-inventory'
  | 'reports-audit'
  | 'admin-users'
  | 'admin-branches'
  | 'admin-settings';

interface SidebarProps {
  currentView: NavSection;
  onSelectView: (view: NavSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { currentBranch, settings } = usePharmacy();

  const navGroups: {
    category: string;
    items: { id: NavSection; label: string; icon: React.ElementType; badge?: number }[];
  }[] = [
    {
      category: 'VENTAS & POS',
      items: [
        { id: 'pos', label: 'Punto de Venta (POS)', icon: ShoppingCart },
        { id: 'sales', label: 'Historial de Ventas', icon: Receipt },
        { id: 'returns', label: 'Devoluciones y Reembolsos', icon: RotateCcw },
        { id: 'customers', label: 'Clientes', icon: Users },
      ],
    },
    {
      category: 'INVENTARIO & LOTES',
      items: [
        { id: 'new-product', label: '+ Ingresar Medicamento', icon: PackagePlus },
        { id: 'products', label: 'Catálogo de Productos', icon: Package },
        { id: 'batches', label: 'Control de Lotes (FEFO)', icon: Layers },
        { id: 'expirations', label: 'Vencimientos', icon: Calendar },
        { id: 'movements', label: 'Kardex / Movimientos', icon: History },
        { id: 'transfers', label: 'Transferencias Sedes', icon: ArrowLeftRight },
      ],
    },
    {
      category: 'COMPRAS & PROVEEDORES',
      items: [
        { id: 'purchases', label: 'Compras y Facturas', icon: ShoppingBag },
        { id: 'suppliers', label: 'Proveedores', icon: Truck },
        { id: 'supplier-portal', label: 'Portal Proveedores (B2B)', icon: Truck },
      ],
    },
    {
      category: 'GESTIÓN DE CAJA',
      items: [
        { id: 'cash', label: 'Arqueo & Cierre de Caja', icon: Vault },
        { id: 'bank-reconciliation', label: 'Conciliación Bancaria', icon: Building2 },
      ],
    },
    {
      category: 'REPORTES & FINANZAS',
      items: [
        { id: 'operational-expenses', label: 'Gastos Operativos & Ganancias', icon: DollarSign },
        { id: 'reports-profit', label: 'Rentabilidad y Margen', icon: TrendingUp },
        { id: 'reports-inventory', label: 'Valorización Inventario', icon: Boxes },
        { id: 'reports-audit', label: 'Auditoría Global (Logs)', icon: ShieldAlert },
      ],
    },
    {
      category: 'ADMINISTRACIÓN',
      items: [
        { id: 'admin-branches', label: 'Sucursales', icon: Building2 },
        { id: 'admin-users', label: 'Usuarios y Roles', icon: UserCog },
        { id: 'admin-settings', label: 'Configuración', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col h-screen select-none shrink-0 shadow-sm">
      {/* Header Institucional */}
      <div className="p-3 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-white gap-2">
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl}
            alt="Logo Farmacia Espíritu Santo"
            className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 border border-emerald-400 shadow-xs"
          />
          <div>
            <h1 className="font-extrabold text-xs text-emerald-900 tracking-tight leading-tight flex items-center gap-1">
              ESPÍRITU SANTO <span>🕊️</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Farmacia & Salud</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 uppercase">
          {currentBranch.code}
        </span>
      </div>

      {/* Navegación 100% Vertical con todos los módulos visibles */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-4 text-xs font-semibold scrollbar-thin">
        {/* Dashboard Principal */}
        <div>
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              currentView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Dashboard General</span>
            </div>
            {currentView === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </button>
        </div>

        {/* Grupos Verticales Desplegados */}
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {/* Título de Categoría */}
            <div className="px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-100 mb-1">
              {group.category}
            </div>

            {/* Lista Vertical de Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left text-xs ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-200'
                        : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Sucursal Activa */}
      <div className="p-2.5 border-t border-emerald-100 bg-emerald-50/40 text-[10px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="truncate">{currentBranch.name}</span>
        </div>
        <span className="font-mono text-slate-400 text-[9px] shrink-0">v1.2</span>
      </div>
    </aside>
  );
};
