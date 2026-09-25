'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch,
  User,
  Category,
  Product,
  ProductBatch,
  CartItem,
  Sale,
  SaleItemDetail,
  InventoryMovement,
  CashSession,
  StockTransfer,
  Supplier,
  Customer,
  Alert,
  AuditLog,
  Settings,
  PaymentMethod,
  SaleReturn,
  ReturnReason,
  ReturnDestination,
  ReturnItemDetail,
  BarcodeReturn,
  PurchaseInvoice,
  SupplierOrder,
  SupplierOrderStatus,
  OperationalExpense,
  ExpenseCategory,
  BankAccount,
  BankStatementItem,
} from '../types/pharmacy';
import {
  initialBranches,
  initialUsers,
  initialCategories,
  initialProducts,
  initialBatches,
  initialSuppliers,
  initialCustomers,
  initialCashSessions,
  initialSales,
  initialMovements,
  initialTransfers,
  initialAlerts,
  initialAuditLogs,
  initialSettings,
  initialReturns,
  initialBarcodeReturns,
  initialPurchases,
  initialSupplierOrders,
  initialOperationalExpenses,
  initialBankAccounts,
  initialBankStatements,
} from '../data/mockData';

interface PharmacyContextType {
  selectedProductDetail: Product | null;
  openProductDetail: (productOrIdOrName: Product | string) => void;
  closeProductDetail: () => void;
  // Entidades principales
  branches: Branch[];
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  categories: Category[];
  products: Product[];
  batches: ProductBatch[];
  suppliers: Supplier[];
  customers: Customer[];
  cashSessions: CashSession[];
  currentCashSession: CashSession | null;
  sales: Sale[];
  returns: SaleReturn[];
  barcodeReturns: BarcodeReturn[];
  movements: InventoryMovement[];
  transfers: StockTransfer[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  syncNow: () => Promise<void>;
  isSyncing: boolean;

  // Carrito de Venta POS
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discountPercent: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotals: () => { subtotal: number; discount: number; tax: number; total: number; totalCost: number };

  // Operaciones de Negocio
  processSale: (params: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    customerName?: string;
    notes?: string;
  }) => { success: boolean; sale?: Sale; message: string };

  processReturn: (params: {
    saleInvoiceNumber: string;
    reason: ReturnReason;
    reasonDescription: string;
    refundMethod: 'Cash' | 'Card' | 'CreditNote';
    items: {
      productId: string;
      batchNumber: string;
      quantity: number;
      destination: ReturnDestination;
    }[];
  }) => { success: boolean; returnRecord?: SaleReturn; message: string };

  processBarcodeReturn: (params: {
    barcode: string;
    batchNumber?: string;
    quantity: number;
    reason: string;
    sellerJustification: string;
    destination: 'RESTOCK' | 'EXPIRED_QUARANTINE';
    refundMethod: 'Cash' | 'Card' | 'CreditNote';
    customerName?: string;
  }) => { success: boolean; returnRecord?: BarcodeReturn; message: string };

  // Gestión de Lotes e Inventario
  addProduct: (product: Omit<Product, 'id'>, initialBatch?: { batchNumber: string; expirationDate: string; quantity: number; unitCost: number }) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  clearAllProducts: () => void;
  addBatch: (batch: Omit<ProductBatch, 'id'>) => void;
  getProductBatches: (productId: string, branchId?: string) => ProductBatch[];
  getAvailableStock: (productId: string, branchId?: string) => number;
  getNextExpiringBatch: (productId: string, branchId?: string) => ProductBatch | undefined;

  // Caja
  openCashSession: (openingBalance: number, notes?: string) => void;
  closeCashSession: (actualBalance: number, notes?: string) => void;
  addCashMovement: (type: 'IN' | 'OUT', amount: number, reason: string) => void;

  // Transferencias y Ajustes
  createTransfer: (targetBranchId: string, items: { productId: string; batchNumber: string; quantity: number }[]) => void;
  receiveTransfer: (transferId: string) => void;
  markAlertAsRead: (alertId: string) => void;

  // Compras, Proveedores y Clientes
  purchases: PurchaseInvoice[];
  addPurchase: (purchase: Omit<PurchaseInvoice, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;

  // Portal B2B de Proveedores & Pedidos
  supplierOrders: SupplierOrder[];
  addSupplierOrder: (order: Omit<SupplierOrder, 'id' | 'orderNumber' | 'accessCode' | 'status' | 'history'>) => SupplierOrder;
  updateOrderStatusBySupplier: (params: {
    orderId: string;
    newStatus: SupplierOrderStatus;
    supplierInvoiceNumber?: string;
    estimatedDeliveryDate?: string;
    deliveryDriver?: string;
    driverPhone?: string;
    supplierNotes?: string;
    actor: string;
  }) => { success: boolean; message: string };

  // Gastos Operativos (OPEX)
  operationalExpenses: OperationalExpense[];
  addOperationalExpense: (expense: Omit<OperationalExpense, 'id' | 'expenseNumber' | 'createdAt'>) => void;

  // Conciliación Bancaria
  bankAccounts: BankAccount[];
  bankStatements: BankStatementItem[];
  matchBankTransaction: (bankStatementId: string, systemReferenceId: string) => void;
  unmatchBankTransaction: (bankStatementId: string) => void;
  autoReconcileBank: (bankAccountId: string) => { matchedCount: number; message: string };
  addBankStatementItem: (item: Omit<BankStatementItem, 'id' | 'isReconciled'>) => void;

  // Administración de Producción, Copia de Seguridad & Limpieza de Datos
  clearAllDemoData: () => void;
  restoreDemoData: () => void;
  exportBackupData: () => { success: boolean; filename: string };
  importBackupData: (jsonData: any) => { success: boolean; message: string };

  // Autenticación y Seguridad Privada
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const loadStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const cleanedKey = 'farmacia_inventory_real_v12';
    if (!window.localStorage.getItem(cleanedKey)) {
      window.localStorage.removeItem('farmacia_v5_products');
      window.localStorage.removeItem('farmacia_v5_batches');
      window.localStorage.removeItem('farmacia_v5_alerts');
      window.localStorage.removeItem('farmacia_v5_movements');
      window.localStorage.removeItem('farmacia_v5_transfers');
      window.localStorage.removeItem('farmacia_v5_sales');
      window.localStorage.removeItem('farmacia_v5_purchases');
      window.localStorage.removeItem('farmacia_v5_returns');
      window.localStorage.removeItem('farmacia_v5_cart');
      window.localStorage.removeItem('farmacia_v5_settings');
      window.localStorage.setItem(cleanedKey, 'true');
    }

    const item = window.localStorage.getItem(`farmacia_v5_${key}`);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);

    if (key === 'products' && Array.isArray(parsed)) {
      return parsed.filter((p: any) => true) as unknown as T;
    }
    if (key === 'batches' && Array.isArray(parsed)) {
      return parsed.filter((b: any) => true) as unknown as T;
    }
    if (key === 'alerts' && Array.isArray(parsed)) {
      return parsed.filter((a: any) => true) as unknown as T;
    }

    return parsed;
  } catch {
    return defaultValue;
  }
};

const saveStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`farmacia_v5_${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota limits
  }
};

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches] = useState<Branch[]>(initialBranches);
  const [currentBranch, setCurrentBranch] = useState<Branch>(initialBranches[0]);
  const [currentUser, setCurrentUser] = useState<User>(() => loadStorage('current_user', initialUsers[0]));
  const [categories] = useState<Category[]>(initialCategories);

  // Estados Limpios para Producción Real (0 ejemplos, persistente en el navegador)
    // Carga con persistencia en localStorage o datos de prueba completos por defecto
    // Estados en Blanco para Producción Real (0 medicamentos demo, listo para ingresar inventario real)
  const [products, setProducts] = useState<Product[]>(() => loadStorage('products', initialProducts));
  const [batches, setBatches] = useState<ProductBatch[]>(() => loadStorage('batches', initialBatches));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStorage('suppliers', initialSuppliers));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStorage('customers', []));
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => loadStorage('purchases', initialPurchases));
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => loadStorage('supplierOrders', initialSupplierOrders));
  const [operationalExpenses, setOperationalExpenses] = useState<OperationalExpense[]>(() => loadStorage('operationalExpenses', initialOperationalExpenses));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadStorage('bankAccounts', initialBankAccounts));
  const [bankStatements, setBankStatements] = useState<BankStatementItem[]>(() => loadStorage('bankStatements', initialBankStatements));
  const [cashSessions, setCashSessions] = useState<CashSession[]>(() => loadStorage('cashSessions', initialCashSessions));
  const [sales, setSales] = useState<Sale[]>(() => loadStorage('sales', initialSales));
  const [returns, setReturns] = useState<SaleReturn[]>(() => loadStorage('returns', initialReturns));
  const [barcodeReturns, setBarcodeReturns] = useState<BarcodeReturn[]>(() => loadStorage('barcodeReturns', initialBarcodeReturns));
  const [movements, setMovements] = useState<InventoryMovement[]>(() => loadStorage('movements', initialMovements));
  const [transfers, setTransfers] = useState<StockTransfer[]>(() => loadStorage('transfers', initialTransfers));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadStorage('alerts', initialAlerts));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage('auditLogs', initialAuditLogs));
  const [settings, setSettings] = useState<Settings>(() => {
    const loaded = loadStorage('settings', initialSettings);
    if (loaded && (loaded.taxRate === undefined || loaded.taxRate === 15)) { loaded.taxRate = 0; }
    if (!loaded.logoUrl) {
      loaded.logoUrl = '/logo.jpg';
    }
    if (!loaded.currencySymbol || loaded.currencySymbol === '$') {
      return { ...loaded, primaryCurrency: 'NIO', currencySymbol: 'C$' };
    }
    return loaded;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStorage('auth_logged_in', false));
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const openProductDetail = (productOrIdOrName: Product | string) => {
    if (typeof productOrIdOrName === 'object' && productOrIdOrName !== null) {
      setSelectedProductDetail(productOrIdOrName);
      return;
    }
    const query = String(productOrIdOrName).toLowerCase().trim();
    const found = products.find((p) =>
      p.id.toLowerCase() === query ||
      p.sku.toLowerCase() === query ||
      (p.barcode && p.barcode.toLowerCase() === query) ||
      p.name.toLowerCase().includes(query) ||
      query.includes(p.name.toLowerCase()) ||
      (p.genericName && p.genericName.toLowerCase().includes(query))
    );
    if (found) {
      setSelectedProductDetail(found);
    } else if (products.length > 0) {
      const words = query.split(/[^a-z0-9]/i).filter(w => w.length >= 4);
      const wordMatch = products.find(p =>
        words.some(w => p.name.toLowerCase().includes(w.toLowerCase()))
      );
      setSelectedProductDetail(wordMatch || products[0]);
    }
  };

  const closeProductDetail = () => {
    setSelectedProductDetail(null);
  };

  // Sincronización automática con almacenamiento local permanente
  useEffect(() => { saveStorage('products', products); }, [products]);
  useEffect(() => { saveStorage('batches', batches); }, [batches]);
  useEffect(() => { saveStorage('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { saveStorage('customers', customers); }, [customers]);
  useEffect(() => { saveStorage('purchases', purchases); }, [purchases]);
  useEffect(() => { saveStorage('supplierOrders', supplierOrders); }, [supplierOrders]);
  useEffect(() => { saveStorage('operationalExpenses', operationalExpenses); }, [operationalExpenses]);
  useEffect(() => { saveStorage('bankAccounts', bankAccounts); }, [bankAccounts]);
  useEffect(() => { saveStorage('bankStatements', bankStatements); }, [bankStatements]);
  useEffect(() => { saveStorage('cashSessions', cashSessions); }, [cashSessions]);
  useEffect(() => { saveStorage('sales', sales); }, [sales]);
  useEffect(() => { saveStorage('returns', returns); }, [returns]);
  useEffect(() => { saveStorage('barcodeReturns', barcodeReturns); }, [barcodeReturns]);
  useEffect(() => { saveStorage('movements', movements); }, [movements]);
  useEffect(() => { saveStorage('transfers', transfers); }, [transfers]);
  useEffect(() => { saveStorage('alerts', alerts); }, [alerts]);
  useEffect(() => { saveStorage('current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveStorage('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveStorage('settings', settings); }, [settings]); 
 
  // Sincronización Automática Multi-Dispositivo en Tiempo Real (Nube / Celular / Laptop)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = React.useRef<boolean>(false);

  // 1. Escuchar y aplicar cambios de la nube de forma segura y optimizada
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isFetching = false;

    const pullFromCloud = async () => {
      if (isFetching) return;
      if (document.hidden || document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      isFetching = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('/api/sync', {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          isFetching = false;
          return;
        }

        const json = await res.json();
        if (json.success && json.data) {
          const serverUpdated = json.lastUpdated || 0;
          
          if (Array.isArray(json.data.products)) {
            setProducts(json.data.products.filter((p: any) => true));
          }
          if (Array.isArray(json.data.batches)) {
            setBatches(json.data.batches.filter((b: any) => true));
          }
          if (Array.isArray(json.data.alerts)) {
            setAlerts(json.data.alerts.filter((a: any) => true));
          }
          if (Array.isArray(json.data.customers)) {
            setCustomers(json.data.customers);
          }
          if (Array.isArray(json.data.sales)) {
            setSales(json.data.sales);
          }
          if (Array.isArray(json.data.movements)) {
            setMovements(json.data.movements);
          }
          if (json.data.settings && typeof json.data.settings === 'object') {
            setSettings(json.data.settings);
          }
          if (Array.isArray(json.data.cashSessions)) {
            setCashSessions(json.data.cashSessions);
          }
          setLastSyncTime(serverUpdated);
        }
      } catch (err) {
        // Modo offline silencioso y protegido
      } finally {
        isFetching = false;
      }
    };

    // Ejecutar al inicio de forma segura
    pullFromCloud();

    // Sincronización inteligente cada 4 segundos solo cuando la pestaña esté activa
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullFromCloud();
      }
    }, 1500);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pullFromCloud();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('online', handleVisibility);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('online', handleVisibility);
    };
  }, []);

  // 2. Transmitir cambios locales a la nube
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (products.length === 0) return; // Nunca enviar inventario vacío por error

    const timer = setTimeout(async () => {
      try {
        const payload = {
          products,
          batches,
          customers,
          sales,
          movements,
          alerts,
          settings,
          cashSessions,
        };
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.lastUpdated) {
            setLastSyncTime(json.lastUpdated);
          }
        }
      } catch (err) {
        // offline fallback
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [products, batches, customers, sales, movements, alerts, settings, cashSessions]);

  // 3. Bloqueo Automático de Seguridad: María y Jonathan se bloquean al salir de la pantalla.
  // EXCEPCIÓN: La Cajera (Fátima / Rol Cajera) mantiene su sesión abierta durante la jornada, cerrando solo con Cierre de Turno o Manual.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCashier = (u: User | null | undefined): boolean => {
      if (!u) return false;
      const uname = (u.username || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return uname === 'fatima' || uname === 'cajera' || uname === 'cajero' || role.includes('cajera') || role.includes('cajero');
    };

    const handleAutoLock = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        if (!isCashier(currentUser)) {
          setIsAuthenticated(false);
          saveStorage('auth_logged_in', false);
        }
      }
    };

    const handlePageHide = () => {
      if (!isCashier(currentUser)) {
        setIsAuthenticated(false);
        saveStorage('auth_logged_in', false);
      }
    };

    document.addEventListener('visibilitychange', handleAutoLock);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleAutoLock);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [currentUser]);



  const clearAllDemoData = () => {
    setProducts([]);
    setBatches([]);
    setSuppliers([]);
    setCustomers([]);
    setPurchases([]);
    setSupplierOrders([]);
    setOperationalExpenses([]);
    setBankStatements([]);
    setCashSessions([]);
    setSales([]);
    setReturns([]);
    setBarcodeReturns([]);
    setMovements([]);
    setTransfers([]);
    setAlerts([]);
    setAuditLogs([]);
    setCart([]);
    if (typeof window !== 'undefined') {
      try {
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith('farmacia_')) window.localStorage.removeItem(k);
        });
      } catch {}
    }
  };

  const restoreDemoData = () => {
    setProducts([]);
    setBatches([]);
    setSuppliers([]);
    setCustomers([]);
    setPurchases([]);
    setSupplierOrders([]);
    setOperationalExpenses([]);
    setBankStatements([]);
    setBankAccounts(initialBankAccounts);
    setCashSessions([]);
    setSales([]);
    setReturns([]);
    setBarcodeReturns([]);
    setMovements([]);
    setTransfers([]);
    setAlerts([]);
    setAuditLogs([]);
  };

  const exportBackupData = (): { success: boolean; filename: string } => {
    try {
      const backup = {
        version: '1.2',
        system: 'Farmacia Espíritu Santo — Sistema Integral de Gestión',
        pharmacyName: settings.pharmacyName,
        exportDate: new Date().toISOString(),
        branch: currentBranch.name,
        data: {
          products,
          batches,
          suppliers,
          customers,
          purchases,
          supplierOrders,
          operationalExpenses,
          bankAccounts,
          bankStatements,
          cashSessions,
          sales,
          returns,
          barcodeReturns,
          movements,
          transfers,
          alerts,
          auditLogs,
          settings,
        },
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `respaldo_farmacia_espiritusanto_${dateStr}_${timeStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err: any) {
      return { success: false, filename: err.message || 'error' };
    }
  };

  const importBackupData = (jsonData: any): { success: boolean; message: string } => {
    try {
      let parsed = jsonData;
      if (typeof jsonData === 'string') {
        parsed = JSON.parse(jsonData);
      }

      const d = parsed?.data || parsed;
      if (!d || typeof d !== 'object') {
        return { success: false, message: 'El archivo no contiene un formato de respaldo válido.' };
      }

      if (Array.isArray(d.products)) setProducts(d.products);
      if (Array.isArray(d.batches)) setBatches(d.batches);
      if (Array.isArray(d.suppliers)) setSuppliers(d.suppliers);
      if (Array.isArray(d.customers)) setCustomers(d.customers);
      if (Array.isArray(d.purchases)) setPurchases(d.purchases);
      if (Array.isArray(d.supplierOrders)) setSupplierOrders(d.supplierOrders);
      if (Array.isArray(d.operationalExpenses)) setOperationalExpenses(d.operationalExpenses);
      if (Array.isArray(d.bankAccounts)) setBankAccounts(d.bankAccounts);
      if (Array.isArray(d.bankStatements)) setBankStatements(d.bankStatements);
      if (Array.isArray(d.cashSessions)) setCashSessions(d.cashSessions);
      if (Array.isArray(d.sales)) setSales(d.sales);
      if (Array.isArray(d.returns)) setReturns(d.returns);
      if (Array.isArray(d.barcodeReturns)) setBarcodeReturns(d.barcodeReturns);
      if (Array.isArray(d.movements)) setMovements(d.movements);
      if (Array.isArray(d.transfers)) setTransfers(d.transfers);
      if (Array.isArray(d.alerts)) setAlerts(d.alerts);
      if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
      if (d.settings && typeof d.settings === 'object') setSettings(d.settings);

      // Force instant storage save
      Object.entries(d).forEach(([key, val]) => {
        saveStorage(key, val);
      });

      return {
        success: true,
        message: `¡Copia de seguridad restaurada con éxito! Se cargaron ${d.products?.length || 0} medicamentos y ${d.sales?.length || 0} ventas.`,
      };
    } catch (err: any) {
      return { success: false, message: `Error al restaurar: ${err.message || 'Formato inválido'}` };
    }
  };

  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // 1. Super Administrador / Creador del Sistema (Jonathan Rojas)
    if (
      trimmedUser === 'jonathan' ||
      trimmedUser === 'jrojas' ||
      trimmedUser === 'creador' ||
      trimmedUser === 'jonathan.rojas@farmaciaespiritusanto.com'
    ) {
      if (
        trimmedPass === 'Jonathan2026*' ||
        trimmedPass === 'jonathan2026' ||
        trimmedPass === 'Jonathan2026' ||
        trimmedPass === 'Rojas2026*'
      ) {
        const jonathanUser = initialUsers.find((u) => u.username === 'jonathan') || initialUsers[0];
        setCurrentUser(jonathanUser);
        setIsAuthenticated(true);
        saveStorage('auth_logged_in', true);
        return { success: true };
      }
      return {
        success: false,
        message: 'Contraseña incorrecta para Super Administrador (Jonathan Rojas).',
      };
    }

    // 2. Propietaria & Administradora (María Tardencilla)
    if (
      trimmedUser === 'maria' ||
      trimmedUser === 'admin' ||
      trimmedUser === 'mariatardencilla' ||
      trimmedUser === 'maria.tardencilla' ||
      trimmedUser === 'maria.tardencilla@farmaciaespiritusanto.com' ||
      trimmedUser === 'maria@farmaciaespiritusanto.com'
    ) {
      if (
        trimmedPass === 'Maria2026*' ||
        trimmedPass === 'maria2026' ||
        trimmedPass === 'Maria2026' ||
        trimmedPass === 'Tardencilla2026*' ||
        trimmedPass === '1234' ||
        trimmedPass === '2026'
      ) {
        const mariaUser = initialUsers.find((u) => u.username === 'maria') || initialUsers[1] || initialUsers[0];
        setCurrentUser(mariaUser);
        setIsAuthenticated(true);
        saveStorage('auth_logged_in', true);
        return { success: true };
      }
      return {
        success: false,
        message: 'Contraseña incorrecta para Propietaria y Administradora (María Tardencilla).',
      };
    }

    // 3. Vendedora & Cajera (Fátima Selene)
    if (
      trimmedUser === 'fatima' ||
      trimmedUser === 'cajero' ||
      trimmedUser === 'cajera' ||
      trimmedUser === 'fatimaselene' ||
      trimmedUser === 'fatima.selene' ||
      trimmedUser === 'fatima.selene@farmaciaespiritusanto.com' ||
      trimmedUser === 'fatima@farmaciaespiritusanto.com'
    ) {
      if (
        trimmedPass === 'Fatima2026*' ||
        trimmedPass === 'fatima2026' ||
        trimmedPass === 'Fatima2026' ||
        trimmedPass === '1234' ||
        trimmedPass === '2026'
      ) {
        const fatimaUser = initialUsers.find((u) => u.username === 'fatima') || initialUsers[2] || initialUsers[0];
        setCurrentUser(fatimaUser);
        setIsAuthenticated(true);
        saveStorage('auth_logged_in', true);
        return { success: true };
      }
      return {
        success: false,
        message: 'Contraseña incorrecta para Vendedora y Cajera (Fátima Selene).',
      };
    }

    // 3. Otros usuarios registrados
    const userFound = initialUsers.find(
      (u) => u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser
    );

    if (userFound && (trimmedPass === `${userFound.username}2026` || trimmedPass === '1234')) {
      setCurrentUser(userFound);
      setIsAuthenticated(true);
      saveStorage('auth_logged_in', true);
      return { success: true };
    }

    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Verifique sus credenciales.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    saveStorage('auth_logged_in', false);
  };

  // Turno de caja actual para la sucursal activa
  const currentCashSession = cashSessions.find(
    (cs) => cs.branchId === currentBranch.id && cs.status === 'Open'
  ) || null;

  // Función de registro en auditoría
  const logAudit = (action: string, module: string, entityName: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      userName: currentUser.username,
      action,
      module,
      entityName,
      entityId,
      details,
      ipAddress: '192.168.1.100',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Obtener lotes disponibles por FEFO
  const getProductBatches = (productId: string, branchId: string = currentBranch.id) => {
    return batches
      .filter((b) => b.productId === productId && b.branchId === branchId)
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  };

  const getAvailableStock = (productId: string, branchId: string = currentBranch.id) => {
    const validBatches = batches.filter(
      (b) =>
        b.productId === productId &&
        b.branchId === branchId &&
        b.status === 'Available' &&
        new Date(b.expirationDate) > new Date() &&
        b.currentQuantity > 0
    );
    return validBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
  };

  const getNextExpiringBatch = (productId: string, branchId: string = currentBranch.id) => {
    const validBatches = batches
      .filter(
        (b) =>
          b.productId === productId &&
          b.branchId === branchId &&
          b.status === 'Available' &&
          new Date(b.expirationDate) > new Date() &&
          b.currentQuantity > 0
      )
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    return validBatches[0];
  };

  // Carrito de ventas POS
  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message: string } => {
    const availableStock = getAvailableStock(product.id);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentCartQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentCartQty + quantity;

    if (requestedTotal > availableStock) {
      return {
        success: false,
        message: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${requestedTotal}`,
      };
    }

    const nextBatch = getNextExpiringBatch(product.id);

    if (existingIndex >= 0) {
      setCart((prev) => {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        const sub = newQty * next[existingIndex].unitPrice;
        const disc = (sub * next[existingIndex].discountPercent) / 100;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          subtotal: sub,
          total: sub - disc,
          allocatedBatch: nextBatch,
        };
        return next;
      });
    } else {
      const sub = quantity * product.salePrice;
      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.salePrice,
        discountPercent: 0,
        subtotal: sub,
        total: sub,
        allocatedBatch: nextBatch,
      };
      setCart((prev) => [...prev, newItem]);
    }

    return { success: true, message: `${product.name} agregado al carrito.` };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const availableStock = getAvailableStock(productId);
    if (quantity > availableStock) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const sub = quantity * item.unitPrice;
          const disc = (sub * item.discountPercent) / 100;
          return {
            ...item,
            quantity,
            subtotal: sub,
            total: sub - disc,
          };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (productId: string, discountPercent: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const sub = item.quantity * item.unitPrice;
          const disc = (sub * Math.min(100, Math.max(0, discountPercent))) / 100;
          return {
            ...item,
            discountPercent,
            total: sub - disc,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAfterDiscount = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = subtotal - totalAfterDiscount;
    // Tasa de IVA 0% fija para medicamentos exentos
    const tax = 0;
    const total = totalAfterDiscount;
    const totalCost = cart.reduce((sum, item) => {
      const cost = item.allocatedBatch ? item.allocatedBatch.unitCost : item.product.purchasePrice;
      return sum + cost * item.quantity;
    }, 0);

    return { subtotal, discount, tax: 0, total, totalCost };
  };

  // Procesar Venta con asignación FEFO y Kardex
  const processSale = (params: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    customerName?: string;
    notes?: string;
  }): { success: boolean; sale?: Sale; message: string } => {
    if (cart.length === 0) {
      return { success: false, message: 'El carrito está vacío.' };
    }

    const totals = getCartTotals();
    if (params.amountPaid < totals.total && params.paymentMethod === 'Cash') {
      return { success: false, message: 'El monto entregado es menor al total a pagar.' };
    }

    const saleItemsDetail: SaleItemDetail[] = [];
    const updatedBatches = [...batches];
    const newMovements: InventoryMovement[] = [];
    const saleId = `sal-${Date.now()}`;
    const invoiceNum = `${settings.invoicePrefix}${String(sales.length + 102).padStart(6, '0')}`;

    // Despacho por lotes FEFO
    for (const item of cart) {
      let needed = item.quantity;
      const productBatches = updatedBatches
        .filter(
          (b) =>
            b.productId === item.product.id &&
            b.branchId === currentBranch.id &&
            b.status === 'Available' &&
            new Date(b.expirationDate) > new Date() &&
            b.currentQuantity > 0
        )
        .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

      for (const batch of productBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.currentQuantity, needed);
        batch.currentQuantity -= take;
        if (batch.currentQuantity === 0) {
          batch.status = 'Depleted';
        }

        const sub = take * item.unitPrice;
        const total = sub - (sub * item.discountPercent) / 100;

        saleItemsDetail.push({
          productId: item.product.id,
          productName: item.product.name,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expirationDate: batch.expirationDate,
          quantity: take,
          unitPrice: item.unitPrice,
          unitCost: batch.unitCost,
          discountPercent: item.discountPercent,
          subtotal: sub,
          total: total,
        });

        // Registrar movimiento en Kardex
        newMovements.push({
          id: `mov-${Date.now()}-${batch.id}`,
          movementType: 'VENTA',
          productId: item.product.id,
          productName: item.product.name,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          quantity: -take,
          previousStock: batch.currentQuantity + take,
          newStock: batch.currentQuantity,
          unitCost: batch.unitCost,
          referenceType: 'SALE',
          referenceId: saleId,
          notes: `Venta ${invoiceNum}`,
          userName: currentUser.username,
          createdAt: new Date().toISOString(),
        });

        needed -= take;
      }
    }

    const profit = totals.total - totals.totalCost;
    const change = params.paymentMethod === 'Cash' ? params.amountPaid - totals.total : 0;

    const newSale: Sale = {
      id: saleId,
      invoiceNumber: invoiceNum,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      cashSessionId: currentCashSession?.id,
      userId: currentUser.id,
      userName: currentUser.username,
      customerName: params.customerName || 'Cliente Mostrador',
      items: saleItemsDetail,
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      taxAmount: totals.tax,
      totalAmount: totals.total,
      costAmount: totals.totalCost,
      profitAmount: profit,
      paymentMethod: params.paymentMethod,
      amountPaid: params.amountPaid,
      changeAmount: change,
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };

    setBatches(updatedBatches);
    setSales((prev) => [newSale, ...prev]);
    setMovements((prev) => [...newMovements, ...prev]);

    // Actualizar caja si hay sesión abierta
    if (currentCashSession) {
      setCashSessions((prev) =>
        prev.map((cs) => {
          if (cs.id === currentCashSession.id) {
            const isCash = params.paymentMethod === 'Cash';
            const isCard = params.paymentMethod === 'Card';
            const isTrf = params.paymentMethod === 'Transfer';
            return {
              ...cs,
              cashSales: isCash ? cs.cashSales + totals.total : cs.cashSales,
              cardSales: isCard ? cs.cardSales + totals.total : cs.cardSales,
              transferSales: isTrf ? cs.transferSales + totals.total : cs.transferSales,
              expectedBalance: isCash ? cs.expectedBalance + totals.total : cs.expectedBalance,
            };
          }
          return cs;
        })
      );
    }

    logAudit(
      'SALE',
      'Punto de Venta',
      'Sale',
      saleId,
      `Venta ${invoiceNum} por ${settings.currencySymbol} ${totals.total.toFixed(2)} (${params.paymentMethod})`
    );

    clearCart();
    return { success: true, sale: newSale, message: `Venta ${invoiceNum} procesada con éxito.` };
  };

  // Procesamiento de Devoluciones Farmacéuticas (Reembolsos & Trazabilidad de Lote)
  const processReturn = (params: {
    saleInvoiceNumber: string;
    reason: ReturnReason;
    reasonDescription: string;
    refundMethod: 'Cash' | 'Card' | 'CreditNote';
    items: {
      productId: string;
      batchNumber: string;
      quantity: number;
      destination: ReturnDestination;
    }[];
  }): { success: boolean; returnRecord?: SaleReturn; message: string } => {
    const sale = sales.find(
      (s) => s.invoiceNumber.toLowerCase().trim() === params.saleInvoiceNumber.toLowerCase().trim()
    );

    if (!sale) {
      return { success: false, message: `Factura ${params.saleInvoiceNumber} no encontrada en el sistema.` };
    }

    if (params.items.length === 0) {
      return { success: false, message: 'Debe seleccionar al menos un medicamento a devolver.' };
    }

    let totalRefund = 0;
    const returnDetails: ReturnItemDetail[] = [];
    const newMovements: InventoryMovement[] = [];

    for (const item of params.items) {
      const originalSaleItem = sale.items.find(
        (si) => si.productId === item.productId && si.batchNumber === item.batchNumber
      ) || sale.items.find((si) => si.productId === item.productId);

      if (!originalSaleItem) {
        return { success: false, message: `El producto seleccionado no pertenece al ticket ${params.saleInvoiceNumber}.` };
      }

      if (item.quantity > originalSaleItem.quantity) {
        return {
          success: false,
          message: `La cantidad (${item.quantity}) excede lo comprado (${originalSaleItem.quantity}) para ${originalSaleItem.productName}.`,
        };
      }

      const itemTotal = item.quantity * originalSaleItem.unitPrice;
      totalRefund += itemTotal;

      returnDetails.push({
        productId: originalSaleItem.productId,
        productName: originalSaleItem.productName,
        batchId: originalSaleItem.batchId,
        batchNumber: originalSaleItem.batchNumber,
        quantityReturned: item.quantity,
        unitPrice: originalSaleItem.unitPrice,
        subtotal: itemTotal,
        destination: item.destination,
      });

      if (item.destination === 'RESTOCK') {
        // Reingreso a inventario disponible
        setBatches((prev) => {
          let updated = false;
          const nextBatches = prev.map((b) => {
            if (
              b.id === originalSaleItem.batchId ||
              (b.productId === originalSaleItem.productId && b.batchNumber === originalSaleItem.batchNumber)
            ) {
              updated = true;
              return {
                ...b,
                currentQuantity: b.currentQuantity + item.quantity,
                status: 'Available' as const,
              };
            }
            return b;
          });

          if (!updated) {
            const fallbackBatch: ProductBatch = {
              id: originalSaleItem.batchId || `batch-${Date.now()}`,
              productId: originalSaleItem.productId,
              branchId: currentBranch.id,
              batchNumber: originalSaleItem.batchNumber || `LOTE-${new Date().getFullYear()}`,
              expirationDate: '2026-12-31',
              initialQuantity: item.quantity,
              currentQuantity: item.quantity,
              unitCost: originalSaleItem.unitCost,
              status: 'Available',
            };
            return [fallbackBatch, ...nextBatches];
          }
          return nextBatches;
        });

        newMovements.push({
          id: `mov-${Date.now()}-${item.productId}`,
          movementType: 'DEVOLUCION',
          productId: originalSaleItem.productId,
          productName: originalSaleItem.productName,
          batchId: originalSaleItem.batchId,
          batchNumber: originalSaleItem.batchNumber,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          quantity: item.quantity,
          previousStock: 0,
          newStock: item.quantity,
          unitCost: originalSaleItem.unitCost,
          notes: `Reingreso por devolución ticket ${sale.invoiceNumber}. Motivo: ${params.reasonDescription || params.reason}`,
          userName: currentUser.username,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Cuarentena / Merma
        newMovements.push({
          id: `mov-${Date.now()}-${item.productId}`,
          movementType: 'AJUSTE',
          productId: originalSaleItem.productId,
          productName: originalSaleItem.productName,
          batchId: originalSaleItem.batchId,
          batchNumber: originalSaleItem.batchNumber,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          quantity: item.quantity,
          previousStock: item.quantity,
          newStock: 0,
          unitCost: originalSaleItem.unitCost,
          notes: `Baja a cuarentena/merma por devolución defectuosa ticket ${sale.invoiceNumber}`,
          userName: currentUser.username,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const returnNumber = `DEV-${new Date().getFullYear()}-${String(returns.length + 1).padStart(3, '0')}`;
    const newReturn: SaleReturn = {
      id: `ret-${Date.now()}`,
      returnNumber,
      saleId: sale.id,
      saleInvoiceNumber: sale.invoiceNumber,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      customerName: sale.customerName || 'Cliente Mostrador',
      reason: params.reason,
      reasonDescription: params.reasonDescription,
      refundMethod: params.refundMethod,
      totalRefundAmount: totalRefund,
      items: returnDetails,
      authorizedBy: currentUser.firstName + ' ' + currentUser.lastName,
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };

    setReturns((prev) => [newReturn, ...prev]);
    if (newMovements.length > 0) {
      setMovements((prev) => [...newMovements, ...prev]);
    }

    if (params.refundMethod === 'Cash' && currentCashSession) {
      addCashMovement('OUT', totalRefund, `Reembolso por devolución ${returnNumber} (${sale.invoiceNumber})`);
    }

    logAudit(
      'RETURN_PROCESSED',
      'Devoluciones',
      'SaleReturn',
      newReturn.id,
      `Devolución ${returnNumber} aprobada por ${settings.currencySymbol} ${totalRefund.toFixed(2)} sobre ticket ${sale.invoiceNumber}`
    );

    return {
      success: true,
      returnRecord: newReturn,
      message: `Devolución ${returnNumber} procesada exitosamente. Total devuelto: ${settings.currencySymbol} ${totalRefund.toFixed(2)}`,
    };
  };

  // Procesamiento de Devolución por CÓDIGO DE BARRAS DIRECTO (Sin tickets)
  const processBarcodeReturn = (params: {
    barcode: string;
    batchNumber?: string;
    quantity: number;
    reason: string;
    sellerJustification: string;
    destination: 'RESTOCK' | 'EXPIRED_QUARANTINE';
    refundMethod: 'Cash' | 'Card' | 'CreditNote';
    customerName?: string;
  }): { success: boolean; returnRecord?: BarcodeReturn; message: string } => {
    const cleanBarcode = params.barcode.trim();
    if (!cleanBarcode) {
      return { success: false, message: 'Debe escanear o ingresar el código de barras del medicamento.' };
    }

    const product = products.find(
      (p) => p.barcode === cleanBarcode || p.sku.toLowerCase() === cleanBarcode.toLowerCase()
    );

    if (!product) {
      return {
        success: false,
        message: `No se encontró ningún medicamento registrado con el código de barras: "${cleanBarcode}". Verifique el escaneo.`,
      };
    }

    if (!params.sellerJustification || params.sellerJustification.trim().length < 8) {
      return {
        success: false,
        message: 'El vendedor debe ingresar obligatoriamente una justificación detallada (mínimo 8 caracteres) del porqué de la devolución.',
      };
    }

    const qty = Math.max(1, params.quantity || 1);
    const productBatches = batches.filter((b) => b.productId === product.id && b.branchId === currentBranch.id);
    const matchedBatch = params.batchNumber
      ? productBatches.find((b) => b.batchNumber === params.batchNumber)
      : productBatches[0];

    const batchNum = matchedBatch?.batchNumber || `LOTE-${new Date().getFullYear()}-RET`;
    const expDate = matchedBatch?.expirationDate || '2026-12-31';
    const unitPrice = product.salePrice;
    const totalRefund = qty * unitPrice;

    if (params.destination === 'RESTOCK') {
      // Reingreso al stock general vendible y reactivación de lote
      const prevQty = matchedBatch ? matchedBatch.currentQuantity : 0;
      if (matchedBatch) {
        setBatches((prev) =>
          prev.map((b) =>
            b.id === matchedBatch.id
              ? { ...b, currentQuantity: b.currentQuantity + qty, status: 'Available' as const }
              : b
          )
        );
      } else {
        const newBatch: ProductBatch = {
          id: `batch-${Date.now()}`,
          productId: product.id,
          branchId: currentBranch.id,
          batchNumber: batchNum,
          expirationDate: expDate,
          initialQuantity: qty,
          currentQuantity: qty,
          unitCost: product.purchasePrice,
          status: 'Available',
        };
        setBatches((prev) => [newBatch, ...prev]);
      }

      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-ret`,
        movementType: 'DEVOLUCION',
        productId: product.id,
        productName: product.name,
        batchId: matchedBatch?.id,
        batchNumber: batchNum,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        quantity: qty,
        previousStock: prevQty,
        newStock: prevQty + qty,
        unitCost: product.purchasePrice,
        notes: `Devolución por escaneo de código de barras. Re-stock en inventario activo. Vendedor: ${currentUser.username}. Justificación: ${params.sellerJustification}`,
        userName: currentUser.username,
        createdAt: new Date().toISOString(),
      };
      setMovements((prev) => [mov, ...prev]);
    } else {
      // TRASLADO AL ESPACIO DE MEDICAMENTOS VENCIDOS / CUARENTENA
      // NO se mezcla con el stock activo disponible.
      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-venc`,
        movementType: 'VENCIMIENTO',
        productId: product.id,
        productName: product.name,
        batchId: matchedBatch?.id,
        batchNumber: batchNum,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        quantity: qty,
        previousStock: qty,
        newStock: 0,
        unitCost: product.purchasePrice,
        notes: `Medicamento derivado al Área de Medicamentos Vencidos / Bajas Sanitarias. Motivo: ${params.reason}. Justificación: ${params.sellerJustification}`,
        userName: currentUser.username,
        createdAt: new Date().toISOString(),
      };
      setMovements((prev) => [mov, ...prev]);
    }

    const returnNumber = `DEV-${new Date().getFullYear()}-${String(barcodeReturns.length + 1).padStart(3, '0')}`;
    const newRecord: BarcodeReturn = {
      id: `ret-bc-${Date.now()}`,
      returnNumber,
      barcode: cleanBarcode,
      productId: product.id,
      productName: product.name,
      genericName: product.genericName,
      presentation: product.presentation,
      laboratoryName: product.laboratoryName,
      batchNumber: batchNum,
      expirationDate: expDate,
      quantityReturned: qty,
      unitPrice,
      totalRefundAmount: totalRefund,
      refundMethod: params.refundMethod,
      destination: params.destination,
      reason: params.reason,
      sellerJustification: params.sellerJustification.trim(),
      vendorName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.username,
      customerName: params.customerName || 'Cliente Mostrador',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      createdAt: new Date().toISOString(),
    };

    setBarcodeReturns((prev) => [newRecord, ...prev]);

    // Si el reembolso es en efectivo, rebajarlo de la caja registradora activa
    if (params.refundMethod === 'Cash' && currentCashSession) {
      addCashMovement('OUT', totalRefund, `Reembolso devolución ${returnNumber} (${product.name} x${qty})`);
    }

    logAudit(
      'BARCODE_RETURN',
      'Devoluciones',
      'BarcodeReturn',
      newRecord.id,
      `Devolución por código de barra ${cleanBarcode} (${product.name} x${qty}). Destino: ${
        params.destination === 'EXPIRED_QUARANTINE' ? 'Área Vencidos' : 'Re-Stock'
      }. Vendedor: ${currentUser.username}. Justificación: ${params.sellerJustification}`
    );

    return {
      success: true,
      returnRecord: newRecord,
      message: `Devolución ${returnNumber} procesada con éxito. Reembolso: ${settings.currencySymbol} ${totalRefund.toFixed(2)}. ${
        params.destination === 'EXPIRED_QUARANTINE'
          ? 'Medicamento enviado al Área Especial de Medicamentos Vencidos.'
          : 'Medicamento reingresado al inventario activo.'
      }`,
    };
  };

  // Gestión de productos y lotes
  const addProduct = (
    productData: Omit<Product, 'id'>,
    initialBatch?: { batchNumber: string; expirationDate: string; quantity: number; unitCost: number }
  ) => {
    const newId = `p-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (initialBatch && initialBatch.quantity > 0) {
      const newBatch: ProductBatch = {
        id: `bat-${Date.now()}`,
        productId: newId,
        branchId: currentBranch.id,
        batchNumber: initialBatch.batchNumber,
        expirationDate: initialBatch.expirationDate,
        initialQuantity: initialBatch.quantity,
        currentQuantity: initialBatch.quantity,
        unitCost: initialBatch.unitCost,
        status: 'Available',
      };
      setBatches((prev) => [...prev, newBatch]);

      setMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          movementType: 'INICIAL',
          productId: newId,
          productName: newProduct.name,
          batchId: newBatch.id,
          batchNumber: newBatch.batchNumber,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          quantity: initialBatch.quantity,
          previousStock: 0,
          newStock: initialBatch.quantity,
          unitCost: initialBatch.unitCost,
          notes: 'Inventario inicial de nuevo producto',
          userName: currentUser.username,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    logAudit('CREATE', 'Productos', 'Product', newId, `Creación de producto: ${newProduct.name}`);
  };

    const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setBatches((prev) => prev.filter((b) => b.productId !== productId));
    setMovements((prev) => prev.filter((m) => m.productId !== productId));
    if (prod) {
      logAudit('DELETE', 'Productos', 'Product', productId, `Eliminación de producto: ${prod.name}`);
    }
  };

  const clearAllProducts = () => {
    setProducts([]);
    setBatches([]);
    setMovements([]);
    setAlerts([]);
    logAudit('DELETE', 'Productos', 'Product', 'ALL', 'Limpieza total del catálogo de productos y lotes');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logAudit('UPDATE', 'Productos', 'Product', updated.id, `Actualización de producto: ${updated.name}`);
  };

  const addBatch = (batchData: Omit<ProductBatch, 'id'>) => {
    const newId = `bat-${Date.now()}`;
    const newBatch: ProductBatch = { ...batchData, id: newId };
    setBatches((prev) => [...prev, newBatch]);

    const prod = products.find((p) => p.id === batchData.productId);
    setMovements((prev) => [
      {
        id: `mov-${Date.now()}`,
        movementType: 'COMPRA',
        productId: batchData.productId,
        productName: prod?.name || 'Medicamento',
        batchId: newId,
        batchNumber: batchData.batchNumber,
        branchId: batchData.branchId,
        branchName: currentBranch.name,
        quantity: batchData.initialQuantity,
        previousStock: 0,
        newStock: batchData.initialQuantity,
        unitCost: batchData.unitCost,
        notes: `Recepción de lote ${batchData.batchNumber}`,
        userName: currentUser.username,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    logAudit('CREATE', 'Lotes', 'ProductBatch', newId, `Nuevo lote ${batchData.batchNumber} ingresado`);
  };

  // Cajas
  const openCashSession = (openingBalance: number, notes?: string) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      cashRegisterId: 'cr-01',
      cashRegisterName: 'Caja Principal',
      branchId: currentBranch.id,
      userId: currentUser.id,
      userName: currentUser.username,
      openedAt: new Date().toISOString(),
      openingBalance,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedBalance: openingBalance,
      status: 'Open',
      notes,
    };
    setCashSessions((prev) => [newSession, ...prev]);
    logAudit('CASH_OPEN', 'Caja', 'CashSession', newSession.id, `Apertura con $${openingBalance.toFixed(2)}`);
  };

  const closeCashSession = (actualBalance: number, notes?: string) => {
    if (!currentCashSession) return;
    const diff = actualBalance - currentCashSession.expectedBalance;
    setCashSessions((prev) =>
      prev.map((cs) => {
        if (cs.id === currentCashSession.id) {
          return {
            ...cs,
            closedAt: new Date().toISOString(),
            actualBalance,
            difference: diff,
            status: 'Closed',
            notes: notes ? `${cs.notes || ''} - Cierre: ${notes}` : cs.notes,
          };
        }
        return cs;
      })
    );

    if (Math.abs(diff) > 0.01) {
      setAlerts((prev) => [
        {
          id: `alt-${Date.now()}`,
          type: 'CashDiscrepancy',
          severity: 'Critical',
          title: 'Descuadre en Cierre de Caja',
          message: `Diferencia de $${diff.toFixed(2)} en cierre de turno por ${currentUser.username}`,
          branchId: currentBranch.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    logAudit(
      'CASH_CLOSE',
      'Caja',
      'CashSession',
      currentCashSession.id,
      `Cierre de caja. Esperado: $${(currentCashSession.expectedBalance || 0).toFixed(2)}, Contado: $${actualBalance.toFixed(2)}, Dif: $${diff.toFixed(2)}`
    );
  };

  const addCashMovement = (type: 'IN' | 'OUT', amount: number, reason: string) => {
    if (!currentCashSession) return;
    setCashSessions((prev) =>
      prev.map((cs) => {
        if (cs.id === currentCashSession.id) {
          const cashIn = type === 'IN' ? cs.cashIn + amount : cs.cashIn;
          const cashOut = type === 'OUT' ? cs.cashOut + amount : cs.cashOut;
          const expected = cs.openingBalance + cs.cashSales + cashIn - cashOut;
          return { ...cs, cashIn, cashOut, expectedBalance: expected };
        }
        return cs;
      })
    );
    logAudit(
      type === 'IN' ? 'CASH_IN' : 'CASH_OUT',
      'Caja',
      'CashMovement',
      currentCashSession.id,
      `${type === 'IN' ? 'Ingreso' : 'Retiro'} de $${amount.toFixed(2)}: ${reason}`
    );
  };

  // Transferencias
  const createTransfer = (targetBranchId: string, items: { productId: string; batchNumber: string; quantity: number }[]) => {
    const targetBranch = branches.find((b) => b.id === targetBranchId);
    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${String(transfers.length + 1).padStart(3, '0')}`,
      sourceBranchId: currentBranch.id,
      sourceBranchName: currentBranch.name,
      targetBranchId,
      targetBranchName: targetBranch?.name || 'Otra Sucursal',
      originUserName: currentUser.username,
      items: items.map((i) => {
        const p = products.find((prod) => prod.id === i.productId);
        return {
          productId: i.productId,
          productName: p?.name || 'Medicamento',
          batchNumber: i.batchNumber,
          quantity: i.quantity,
        };
      }),
      status: 'InTransit',
      createdAt: new Date().toISOString(),
    };
    setTransfers((prev) => [newTransfer, ...prev]);
    logAudit('TRANSFER', 'Inventario', 'StockTransfer', newTransfer.id, `Envío de transferencia ${newTransfer.transferNumber}`);
  };

  const receiveTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Received', receivedAt: new Date().toISOString() } : t))
    );
    logAudit('TRANSFER_RECEIVE', 'Inventario', 'StockTransfer', transferId, `Transferencia recibida`);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    logAudit('SUPPLIER_ADDED', 'Proveedores', 'Supplier', newSup.id, `Proveedor registrado: ${newSup.name}`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit('CUSTOMER_ADDED', 'Clientes', 'Customer', newCust.id, `Cliente registrado: ${newCust.name}`);
  };

  const addPurchase = (purchaseData: Omit<PurchaseInvoice, 'id'>) => {
    const newPur: PurchaseInvoice = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
    };
    setPurchases((prev) => [newPur, ...prev]);

    if (newPur.receptionStatus === 'Received') {
      newPur.items.forEach((item) => {
        addBatch({
          productId: item.productId,
          branchId: currentBranch.id,
          batchNumber: item.batchNumber,
          expirationDate: item.expirationDate,
          initialQuantity: item.quantityReceived,
          currentQuantity: item.quantityReceived,
          unitCost: item.unitCost,
          supplierId: newPur.supplierId,
          status: 'Available',
        });
      });
    }

    logAudit(
      'PURCHASE_REGISTERED',
      'Compras',
      'PurchaseInvoice',
      newPur.id,
      `Factura compra ${newPur.invoiceNumber} registrada a ${newPur.supplierName} por $${(newPur.totalAmount || 0).toFixed(2)}`
    );
  };

  const addSupplierOrder = (
    orderData: Omit<SupplierOrder, 'id' | 'orderNumber' | 'accessCode' | 'status' | 'history'>
  ): SupplierOrder => {
    const orderNumStr = String(supplierOrders.length + 1).padStart(3, '0');
    const orderNumber = `ORD-2026-${orderNumStr}`;
    const initials = orderData.supplierName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase();
    const accessCode = `PROV-${initials || 'LAB'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: SupplierOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      accessCode,
      status: 'PENDING_REVIEW',
      history: [
        {
          status: 'PENDING_REVIEW',
          timestamp: new Date().toISOString(),
          note: `Pedido emitido por Farmacia Espíritu Santo (${currentBranch.name}).`,
          actor: currentUser.fullName || currentUser.username,
        },
      ],
    };

    setSupplierOrders((prev) => [newOrder, ...prev]);

    logAudit(
      'SUPPLIER_ORDER_CREATED',
      'Compras',
      'SupplierOrder',
      newOrder.id,
      `Pedido ${newOrder.orderNumber} emitido a ${newOrder.supplierName} por $${newOrder.totalEstimated.toFixed(2)} (Código de Acceso: ${accessCode})`
    );

    return newOrder;
  };

  const updateOrderStatusBySupplier = ({
    orderId,
    newStatus,
    supplierInvoiceNumber,
    estimatedDeliveryDate,
    deliveryDriver,
    driverPhone,
    supplierNotes,
    actor,
  }: {
    orderId: string;
    newStatus: SupplierOrderStatus;
    supplierInvoiceNumber?: string;
    estimatedDeliveryDate?: string;
    deliveryDriver?: string;
    driverPhone?: string;
    supplierNotes?: string;
    actor: string;
  }) => {
    const targetOrder = supplierOrders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Orden no encontrada' };
    }

    let statusText = '';
    switch (newStatus) {
      case 'IN_PREPARATION':
        statusText = 'Pedido aceptado y en proceso de preparación en bodega del proveedor';
        break;
      case 'SHIPPED':
        statusText = `Pedido despachado y en ruta hacia ${targetOrder.branchName}`;
        break;
      case 'DELIVERED':
        statusText = 'Pedido entregado y recibido en la sucursal';
        break;
      case 'CANCELLED':
        statusText = 'Pedido cancelado por el proveedor';
        break;
      default:
        statusText = 'Estado actualizado por el proveedor';
    }

    const updatedOrder: SupplierOrder = {
      ...targetOrder,
      status: newStatus,
      supplierInvoiceNumber: supplierInvoiceNumber || targetOrder.supplierInvoiceNumber,
      estimatedDeliveryDate: estimatedDeliveryDate || targetOrder.estimatedDeliveryDate,
      deliveryDriver: deliveryDriver || targetOrder.deliveryDriver,
      driverPhone: driverPhone || targetOrder.driverPhone,
      supplierNotes: supplierNotes || targetOrder.supplierNotes,
      lastUpdatedBySupplier: new Date().toISOString(),
      history: [
        ...targetOrder.history,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: supplierNotes ? `${statusText}. Nota: ${supplierNotes}` : statusText,
          actor: actor || targetOrder.supplierName,
        },
      ],
    };

    setSupplierOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    logAudit(
      'SUPPLIER_ORDER_UPDATED',
      'Portal Proveedores',
      'SupplierOrder',
      orderId,
      `El proveedor ${targetOrder.supplierName} actualizó la orden ${targetOrder.orderNumber} a ${newStatus}`
    );

    return {
      success: true,
      message: `Pedido ${targetOrder.orderNumber} actualizado a ${newStatus} exitosamente.`,
    };
  };

  const addOperationalExpense = (
    expenseData: Omit<OperationalExpense, 'id' | 'expenseNumber' | 'createdAt'>
  ) => {
    const numStr = String(operationalExpenses.length + 1).padStart(3, '0');
    const newExpense: OperationalExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber: `GTO-2026-${numStr}`,
      createdAt: new Date().toISOString(),
    };
    setOperationalExpenses((prev) => [newExpense, ...prev]);
    logAudit(
      'EXPENSE_REGISTERED',
      'Gastos Operativos',
      'OperationalExpense',
      newExpense.id,
      `Gasto operativo ${newExpense.expenseNumber} registrado por $${newExpense.amount.toFixed(2)} (${newExpense.description})`
    );
  };

  const matchBankTransaction = (bankStatementId: string, systemReferenceId: string) => {
    setBankStatements((prev) =>
      prev.map((item) => {
        if (item.id === bankStatementId) {
          return {
            ...item,
            isReconciled: true,
            matchedSystemId: systemReferenceId,
            reconciledAt: new Date().toISOString(),
            reconciledBy: currentUser.fullName || currentUser.username,
          };
        }
        return item;
      })
    );
    logAudit(
      'BANK_RECONCILED',
      'Conciliación Bancaria',
      'BankStatementItem',
      bankStatementId,
      `Movimiento bancario ${bankStatementId} conciliado con transacción ${systemReferenceId}`
    );
  };

  const unmatchBankTransaction = (bankStatementId: string) => {
    setBankStatements((prev) =>
      prev.map((item) => {
        if (item.id === bankStatementId) {
          return {
            ...item,
            isReconciled: false,
            matchedSystemId: undefined,
            reconciledAt: undefined,
            reconciledBy: undefined,
          };
        }
        return item;
      })
    );
    logAudit(
      'BANK_UNMATCHED',
      'Conciliación Bancaria',
      'BankStatementItem',
      bankStatementId,
      `Movimiento bancario ${bankStatementId} desconciliado`
    );
  };

  const autoReconcileBank = (bankAccountId: string) => {
    let matchedCount = 0;
    setBankStatements((prev) =>
      prev.map((item) => {
        if (item.bankAccountId !== bankAccountId || item.isReconciled) {
          return item;
        }

        const matchingSale = sales.find(
          (s) =>
            !prev.some((other) => other.matchedSystemId === s.id) &&
            Math.abs(s.totalAmount - (item.credit + (item.feeDeducted || 0))) < 0.05
        );

        if (matchingSale) {
          matchedCount++;
          return {
            ...item,
            isReconciled: true,
            matchedSystemId: matchingSale.id,
            reconciledAt: new Date().toISOString(),
            reconciledBy: 'Auto-Conciliador Inteligente',
            notes: `Auto-conciliado con venta ${matchingSale.invoiceNumber}`,
          };
        }

        const matchingExpense = operationalExpenses.find(
          (exp) =>
            !prev.some((other) => other.matchedSystemId === exp.id) &&
            Math.abs(exp.amount - item.debit) < 0.05
        );

        if (matchingExpense) {
          matchedCount++;
          return {
            ...item,
            isReconciled: true,
            matchedSystemId: matchingExpense.id,
            reconciledAt: new Date().toISOString(),
            reconciledBy: 'Auto-Conciliador Inteligente',
            notes: `Auto-conciliado con gasto ${matchingExpense.expenseNumber}`,
          };
        }

        return item;
      })
    );

    logAudit(
      'BANK_AUTORECONCILED',
      'Conciliación Bancaria',
      'BankAccount',
      bankAccountId,
      `Auto-conciliación ejecutada. ${matchedCount} partidas cuadradas.`
    );

    return {
      matchedCount,
      message:
        matchedCount > 0
          ? `¡Se conciliaron automáticamente ${matchedCount} transacciones bancarias coincidentes!`
          : 'No se encontraron nuevas partidas coincidentes pendientes por conciliar.',
    };
  };

  const addBankStatementItem = (itemData: Omit<BankStatementItem, 'id' | 'isReconciled'>) => {
    const newItem: BankStatementItem = {
      ...itemData,
      id: `stmt-${Date.now()}`,
      isReconciled: false,
    };
    setBankStatements((prev) => [newItem, ...prev]);
    logAudit(
      'BANK_STATEMENT_ADDED',
      'Conciliación Bancaria',
      'BankStatementItem',
      newItem.id,
      `Línea de extracto bancario agregada: ${newItem.concept} por $${(newItem.credit || newItem.debit).toFixed(2)}`
    );
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    logAudit('UPDATE', 'Configuración', 'Settings', 'global', 'Configuración institucional actualizada');
  };

  const syncNow = async () => {
    if (typeof window === 'undefined') return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.products)) setProducts(json.data.products);
          if (Array.isArray(json.data.batches)) setBatches(json.data.batches);
          if (Array.isArray(json.data.alerts)) setAlerts(json.data.alerts);
          if (Array.isArray(json.data.customers)) setCustomers(json.data.customers);
          if (Array.isArray(json.data.sales)) setSales(json.data.sales);
          if (Array.isArray(json.data.movements)) setMovements(json.data.movements);
          if (json.data.settings && typeof json.data.settings === 'object') setSettings(json.data.settings);
          if (Array.isArray(json.data.cashSessions)) setCashSessions(json.data.cashSessions);
          if (json.lastUpdated) setLastSyncTime(json.lastUpdated);
        }
      }
    } catch {
      // silent
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <PharmacyContext.Provider
      value={{
        selectedProductDetail,
        openProductDetail,
        closeProductDetail,
        branches,
        currentBranch,
        setCurrentBranch,
        currentUser,
        setCurrentUser,
        categories,
        products,
        batches,
        suppliers,
        customers,
        purchases,
        supplierOrders,
        operationalExpenses,
        bankAccounts,
        bankStatements,
        addSupplier,
        addCustomer,
        addPurchase,
        addSupplierOrder,
        updateOrderStatusBySupplier,
        addOperationalExpense,
        matchBankTransaction,
        unmatchBankTransaction,
        autoReconcileBank,
        addBankStatementItem,
        cashSessions,
        currentCashSession,
        sales,
        returns,
        barcodeReturns,
        movements,
        transfers,
        alerts,
        auditLogs,
        settings,
        updateSettings,
        syncNow,
        isSyncing,
        cart,
        addToCart,
        updateCartQuantity,
        updateCartDiscount,
        removeFromCart,
        clearCart,
        getCartTotals,
        processSale,
        processReturn,
        processBarcodeReturn,
        addProduct,
        updateProduct,
    deleteProduct,
    clearAllProducts,
        addBatch,
        getProductBatches,
        getAvailableStock,
        getNextExpiringBatch,
        openCashSession,
        closeCashSession,
        addCashMovement,
        createTransfer,
        receiveTransfer,
        markAlertAsRead,
        clearAllDemoData,
        restoreDemoData,
        exportBackupData,
        importBackupData,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy debe utilizarse dentro de un PharmacyProvider');
  }
  return context;
};
