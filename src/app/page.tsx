'use client';

import React, { useState } from 'react';
import { Sidebar, NavSection } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { DashboardView } from '../components/views/DashboardView';
import { POSView } from '../components/views/POSView';
import { InventoryView } from '../components/views/InventoryView';
import { BatchesView } from '../components/views/BatchesView';
import { MovementsView } from '../components/views/MovementsView';
import { CashView } from '../components/views/CashView';
import { ReportsView } from '../components/views/ReportsView';
import { AuditView } from '../components/views/AuditView';
import { TransfersView } from '../components/views/TransfersView';
import { AdminView } from '../components/views/AdminView';
import { ProductEntryView } from '../components/views/ProductEntryView';
import { ReturnsView } from '../components/views/ReturnsView';
import { SalesHistoryView } from '../components/views/SalesHistoryView';

import { PurchasesView } from '../components/views/PurchasesView';
import { SuppliersView } from '../components/views/SuppliersView';
import { CustomersView } from '../components/views/CustomersView';
import { SupplierPortalView } from '../components/views/SupplierPortalView';
import { OperationalExpensesView } from '../components/views/OperationalExpensesView';
import { ProfitMarginView } from '../components/views/ProfitMarginView';
import { InventoryValuationView } from '../components/views/InventoryValuationView';
import { BankReconciliationView } from '../components/views/BankReconciliationView';
import { usePharmacy } from '../contexts/PharmacyContext';
import { LoginView } from '../components/auth/LoginView';

export default function Home() {
  const { isAuthenticated } = usePharmacy();
  const [currentView, setCurrentView] = useState<NavSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const navigateTo = (view: NavSection) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => navigateTo(view)} />;
      case 'pos':
        return <POSView onNavigate={(view) => navigateTo(view)} />;
      case 'new-product':
        return <ProductEntryView onNavigateToCatalog={() => navigateTo('products')} />;
      case 'products':
        return <InventoryView onNavigateToEntry={() => navigateTo('new-product')} />;
      case 'batches':
        return <BatchesView filterOnlyExpirations={false} />;
      case 'expirations':
        return <BatchesView filterOnlyExpirations={true} />;
      case 'movements':
        return <MovementsView />;
      case 'cash':
        return <CashView />;
      case 'bank-reconciliation':
        return <BankReconciliationView />;
      case 'operational-expenses':
        return <OperationalExpensesView />;
      case 'reports-profit':
        return <ProfitMarginView />;
      case 'reports-inventory':
        return <InventoryValuationView />;
      case 'reports-sales':
        return <ReportsView />;
      case 'reports-audit':
        return <AuditView />;
      case 'transfers':
        return <TransfersView />;
      case 'admin-branches':
        return <AdminView initialTab="branches" />;
      case 'admin-users':
        return <AdminView initialTab="users" />;
      case 'admin-settings':
        return <AdminView initialTab="settings" />;
      case 'sales':
        return <SalesHistoryView onNavigateToReturns={() => navigateTo('returns')} />;
      case 'returns':
        return <ReturnsView onNavigateToSales={() => navigateTo('sales')} />;
      case 'customers':
        return <CustomersView />;
      case 'purchases':
        return (
          <PurchasesView
            onNavigateToSuppliers={() => navigateTo('suppliers')}
            onNavigateToSupplierPortal={() => navigateTo('supplier-portal')}
          />
        );
      case 'suppliers':
        return <SuppliersView onNavigateToPurchases={() => navigateTo('purchases')} />;
      case 'supplier-portal':
        return <SupplierPortalView />;
      default:
        return <DashboardView onNavigate={(view) => navigateTo(view)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 relative">
      {/* Sidebar de Navegación Blanco y Verde (Drawer en teléfonos, fijo en PC) */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => navigateTo(view)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <TopNavbar
          onNavigateToCash={() => navigateTo('cash')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
