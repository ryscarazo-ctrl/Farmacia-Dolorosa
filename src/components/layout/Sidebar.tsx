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
  X,
  LogOut,
  Power,
  HardDrive,
  BookOpen,
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
  | 'admin-settings'
  | 'admin-backup'
  | 'manual';

interface SidebarProps {
  currentView: NavSection;
  onSelectView: (view: NavSection) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentBranch, settings, currentUser, logout } = usePharmacy();

  const handleItemClick = (id: NavSection) => {
    onSelectView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogoutClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    logout();
  };

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
        { id: 'manual', label: '📖 Manual de Usuario', icon: BookOpen },
        { id: 'admin-branches', label: 'Sucursales', icon: Building2 },
        { id: 'admin-users', label: 'Personal y Roles', icon: UserCog },
        { id: 'admin-backup', label: 'Copia de Seguridad (Backup)', icon: HardDrive },
        { id: 'admin-settings', label: 'Configuración', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop oscuro para teléfonos celulares cuando el menú está abierto */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar: Desktop estático / Mobile drawer deslizable */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-emerald-100 flex flex-col h-full select-none shadow-2xl transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:w-64 md:shadow-sm md:shrink-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header Institucional con Logotipo */}
        <div className="p-3.5 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-white gap-2">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt="Logo Farmacia Espíritu Santo"
                className="w-14 h-14 object-contain rounded-2xl bg-white p-1 border-2 border-emerald-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">✓</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-xs text-emerald-950 tracking-tight leading-tight truncate">
                ESPÍRITU SANTO
              </h1>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Farmacia & Salud</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 uppercase">
              {currentBranch.code}
            </span>

            {/* Botón cerrar para vista móvil */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5 text-emerald-900" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-4 text-xs font-semibold scrollbar-thin">
          {/* Dashboard Principal */}
          <div>
            <button
              onClick={() => handleItemClick('dashboard')}
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
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left text-xs ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-200'
                          : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
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

        {/* ESPACIO DESTACADO: USUARIO Y BOTÓN CERRAR SESIÓN / FINALIZAR DÍA */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/90 space-y-2.5 shrink-0">
          {/* Info del Usuario y Sucursal */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                {currentUser?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold truncate">
                  {currentUser?.role} • {currentBranch.name}
                </div>
              </div>
            </div>
          </div>

          {/* Botón Destacado: Cerrar Sesión (Finalizar Día) */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm active:scale-98 group"
            title="Cerrar sesión al finalizar el día de trabajo"
          >
            <LogOut className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
            <span>Cerrar Sesión (Finalizar Día)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
