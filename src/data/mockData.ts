import {
  Branch,
  User,
  Category,
  Laboratory,
  Product,
  ProductBatch,
  Supplier,
  Customer,
  CashSession,
  Sale,
  InventoryMovement,
  StockTransfer,
  Alert,
  AuditLog,
  Settings,
  SaleReturn,
  BarcodeReturn,
  PurchaseInvoice,
  SupplierOrder,
  OperationalExpense,
  BankAccount,
  BankStatementItem,
} from '../types/pharmacy';

export const initialBranches: Branch[] = [
  {
    id: 'br-01',
    code: '19-JUL',
    name: 'Sucursal 19 de Julio (Central)',
    address: 'Costado Norte Parque 19 de Julio, Managua, Nicaragua',
    phone: '+505 2255-8899',
    email: 'sucursal19@farmaciaespiritusanto.com',
    isActive: true,
  },
  {
    id: 'br-02',
    code: 'SUC-02',
    name: 'Sucursal Ciudad Jardín',
    address: 'Semáforos Ciudad Jardín 2c al Este, Managua, Nicaragua',
    phone: '+505 2244-1122',
    email: 'jardin@farmaciaespiritusanto.com',
    isActive: true,
  },
  {
    id: 'br-03',
    code: 'SUC-03',
    name: 'Sucursal Linda Vista',
    address: 'Centro Comercial Linda Vista Módulo 14, Managua',
    phone: '+505 2266-3344',
    email: 'lindavista@farmaciaespiritusanto.com',
    isActive: true,
  },
];

export const initialUsers: User[] = [
  {
    id: 'usr-master',
    username: 'jonathan',
    email: 'jonathan.rojas@farmaciaespiritusanto.com',
    firstName: 'Jonathan',
    lastName: 'Rojas',
    phone: '+505 8888-0001',
    role: 'Super Administrador (Creador)',
    defaultBranchId: 'br-01',
    isActive: true,
  },
  {
    id: 'usr-01',
    username: 'maria',
    email: 'maria.tardencilla@farmaciaespiritusanto.com',
    firstName: 'María',
    lastName: 'Tardencilla',
    phone: '+505 8888-1111',
    role: 'Propietaria & Administradora',
    defaultBranchId: 'br-01',
    isActive: true,
  },
  {
    id: 'usr-02',
    username: 'fatima',
    email: 'fatima.selene@farmaciaespiritusanto.com',
    firstName: 'Fátima',
    lastName: 'Selene',
    phone: '+505 8888-2222',
    role: 'Vendedora & Cajera (POS)',
    defaultBranchId: 'br-01',
    isActive: true,
  },
];

export const initialCategories: Category[] = [
  { id: 'cat-01', code: 'ANALG', name: 'Analgésicos y Antiinflamatorios', description: 'Alivio del dolor, fiebre e inflamación' },
  { id: 'cat-02', code: 'ANTIB', name: 'Antibióticos', description: 'Tratamiento de infecciones bacterianas' },
  { id: 'cat-03', code: 'CARDIO', name: 'Cardiovascular y Presión', description: 'Presión arterial, arritmias y salud cardíaca' },
  { id: 'cat-04', code: 'GASTRO', name: 'Gastrointestinales', description: 'Antiácidos, protectores y antidiarreicos' },
  { id: 'cat-05', code: 'RESP', name: 'Respiratorios y Antigripales', description: 'Antihistamínicos, jarabes y descongestionantes' },
  { id: 'cat-06', code: 'VITAM', name: 'Vitaminas y Suplementos', description: 'Multivitamínicos, minerales y defensas' },
  { id: 'cat-07', code: 'DIAB', name: 'Diabetes y Metabolismo', description: 'Hipoglucemiantes orales e insulinas' },
  { id: 'cat-08', code: 'DERMA', name: 'Dermatología y Primeros Auxilios', description: 'Cremas tópicas, antisépticos y curación' },
  { id: 'cat-09', code: 'PEDIA', name: 'Pediatría y Maternidad', description: 'Sueros de rehidratación, gotas infantiles y cuidado' },
  { id: 'cat-10', code: 'CONTR', name: 'Medicamentos Controlados (Psicotrópicos)', description: 'Fármacos sujetos a fiscalización y receta retenida' },
];

export const initialLaboratories: Laboratory[] = [
  { id: 'lab-01', name: 'Laboratorios Vijosa', country: 'El Salvador' },
  { id: 'lab-02', name: 'Bayer HealthCare', country: 'Alemania' },
  { id: 'lab-03', name: 'Pfizer', country: 'Estados Unidos' },
  { id: 'lab-04', name: 'MK / Tecnoquímicas', country: 'Colombia' },
  { id: 'lab-05', name: 'Laboratorios Ramos', country: 'Nicaragua' },
  { id: 'lab-06', name: 'Sanofi', country: 'Francia' },
  { id: 'lab-07', name: 'GSK (GlaxoSmithKline)', country: 'Reino Unido' },
  { id: 'lab-08', name: 'Procter & Gamble Health', country: 'Estados Unidos' },
  { id: 'lab-09', name: 'Laboratorios Rarpe', country: 'Nicaragua' },
  { id: 'lab-10', name: 'Abbott Laboratories', country: 'Estados Unidos' },
];

// INVENTARIO Y MOVIMIENTOS COMPLETAMENTE LIMPIOS PARA PRODUCCIÓN
export const initialProducts: Product[] = [];
export const initialBatches: ProductBatch[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialCustomers: Customer[] = [];
export const initialCashSessions: CashSession[] = [];
export const initialSales: Sale[] = [];
export const initialMovements: InventoryMovement[] = [];
export const initialTransfers: StockTransfer[] = [];
export const initialAlerts: Alert[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialReturns: SaleReturn[] = [];
export const initialBarcodeReturns: BarcodeReturn[] = [];
export const initialPurchases: PurchaseInvoice[] = [];
export const initialSupplierOrders: SupplierOrder[] = [];
export const initialOperationalExpenses: OperationalExpense[] = [];

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-01',
    bankName: 'BAC Credomatic',
    accountNumber: '360-123456-7',
    accountType: 'Corriente',
    currency: 'NIO',
    initialBalance: 0,
    currentBalance: 0,
    branchId: 'br-01',
    isActive: true,
  },
  {
    id: 'bank-02',
    bankName: 'Banco LAFISE Bancentro',
    accountNumber: '102-987654-3',
    accountType: 'Ahorros',
    currency: 'NIO',
    initialBalance: 0,
    currentBalance: 0,
    branchId: 'br-01',
    isActive: true,
  },
];

export const initialBankStatements: BankStatementItem[] = [];

export const initialSettings: Settings = {
  pharmacyName: 'Farmacia Espíritu Santo',
  logoUrl: '/logo.jpg',
  taxNumber: 'J0310000123456',
  phone: '+505 2255-8899',
  email: 'contacto@farmaciaespiritusanto.com',
  address: 'Costado Norte Parque 19 de Julio, Managua, Nicaragua',
  primaryCurrency: 'NIO',
  currencySymbol: 'C$',
  taxRate: 15,
  invoicePrefix: 'FAC-01-',
  ticketFooter: '¡Gracias por confiar en Farmacia Espíritu Santo! Que Dios bendiga su salud.',
  expiringAlertDays1: 90,
  expiringAlertDays2: 60,
  expiringAlertDays3: 30,
};
