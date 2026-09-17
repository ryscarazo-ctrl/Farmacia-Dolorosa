export type BatchStatus = 'Available' | 'Reserved' | 'Expired' | 'Damaged' | 'Blocked' | 'Depleted';

export type MovementType =
  | 'COMPRA'
  | 'VENTA'
  | 'DEVOLUCION'
  | 'AJUSTE'
  | 'DEVOLUCION_COMPRA'
  | 'DEVOLUCION_VENTA'
  | 'AJUSTE_ENTRADA'
  | 'AJUSTE_SALIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'TRANSFERENCIA_SALIDA'
  | 'VENCIMIENTO'
  | 'DANADO'
  | 'MERMA'
  | 'INICIAL';

export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Credit' | 'Other';
export type SaleStatus = 'Completed' | 'Cancelled' | 'Returned';
export type CashSessionStatus = 'Open' | 'Closed';
export type TransferStatus = 'Pending' | 'Preparing' | 'InTransit' | 'Received' | 'Cancelled';

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone: string;
  role: string;
  defaultBranchId: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Laboratory {
  id: string;
  name: string;
  country: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  branchId: string;
  batchNumber: string;
  manufactureDate?: string;
  expirationDate: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  supplierId?: string;
  status: BatchStatus;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  genericName?: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  laboratoryId?: string;
  laboratoryName?: string;
  presentation: string;
  concentration?: string;
  unitMeasure: string;
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  maxStock: number;
  requiresPrescription: boolean;
  isControlled: boolean;
  isActive: boolean;
  batches?: ProductBatch[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  total: number;
  allocatedBatch?: ProductBatch;
}

export interface SaleItemDetail {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  subtotal: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  branchId: string;
  branchName: string;
  cashSessionId?: string;
  userId: string;
  userName: string;
  customerId?: string;
  customerName?: string;
  items: SaleItemDetail[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  costAmount: number;
  profitAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  status: SaleStatus;
  createdAt: string;
}

export type ReturnReason =
  | 'DISPENSATION_ERROR'    // Error en dispensación
  | 'DEFECTIVE_PRODUCT'     // Producto defectuoso / Empaque dañado
  | 'ADVERSE_REACTION'      // Reacción adversa / Cambio de receta
  | 'CLIENT_CANCELLATION'   // Desistimiento del cliente
  | 'EXPIRED_ON_SHELF';     // Producto no conforme

export type ReturnDestination = 'RESTOCK' | 'QUARANTINE_WASTE';

export interface ReturnItemDetail {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantityReturned: number;
  unitPrice: number;
  subtotal: number;
  destination: ReturnDestination;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  saleId?: string;
  saleInvoiceNumber?: string;
  branchId: string;
  branchName: string;
  customerName: string;
  reason: ReturnReason;
  reasonDescription: string;
  refundMethod: 'Cash' | 'Card' | 'CreditNote';
  totalRefundAmount: number;
  items: ReturnItemDetail[];
  authorizedBy: string;
  status: 'Completed' | 'PendingApproval';
  createdAt: string;
}

export interface BarcodeReturn {
  id: string;
  returnNumber: string;
  barcode: string;
  productId: string;
  productName: string;
  genericName?: string;
  presentation: string;
  laboratoryName?: string;
  batchNumber: string;
  expirationDate: string;
  quantityReturned: number;
  unitPrice: number;
  totalRefundAmount: number;
  refundMethod: 'Cash' | 'Card' | 'CreditNote';
  destination: 'RESTOCK' | 'EXPIRED_QUARANTINE';
  reason: string;
  sellerJustification: string;
  vendorName: string;
  customerName?: string;
  branchId: string;
  branchName: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  movementType: MovementType;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  branchId: string;
  branchName: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  userName: string;
  createdAt: string;
}

export interface CashSession {
  id: string;
  cashRegisterId: string;
  cashRegisterName: string;
  branchId: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  cashIn: number;
  cashOut: number;
  expectedBalance: number;
  actualBalance?: number;
  difference?: number;
  status: CashSessionStatus;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  businessName: string;
  taxId: string;
  phone: string;
  email: string;
  contactName: string;
  creditDays: number;
}

export interface PurchaseItemDetail {
  productId: string;
  productName: string;
  barcode: string;
  batchNumber: string;
  expirationDate: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  orderDate: string;
  deliveryDate?: string;
  paymentTerm: 'Contado' | 'Credito 15 dias' | 'Credito 30 dias' | 'Credito 45 dias';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  receptionStatus: 'Received' | 'Partial' | 'Pending';
  totalAmount: number;
  items: PurchaseItemDetail[];
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export type SupplierOrderStatus = 
  | 'PENDING_REVIEW'     // Emitido por farmacia, esperando revisión del proveedor
  | 'IN_PREPARATION'     // En bodega del proveedor preparando
  | 'SHIPPED'            // Despachado / En ruta hacia la sucursal
  | 'DELIVERED'          // Recibido conforme en farmacia
  | 'CANCELLED';

export interface SupplierOrderItem {
  productId: string;
  productName: string;
  genericName?: string;
  barcode: string;
  presentation: string;
  quantityRequested: number;
  estimatedUnitCost: number;
  subtotal: number;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;        // ej. ORD-2026-078
  accessCode: string;         // ej. PROV-VIJOSA-7892
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  branchId: string;
  branchName: string;
  issueDate: string;
  urgency: 'NORMAL' | 'URGENTE' | 'CRITICO';
  status: SupplierOrderStatus;
  items: SupplierOrderItem[];
  totalEstimated: number;
  // Campos completados por el proveedor en su portal:
  supplierInvoiceNumber?: string;
  estimatedDeliveryDate?: string;
  deliveryDriver?: string;
  driverPhone?: string;
  supplierNotes?: string;
  lastUpdatedBySupplier?: string;
  history: {
    status: SupplierOrderStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceBranchId: string;
  sourceBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  originUserName: string;
  destinationUserName?: string;
  items: {
    productId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
  }[];
  status: TransferStatus;
  createdAt: string;
  receivedAt?: string;
}

export interface Alert {
  id: string;
  type: 'LowStock' | 'ExpiringSoon' | 'Expired' | 'CashDiscrepancy' | 'PendingTransfer';
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  message: string;
  branchId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  action: string;
  module: string;
  entityName: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface Settings {
  pharmacyName: string;
  logoUrl: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  primaryCurrency: string;
  currencySymbol: string;
  taxRate: number;
  invoicePrefix: string;
  ticketFooter: string;
  expiringAlertDays1: number;
  expiringAlertDays2: number;
  expiringAlertDays3: number;
}

export type ExpenseCategory =
  | 'Rent'            // Alquiler de local comercial
  | 'Utilities'       // Electricidad (refrigeración cadena de frío), agua, internet
  | 'Payroll'         // Planilla / Salarios farmacéuticos y dependientes
  | 'Maintenance'     // Mantenimiento de A/C, fumigación, permisos DNM/CSSP
  | 'Supplies'        // Papelería, rollos térmicos, bolsas para medicamentos
  | 'Taxes_Permits'   // Impuestos de alcaldía, licencias sanitarias
  | 'Other';          // Otros gastos operacionales

export interface OperationalExpense {
  id: string;
  expenseNumber: string;        // ej. GTO-2026-001
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'Card';
  invoiceReference?: string;    // N° de recibo o factura
  expenseDate: string;          // ISO Date
  branchId: string;
  branchName: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'Corriente' | 'Ahorros';
  currency: string;
  initialBalance: number;
  currentBalance: number;
  branchId: string;
  isActive: boolean;
}

export type BankMovementType =
  | 'CARD_SETTLEMENT'    // Liquidación de lote de tarjetas POS
  | 'TRANSFER_IN'        // Transferencia recibida de cliente (Transfer365)
  | 'CASH_DEPOSIT'       // Depósito en ventanilla de dinero de caja
  | 'SUPPLIER_PAYMENT'   // Pago por transferencia a laboratorio/droguería
  | 'EXPENSE_PAYMENT'    // Pago de gasto operativo (luz, alquiler)
  | 'BANK_FEE'           // Comisión bancaria por uso de terminal POS
  | 'TAX_WITHHOLDING'    // Retención de impuestos bancarios
  | 'OTHER';

export interface BankStatementItem {
  id: string;
  bankAccountId: string;
  date: string;
  concept: string;
  reference: string;
  movementType: BankMovementType;
  debit: number;              // Cargos / Salidas (-)
  credit: number;             // Abonos / Entradas (+)
  balanceAfter: number;
  feeDeducted?: number;       // Comisión de terminal POS descontada
  isReconciled: boolean;
  matchedSystemId?: string;   // ID del registro del sistema emparejado
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;
}


