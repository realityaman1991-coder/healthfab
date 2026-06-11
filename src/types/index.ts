// ─── Channel Types ──────────────────────────────────────────────────────────
export type ChannelId = 'website' | 'amazon' | 'flipkart' | 'myntra' | 'swiggy' | 'zepto' | 'meesho';

export interface Channel {
  id: ChannelId;
  name: string;
  color: string;
  feePercent: number;   // marketplace commission %
  logisticsCost: number; // per order ₹
  avgDeliveryDays: number;
  slaHours: number;
}

// ─── Product / SKU Types ─────────────────────────────────────────────────────
export type ProductId = 'gpf-heavy' | 'gpf-ultra';
export type SizeId = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  absorbency: string;
  mrp: number;
  costOfGoods: number;
  description: string;
}

export interface SKU {
  id: string;           // e.g., "gpf-heavy-M"
  productId: ProductId;
  size: SizeId;
  mrp: number;
}

// ─── Inventory Types ─────────────────────────────────────────────────────────
export interface InventoryItem {
  skuId: string;
  channelId: ChannelId;
  stock: number;
  reorderPoint: number;
  reorderQty: number;
  lastRestocked: string;
}

export interface WarehouseStock {
  skuId: string;
  quantity: number;
  reservedQty: number;
  location: string;
}

// ─── Order Types ─────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  channelId: ChannelId;
  skuId: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  date: string;
  customer: string;
  city: string;
  state: string;
  deliveredDate?: string;
  trackingId?: string;
  courierId?: string;
}

// ─── Return Types ─────────────────────────────────────────────────────────────
export type ReturnReason = 'wrong_size' | 'defect' | 'not_as_described' | 'changed_mind' | 'delivery_damage';
export type ReturnStatus = 'requested' | 'in_transit' | 'received' | 'refunded' | 'rejected';

export interface Return {
  id: string;
  orderId: string;
  channelId: ChannelId;
  skuId: string;
  reason: ReturnReason;
  status: ReturnStatus;
  date: string;
  refundAmount: number;
  restockable: boolean;
}

// ─── Vendor Types ─────────────────────────────────────────────────────────────
export type VendorType = 'fabric' | 'manufacturer' | 'packaging' | 'courier';

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  location: string;
  contactName: string;
  phone: string;
  onTimeDeliveryRate: number; // %
  qualityScore: number;       // 0-100
  costRating: number;         // 1-5
  leadTimeDays: number;
  moq: number;                // minimum order qty
  activeOrders: number;
  totalSpendMTD: number;      // month-to-date ₹
  status: 'active' | 'inactive' | 'onboarding';
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  items: string;
  quantity: number;
  amount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'in_production' | 'shipped' | 'received';
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
}

// ─── Courier Types ─────────────────────────────────────────────────────────────
export interface Courier {
  id: string;
  name: string;
  ndrRate: number;       // non-delivery rate %
  transitDays: number;
  damageClaims: number;
  costPerShipment: number;
  shipmentsThisMonth: number;
  onTimeDelivery: number; // %
  codRemittanceDays: number;
  zones: string[];
}

// ─── Manufacturing Types ──────────────────────────────────────────────────────
export interface ProductionBatch {
  id: string;
  productId: ProductId;
  sizeId: SizeId;
  plannedQty: number;
  actualQty?: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'qc_pending' | 'completed' | 'rejected';
  qcPassRate?: number;
  manufacturerId: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplierId: string;
  leadTimeDays: number;
}

// ─── Forecast Types ───────────────────────────────────────────────────────────
export interface ForecastPoint {
  week: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export interface CohortData {
  cohort: string;
  newCustomers: number;
  repeatRate30: number;
  repeatRate60: number;
  repeatRate90: number;
}

// ─── Unit Economics Types ─────────────────────────────────────────────────────
export interface ChannelEconomics {
  channelId: ChannelId;
  avgOrderValue: number;
  cogs: number;
  marketplaceFee: number;
  logisticsCost: number;
  packagingCost: number;
  paymentGatewayCost: number;
  returnsCost: number;
  contributionMargin: number;
  contributionMarginPct: number;
}

// ─── KPI Types ────────────────────────────────────────────────────────────────
export interface KpiData {
  label: string;
  value: string | number;
  change: number; // % MoM
  changeLabel: string;
  prefix?: string;
  suffix?: string;
  color?: string;
}

// ─── SOP Types ────────────────────────────────────────────────────────────────
export type SOPCategory = 'fulfillment' | 'inventory' | 'returns' | 'quality' | 'vendor' | 'manufacturing' | 'hr' | 'finance';
export type SOPStatus = 'active' | 'draft' | 'archived';

export interface SOPStep {
  id: string;
  stepNumber: number;
  description: string;
  detail?: string;
  checked: boolean;
}

export interface SOP {
  id: string;
  title: string;
  category: SOPCategory;
  description: string;
  status: SOPStatus;
  assignedTo: string;
  steps: SOPStep[];
  createdDate: string;
  lastUpdated: string;
  completionCount: number; // how many times fully completed
  estimatedMinutes: number;
}

// ─── Integration Types ────────────────────────────────────────────────────────
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  channelId: ChannelId;
  channelName: string;
  apiType: 'sp_api' | 'seller_api' | 'csv_only' | 'partner_api';
  status: IntegrationStatus;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    sellerId?: string;
  };
  lastSync?: string;
  syncedOrders: number;
  syncedInventory: number;
  syncErrors: number;
  autoSyncEnabled: boolean;
}

// ─── Scale Readiness Types ────────────────────────────────────────────────────
export type ReadinessPillar = 'manufacturing' | 'logistics' | 'technology' | 'team' | 'finance';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface ReadinessItem {
  id: string;
  pillar: ReadinessPillar;
  item: string;
  current: number;  // 0-100 score
  target: number;   // 0-100 score
  unit: string;
  note: string;
}

export interface ActionItem {
  id: string;
  pillar: ReadinessPillar;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  linkedTo3xTarget: boolean;
}
