import type {
  Channel, Product, SKU, InventoryItem, WarehouseStock,
  Order, Return, Vendor, PurchaseOrder, Courier,
  ProductionBatch, RawMaterial, ForecastPoint, CohortData,
  ChannelEconomics, KpiData, ChannelId, ProductId, SizeId,
  SOP, Integration, ReadinessItem, ActionItem,
} from '../types';

// ─── Channels ─────────────────────────────────────────────────────────────────
export const CHANNELS: Channel[] = [
  { id: 'website',  name: 'Website',          color: '#6366f1', feePercent: 0,    logisticsCost: 55,  avgDeliveryDays: 4, slaHours: 48 },
  { id: 'amazon',   name: 'Amazon',            color: '#f59e0b', feePercent: 18,   logisticsCost: 0,   avgDeliveryDays: 3, slaHours: 24 },
  { id: 'flipkart', name: 'Flipkart',          color: '#3b82f6', feePercent: 15,   logisticsCost: 0,   avgDeliveryDays: 4, slaHours: 36 },
  { id: 'myntra',   name: 'Myntra',            color: '#ec4899', feePercent: 20,   logisticsCost: 0,   avgDeliveryDays: 4, slaHours: 36 },
  { id: 'swiggy',   name: 'Swiggy Instamart',  color: '#f97316', feePercent: 22,   logisticsCost: 0,   avgDeliveryDays: 0, slaHours: 2  },
  { id: 'zepto',    name: 'Zepto',             color: '#8b5cf6', feePercent: 22,   logisticsCost: 0,   avgDeliveryDays: 0, slaHours: 2  },
  { id: 'meesho',   name: 'Meesho',            color: '#10b981', feePercent: 12,   logisticsCost: 0,   avgDeliveryDays: 7, slaHours: 72 },
];

export const CHANNEL_MAP = Object.fromEntries(CHANNELS.map(c => [c.id, c])) as Record<ChannelId, Channel>;

// ─── Products ─────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: 'gpf-heavy',
    name: 'GoPadFree Heavy',
    shortName: 'GPF Heavy',
    absorbency: '5x (Medium-Heavy Flow)',
    mrp: 899,
    costOfGoods: 210,
    description: 'Patent-pending 5-layer absorbent underwear for medium to heavy flow days. Reusable 2+ years.',
  },
  {
    id: 'gpf-ultra',
    name: 'GoPadFree Ultra',
    shortName: 'GPF Ultra',
    absorbency: '6x (Super Heavy Flow)',
    mrp: 1099,
    costOfGoods: 255,
    description: 'Premium 6-layer absorbent underwear for super heavy flow days. Maximum protection.',
  },
];

export const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

export const SIZES: SizeId[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// ─── SKUs ──────────────────────────────────────────────────────────────────────
export const SKUS: SKU[] = PRODUCTS.flatMap(p =>
  SIZES.map(s => ({
    id: `${p.id}-${s}`,
    productId: p.id as ProductId,
    size: s,
    mrp: p.mrp,
  }))
);

export const SKU_MAP = Object.fromEntries(SKUS.map(s => [s.id, s]));

// ─── Inventory ─────────────────────────────────────────────────────────────────
const inventoryBase: Record<string, Record<ChannelId, number>> = {
  'gpf-heavy-XS': { website: 38, amazon: 120, flipkart: 85, myntra: 42, swiggy: 24, zepto: 18, meesho: 65 },
  'gpf-heavy-S':  { website: 92, amazon: 310, flipkart: 220, myntra: 95, swiggy: 60, zepto: 45, meesho: 175 },
  'gpf-heavy-M':  { website: 145, amazon: 480, flipkart: 365, myntra: 148, swiggy: 82, zepto: 60, meesho: 290 },
  'gpf-heavy-L':  { website: 178, amazon: 520, flipkart: 410, myntra: 162, swiggy: 90, zepto: 68, meesho: 315 },
  'gpf-heavy-XL': { website: 112, amazon: 350, flipkart: 280, myntra: 118, swiggy: 55, zepto: 42, meesho: 210 },
  'gpf-heavy-2XL':{ website: 68, amazon: 190, flipkart: 148, myntra: 72, swiggy: 30, zepto: 22, meesho: 140 },
  'gpf-heavy-3XL':{ website: 22, amazon: 65, flipkart: 48, myntra: 28, swiggy: 8,  zepto: 6,  meesho: 55 },
  'gpf-ultra-XS': { website: 18, amazon: 58, flipkart: 42, myntra: 20, swiggy: 10, zepto: 8,  meesho: 38 },
  'gpf-ultra-S':  { website: 45, amazon: 155, flipkart: 112, myntra: 48, swiggy: 28, zepto: 22, meesho: 88 },
  'gpf-ultra-M':  { website: 72, amazon: 240, flipkart: 182, myntra: 78, swiggy: 42, zepto: 32, meesho: 145 },
  'gpf-ultra-L':  { website: 88, amazon: 265, flipkart: 205, myntra: 84, swiggy: 48, zepto: 36, meesho: 162 },
  'gpf-ultra-XL': { website: 55, amazon: 175, flipkart: 140, myntra: 60, swiggy: 28, zepto: 20, meesho: 105 },
  'gpf-ultra-2XL':{ website: 32, amazon: 95, flipkart: 72, myntra: 38, swiggy: 14, zepto: 10, meesho: 68 },
  'gpf-ultra-3XL':{ website: 8,  amazon: 28, flipkart: 22, myntra: 12, swiggy: 4,  zepto: 2,  meesho: 28 },
};

export const INVENTORY: InventoryItem[] = SKUS.flatMap(sku =>
  CHANNELS.map(ch => ({
    skuId: sku.id,
    channelId: ch.id,
    stock: inventoryBase[sku.id]?.[ch.id] ?? 0,
    reorderPoint: ch.id === 'swiggy' || ch.id === 'zepto' ? 15 : 50,
    reorderQty: ch.id === 'swiggy' || ch.id === 'zepto' ? 50 : 200,
    lastRestocked: '2026-06-01',
  }))
);

export const WAREHOUSE_STOCK: WarehouseStock[] = SKUS.map(sku => ({
  skuId: sku.id,
  quantity: Math.floor(Math.random() * 800 + 400),
  reservedQty: Math.floor(Math.random() * 120),
  location: `RACK-${sku.productId === 'gpf-heavy' ? 'A' : 'B'}-${sku.size}`,
}));

// ─── Orders (last 30 days) ────────────────────────────────────────────────────
const customers = ['Priya S','Ananya R','Meera K','Divya P','Shreya T','Kavya N','Pooja M','Neha G','Swati B','Isha J','Riya C','Tanya L','Deepa V','Nisha W','Anita X'];
const cities = ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow','Surat','Kochi','Indore','Chandigarh','Nagpur'];
const states = ['Maharashtra','Delhi','Karnataka','Telangana','Tamil Nadu','Maharashtra','West Bengal','Gujarat','Rajasthan','UP','Gujarat','Kerala','MP','Punjab','Maharashtra'];
const couriers = ['Delhivery','BlueDart','Xpressbees','Ecom Express','Shiprocket'];

function randomDate(daysAgo: number): string {
  const d = new Date('2026-06-11');
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split('T')[0];
}

const channelOrderWeights: ChannelId[] = [
  ...Array(20).fill('amazon'),
  ...Array(18).fill('flipkart'),
  ...Array(15).fill('website'),
  ...Array(10).fill('myntra'),
  ...Array(10).fill('meesho'),
  ...Array(5).fill('swiggy'),
  ...Array(4).fill('zepto'),
];

const orderStatuses: Order['status'][] = ['delivered','delivered','delivered','delivered','shipped','shipped','processing','pending','cancelled','returned'];

export const ORDERS: Order[] = Array.from({ length: 620 }, (_, i) => {
  const sku = SKUS[Math.floor(Math.random() * SKUS.length)];
  const channel = channelOrderWeights[Math.floor(Math.random() * channelOrderWeights.length)] as ChannelId;
  const cityIdx = Math.floor(Math.random() * cities.length);
  const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
  const date = randomDate(30);
  return {
    id: `ORD-${String(10000 + i).padStart(6, '0')}`,
    channelId: channel,
    skuId: sku.id,
    qty: 1,
    amount: sku.mrp - Math.floor(Math.random() * 50),
    status,
    date,
    customer: customers[Math.floor(Math.random() * customers.length)],
    city: cities[cityIdx],
    state: states[cityIdx],
    deliveredDate: status === 'delivered' ? randomDate(10) : undefined,
    trackingId: `TRK${Math.floor(Math.random() * 9000000 + 1000000)}`,
    courierId: status !== 'pending' && status !== 'processing' ? couriers[Math.floor(Math.random() * couriers.length)] : undefined,
  };
});

// ─── Returns ──────────────────────────────────────────────────────────────────
const returnReasons: Return['reason'][] = ['wrong_size','wrong_size','wrong_size','defect','not_as_described','changed_mind','delivery_damage'];
const returnStatuses: Return['status'][] = ['refunded','refunded','received','in_transit','requested'];

export const RETURNS: Return[] = Array.from({ length: 28 }, (_, i) => {
  const order = ORDERS.filter(o => o.status === 'returned')[i % ORDERS.filter(o => o.status === 'returned').length];
  const reason = returnReasons[Math.floor(Math.random() * returnReasons.length)];
  return {
    id: `RET-${String(1000 + i).padStart(5, '0')}`,
    orderId: order.id,
    channelId: order.channelId,
    skuId: order.skuId,
    reason,
    status: returnStatuses[Math.floor(Math.random() * returnStatuses.length)],
    date: randomDate(20),
    refundAmount: order.amount,
    restockable: reason !== 'defect' && reason !== 'delivery_damage',
  };
});

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const VENDORS: Vendor[] = [
  { id: 'V001', name: 'Shree Textiles', type: 'fabric', location: 'Surat, Gujarat', contactName: 'Ramesh Patel', phone: '9876543210', onTimeDeliveryRate: 94, qualityScore: 88, costRating: 4, leadTimeDays: 7, moq: 500, activeOrders: 2, totalSpendMTD: 385000, status: 'active' },
  { id: 'V002', name: 'MicroFibre Exports', type: 'fabric', location: 'Tirupur, Tamil Nadu', contactName: 'Sundar Raj', phone: '9765432108', onTimeDeliveryRate: 89, qualityScore: 92, costRating: 3, leadTimeDays: 10, moq: 1000, activeOrders: 1, totalSpendMTD: 520000, status: 'active' },
  { id: 'V003', name: 'Apex Garments Pvt Ltd', type: 'manufacturer', location: 'Bengaluru, Karnataka', contactName: 'Mohan Kumar', phone: '9654321087', onTimeDeliveryRate: 91, qualityScore: 90, costRating: 3, leadTimeDays: 14, moq: 500, activeOrders: 3, totalSpendMTD: 1240000, status: 'active' },
  { id: 'V004', name: 'StitchPro Manufacturing', type: 'manufacturer', location: 'Gurgaon, Haryana', contactName: 'Vikas Sharma', phone: '9543210976', onTimeDeliveryRate: 86, qualityScore: 85, costRating: 4, leadTimeDays: 12, moq: 300, activeOrders: 1, totalSpendMTD: 680000, status: 'active' },
  { id: 'V005', name: 'GreenPack Solutions', type: 'packaging', location: 'Mumbai, Maharashtra', contactName: 'Anil Desai', phone: '9432109865', onTimeDeliveryRate: 97, qualityScore: 95, costRating: 3, leadTimeDays: 5, moq: 2000, activeOrders: 1, totalSpendMTD: 145000, status: 'active' },
  { id: 'V006', name: 'EcoPack India', type: 'packaging', location: 'Pune, Maharashtra', contactName: 'Priti Joshi', phone: '9321098754', onTimeDeliveryRate: 95, qualityScore: 93, costRating: 4, leadTimeDays: 4, moq: 1000, activeOrders: 0, totalSpendMTD: 0, status: 'inactive' },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'PO-2026-041', vendorId: 'V001', items: 'Cotton-Microfiber Blend (Style A)', quantity: 2500, amount: 187500, status: 'in_production', orderDate: '2026-06-01', expectedDate: '2026-06-15' },
  { id: 'PO-2026-042', vendorId: 'V002', items: 'Premium Microfibre Fabric (Style B)', quantity: 1800, amount: 216000, status: 'confirmed', orderDate: '2026-06-03', expectedDate: '2026-06-18' },
  { id: 'PO-2026-043', vendorId: 'V003', items: 'GPF Heavy - M, L, XL (2000 units)', quantity: 2000, amount: 420000, status: 'in_production', orderDate: '2026-05-28', expectedDate: '2026-06-12' },
  { id: 'PO-2026-044', vendorId: 'V003', items: 'GPF Ultra - M, L (800 units)', quantity: 800, amount: 204000, status: 'shipped', orderDate: '2026-05-20', expectedDate: '2026-06-08' },
  { id: 'PO-2026-045', vendorId: 'V004', items: 'GPF Heavy - 2XL, 3XL (400 units)', quantity: 400, amount: 92000, status: 'received', orderDate: '2026-05-15', expectedDate: '2026-05-30', receivedDate: '2026-05-29' },
  { id: 'PO-2026-046', vendorId: 'V005', items: 'Branded Pouches + Mailer Boxes', quantity: 5000, amount: 75000, status: 'sent', orderDate: '2026-06-08', expectedDate: '2026-06-14' },
];

// ─── Couriers ─────────────────────────────────────────────────────────────────
export const COURIERS: Courier[] = [
  { id: 'C001', name: 'Delhivery', ndrRate: 7.2, transitDays: 3.8, damageClaims: 12, costPerShipment: 58, shipmentsThisMonth: 1840, onTimeDelivery: 88, codRemittanceDays: 7, zones: ['Metro', 'Tier-1', 'Tier-2', 'Tier-3'] },
  { id: 'C002', name: 'BlueDart', ndrRate: 3.1, transitDays: 2.4, damageClaims: 4, costPerShipment: 95, shipmentsThisMonth: 520, onTimeDelivery: 96, codRemittanceDays: 5, zones: ['Metro', 'Tier-1'] },
  { id: 'C003', name: 'Xpressbees', ndrRate: 9.4, transitDays: 4.2, damageClaims: 18, costPerShipment: 48, shipmentsThisMonth: 1240, onTimeDelivery: 83, codRemittanceDays: 8, zones: ['Metro', 'Tier-1', 'Tier-2'] },
  { id: 'C004', name: 'Ecom Express', ndrRate: 11.8, transitDays: 5.1, damageClaims: 24, costPerShipment: 44, shipmentsThisMonth: 680, onTimeDelivery: 78, codRemittanceDays: 10, zones: ['Tier-2', 'Tier-3', 'Rural'] },
  { id: 'C005', name: 'Shiprocket', ndrRate: 8.6, transitDays: 4.5, damageClaims: 15, costPerShipment: 52, shipmentsThisMonth: 420, onTimeDelivery: 85, codRemittanceDays: 7, zones: ['Metro', 'Tier-1', 'Tier-2'] },
];

// ─── Production Batches ───────────────────────────────────────────────────────
export const PRODUCTION_BATCHES: ProductionBatch[] = [
  { id: 'BATCH-060', productId: 'gpf-heavy', sizeId: 'M',   plannedQty: 800,  actualQty: 792,  startDate: '2026-05-20', endDate: '2026-06-04', status: 'completed', qcPassRate: 97.2, manufacturerId: 'V003' },
  { id: 'BATCH-061', productId: 'gpf-heavy', sizeId: 'L',   plannedQty: 900,  actualQty: 885,  startDate: '2026-05-22', endDate: '2026-06-06', status: 'completed', qcPassRate: 96.8, manufacturerId: 'V003' },
  { id: 'BATCH-062', productId: 'gpf-ultra', sizeId: 'M',   plannedQty: 500,  actualQty: 496,  startDate: '2026-05-25', endDate: '2026-06-07', status: 'completed', qcPassRate: 98.1, manufacturerId: 'V003' },
  { id: 'BATCH-063', productId: 'gpf-heavy', sizeId: 'XL',  plannedQty: 600,  startDate: '2026-06-05', endDate: '2026-06-18', status: 'in_progress', manufacturerId: 'V003' },
  { id: 'BATCH-064', productId: 'gpf-heavy', sizeId: 'S',   plannedQty: 700,  startDate: '2026-06-07', endDate: '2026-06-20', status: 'in_progress', manufacturerId: 'V004' },
  { id: 'BATCH-065', productId: 'gpf-ultra', sizeId: 'L',   plannedQty: 400,  startDate: '2026-06-10', endDate: '2026-06-22', status: 'in_progress', manufacturerId: 'V003' },
  { id: 'BATCH-066', productId: 'gpf-heavy', sizeId: '2XL', plannedQty: 300,  startDate: '2026-06-12', endDate: '2026-06-25', status: 'planned', manufacturerId: 'V004' },
  { id: 'BATCH-067', productId: 'gpf-ultra', sizeId: 'XL',  plannedQty: 350,  startDate: '2026-06-15', endDate: '2026-06-28', status: 'planned', manufacturerId: 'V003' },
  { id: 'BATCH-068', productId: 'gpf-heavy', sizeId: 'M',   plannedQty: 1000, startDate: '2026-06-20', endDate: '2026-07-05', status: 'planned', manufacturerId: 'V003' },
];

// ─── Raw Materials ─────────────────────────────────────────────────────────────
export const RAW_MATERIALS: RawMaterial[] = [
  { id: 'RM-001', name: 'Cotton-Microfibre Blend (Style A)', unit: 'meters', currentStock: 4200, reorderPoint: 1500, costPerUnit: 75, supplierId: 'V001', leadTimeDays: 7 },
  { id: 'RM-002', name: 'Premium Microfibre Fabric (Style B)', unit: 'meters', currentStock: 1800, reorderPoint: 2000, costPerUnit: 120, supplierId: 'V002', leadTimeDays: 10 },
  { id: 'RM-003', name: 'TPU Waterproof Layer', unit: 'meters', currentStock: 3100, reorderPoint: 1000, costPerUnit: 55, supplierId: 'V001', leadTimeDays: 7 },
  { id: 'RM-004', name: 'Elastic Band (Wide)', unit: 'meters', currentStock: 8500, reorderPoint: 3000, costPerUnit: 12, supplierId: 'V001', leadTimeDays: 5 },
  { id: 'RM-005', name: 'Branded Label', unit: 'pieces', currentStock: 12000, reorderPoint: 5000, costPerUnit: 2, supplierId: 'V005', leadTimeDays: 3 },
  { id: 'RM-006', name: 'Eco Mailer Box', unit: 'pieces', currentStock: 2800, reorderPoint: 2000, costPerUnit: 18, supplierId: 'V005', leadTimeDays: 5 },
  { id: 'RM-007', name: 'Biodegradable Poly Bag', unit: 'pieces', currentStock: 6500, reorderPoint: 3000, costPerUnit: 4, supplierId: 'V005', leadTimeDays: 3 },
];

// ─── Demand Forecast ──────────────────────────────────────────────────────────
export const DEMAND_FORECAST: ForecastPoint[] = [
  { week: 'W1 May', actual: 3200, forecast: 3150, lowerBound: 2900, upperBound: 3400 },
  { week: 'W2 May', actual: 3580, forecast: 3500, lowerBound: 3200, upperBound: 3800 },
  { week: 'W3 May', actual: 4100, forecast: 3900, lowerBound: 3600, upperBound: 4200 },
  { week: 'W4 May', actual: 3850, forecast: 3950, lowerBound: 3600, upperBound: 4300 },
  { week: 'W1 Jun', actual: 4320, forecast: 4200, lowerBound: 3900, upperBound: 4500 },
  { week: 'W2 Jun', actual: 4680, forecast: 4500, lowerBound: 4100, upperBound: 4900 },
  { week: 'W3 Jun', forecast: 4850, lowerBound: 4400, upperBound: 5300 },
  { week: 'W4 Jun', forecast: 5100, lowerBound: 4600, upperBound: 5600 },
  { week: 'W1 Jul', forecast: 5400, lowerBound: 4800, upperBound: 6000 },
  { week: 'W2 Jul', forecast: 5650, lowerBound: 5000, upperBound: 6300 },
  { week: 'W3 Jul', forecast: 5800, lowerBound: 5100, upperBound: 6500 },
  { week: 'W4 Jul', forecast: 6100, lowerBound: 5400, upperBound: 6800 },
];

export const COHORT_DATA: CohortData[] = [
  { cohort: 'Jan 2026', newCustomers: 8200, repeatRate30: 18, repeatRate60: 28, repeatRate90: 35 },
  { cohort: 'Feb 2026', newCustomers: 9100, repeatRate30: 21, repeatRate60: 31, repeatRate90: 38 },
  { cohort: 'Mar 2026', newCustomers: 11400, repeatRate30: 22, repeatRate60: 33, repeatRate90: 0 },
  { cohort: 'Apr 2026', newCustomers: 13200, repeatRate30: 24, repeatRate60: 0, repeatRate90: 0 },
  { cohort: 'May 2026', newCustomers: 15800, repeatRate30: 23, repeatRate60: 0, repeatRate90: 0 },
];

// ─── Unit Economics ────────────────────────────────────────────────────────────
export const CHANNEL_ECONOMICS: ChannelEconomics[] = [
  { channelId: 'website',  avgOrderValue: 940, cogs: 225, marketplaceFee: 0,   logisticsCost: 55, packagingCost: 22, paymentGatewayCost: 19, returnsCost: 28, contributionMargin: 591, contributionMarginPct: 62.9 },
  { channelId: 'amazon',   avgOrderValue: 899, cogs: 225, marketplaceFee: 162, logisticsCost: 45, packagingCost: 0,  paymentGatewayCost: 0,  returnsCost: 42, contributionMargin: 425, contributionMarginPct: 47.3 },
  { channelId: 'flipkart', avgOrderValue: 899, cogs: 225, marketplaceFee: 135, logisticsCost: 48, packagingCost: 0,  paymentGatewayCost: 0,  returnsCost: 38, contributionMargin: 453, contributionMarginPct: 50.4 },
  { channelId: 'myntra',   avgOrderValue: 899, cogs: 225, marketplaceFee: 180, logisticsCost: 52, packagingCost: 0,  paymentGatewayCost: 0,  returnsCost: 55, contributionMargin: 387, contributionMarginPct: 43.1 },
  { channelId: 'swiggy',   avgOrderValue: 899, cogs: 225, marketplaceFee: 198, logisticsCost: 0,  packagingCost: 8,  paymentGatewayCost: 0,  returnsCost: 12, contributionMargin: 456, contributionMarginPct: 50.7 },
  { channelId: 'zepto',    avgOrderValue: 899, cogs: 225, marketplaceFee: 198, logisticsCost: 0,  packagingCost: 8,  paymentGatewayCost: 0,  returnsCost: 10, contributionMargin: 458, contributionMarginPct: 51.0 },
  { channelId: 'meesho',   avgOrderValue: 749, cogs: 225, marketplaceFee: 90,  logisticsCost: 0,  packagingCost: 0,  paymentGatewayCost: 0,  returnsCost: 22, contributionMargin: 412, contributionMarginPct: 55.0 },
];

// ─── Aggregate KPIs ────────────────────────────────────────────────────────────
export const DASHBOARD_KPIS: KpiData[] = [
  { label: 'Revenue (MTD)',       value: '₹1.84 Cr',  change: 18.2,  changeLabel: 'vs last month',  color: '#6366f1' },
  { label: 'Orders (MTD)',        value: '18,420',    change: 14.5,  changeLabel: 'vs last month',  color: '#f59e0b' },
  { label: 'Avg Order Value',     value: '₹899',      change: 3.2,   changeLabel: 'vs last month',  color: '#10b981' },
  { label: 'Fulfillment Rate',    value: '94.2%',     change: 1.8,   changeLabel: 'vs last month',  color: '#3b82f6' },
  { label: 'Return Rate',         value: '4.1%',      change: -0.4,  changeLabel: 'vs last month',  color: '#ef4444' },
  { label: 'New Customers',       value: '15,800',    change: 19.7,  changeLabel: 'vs last month',  color: '#8b5cf6' },
  { label: 'Inventory Turnover',  value: '8.4x',      change: 0.6,   changeLabel: 'vs last month',  color: '#f97316' },
  { label: 'Gross Margin',        value: '52.3%',     change: 2.1,   changeLabel: 'vs last month',  color: '#06b6d4' },
];

// ─── Monthly Revenue Trend ─────────────────────────────────────────────────────
export const MONTHLY_REVENUE = [
  { month: 'Jan 26', revenue: 8200000,  orders: 9800,  newCustomers: 8200 },
  { month: 'Feb 26', revenue: 9800000,  orders: 11600, newCustomers: 9100 },
  { month: 'Mar 26', revenue: 12400000, orders: 14200, newCustomers: 11400 },
  { month: 'Apr 26', revenue: 14100000, orders: 16100, newCustomers: 13200 },
  { month: 'May 26', revenue: 15600000, orders: 16100, newCustomers: 15800 },
  { month: 'Jun 26', revenue: 18400000, orders: 18420, newCustomers: 15800 },
];

// ─── Channel Revenue Split ────────────────────────────────────────────────────
export const CHANNEL_REVENUE_SPLIT = [
  { channel: 'Amazon',   value: 32, color: '#f59e0b' },
  { channel: 'Flipkart', value: 28, color: '#3b82f6' },
  { channel: 'Website',  value: 18, color: '#6366f1' },
  { channel: 'Myntra',   value: 9,  color: '#ec4899' },
  { channel: 'Meesho',   value: 7,  color: '#10b981' },
  { channel: 'Quick Commerce', value: 6, color: '#f97316' },
];

// ─── Size Distribution ────────────────────────────────────────────────────────
export const SIZE_DISTRIBUTION = [
  { size: 'XS', pct: 5 },
  { size: 'S',  pct: 14 },
  { size: 'M',  pct: 28 },
  { size: 'L',  pct: 30 },
  { size: 'XL', pct: 14 },
  { size: '2XL',pct: 7 },
  { size: '3XL',pct: 2 },
];

// ─── State-wise orders ────────────────────────────────────────────────────────
export const STATE_ORDERS = [
  { state: 'Maharashtra', orders: 3840 },
  { state: 'Karnataka',   orders: 2920 },
  { state: 'Delhi',       orders: 2680 },
  { state: 'Tamil Nadu',  orders: 1940 },
  { state: 'Telangana',   orders: 1620 },
  { state: 'Gujarat',     orders: 1480 },
  { state: 'West Bengal', orders: 1240 },
  { state: 'UP',          orders: 1120 },
  { state: 'Rajasthan',   orders: 880 },
  { state: 'Punjab',      orders: 700 },
];

// ─── SOPs ──────────────────────────────────────────────────────────────────────
export const INIT_SOPS: SOP[] = [
  {
    id: 'SOP-001',
    title: 'Order Fulfillment — D2C Website',
    category: 'fulfillment',
    description: 'End-to-end process for processing, packing and shipping website orders within the 48h SLA.',
    status: 'active',
    assignedTo: 'Fulfillment Team',
    estimatedMinutes: 15,
    completionCount: 142,
    createdDate: '2026-01-15',
    lastUpdated: '2026-05-20',
    steps: [
      { id: 's001-1', stepNumber: 1, description: 'Log into Shiprocket / shipping dashboard', detail: 'Check for new orders flagged as "Pending Fulfillment"', checked: false },
      { id: 's001-2', stepNumber: 2, description: 'Verify order details — SKU, size, address, COD/Prepaid', detail: 'Flag address anomalies for manual review before packing', checked: false },
      { id: 's001-3', stepNumber: 3, description: 'Pick from warehouse — confirm SKU & size against pick slip', detail: 'Use FIFO: pick oldest restocked batch first', checked: false },
      { id: 's001-4', stepNumber: 4, description: 'Quality check — inspect product for defects/packaging damage', detail: 'Reject if stitching defect, stain, or packaging tear visible', checked: false },
      { id: 's001-5', stepNumber: 5, description: 'Pack: place in poly bag → insert thank-you card → seal carton', detail: 'Use branded carton for orders above ₹999, mailer bag below', checked: false },
      { id: 's001-6', stepNumber: 6, description: 'Print shipping label and apply to carton', checked: false },
      { id: 's001-7', stepNumber: 7, description: 'Hand over to courier pickup / update tracking in dashboard', checked: false },
      { id: 's001-8', stepNumber: 8, description: 'Update order status to Shipped in Ops Platform', checked: false },
    ],
  },
  {
    id: 'SOP-002',
    title: 'Amazon FBA Inventory Replenishment',
    category: 'inventory',
    description: 'Process to raise inbound shipment to Amazon FBA when stock falls below reorder point.',
    status: 'active',
    assignedTo: 'Inventory Manager',
    estimatedMinutes: 30,
    completionCount: 28,
    createdDate: '2026-02-01',
    lastUpdated: '2026-06-01',
    steps: [
      { id: 's002-1', stepNumber: 1, description: 'Check FBA inventory report in Seller Central — identify SKUs below reorder point', checked: false },
      { id: 's002-2', stepNumber: 2, description: 'Calculate replenishment qty: (Lead time demand + Safety stock) – Current FBA stock', detail: 'Use 21-day lead time + 7-day safety stock as default', checked: false },
      { id: 's002-3', stepNumber: 3, description: 'Create Inbound Shipment Plan in Seller Central', checked: false },
      { id: 's002-4', stepNumber: 4, description: 'Print FBA box labels and apply to cartons', checked: false },
      { id: 's002-5', stepNumber: 5, description: 'Pack cartons per FBA guidelines (max 15 kg, bubble-wrap fragile items)', checked: false },
      { id: 's002-6', stepNumber: 6, description: 'Book pickup with Delhivery/BlueDart for FBA delivery', checked: false },
      { id: 's002-7', stepNumber: 7, description: 'Mark shipment as Shipped in Seller Central — upload tracking', checked: false },
      { id: 's002-8', stepNumber: 8, description: 'Update warehouse stock in Ops Platform', checked: false },
    ],
  },
  {
    id: 'SOP-003',
    title: 'Returns Processing & Quality Assessment',
    category: 'returns',
    description: 'Standard process for receiving, inspecting, and processing returned products for refund or restock.',
    status: 'active',
    assignedTo: 'Returns Team',
    estimatedMinutes: 20,
    completionCount: 87,
    createdDate: '2026-01-20',
    lastUpdated: '2026-05-15',
    steps: [
      { id: 's003-1', stepNumber: 1, description: 'Receive return parcel — verify AWB matches return request in system', checked: false },
      { id: 's003-2', stepNumber: 2, description: 'Open parcel and inspect contents — check product condition', checked: false },
      { id: 's003-3', stepNumber: 3, description: 'Grade return: A (resaleable), B (wash & resell), C (discard)', detail: 'Grade C includes: used, damaged, missing tags, altered', checked: false },
      { id: 's003-4', stepNumber: 4, description: 'Update return status to "Received" in Ops Platform', checked: false },
      { id: 's003-5', stepNumber: 5, description: 'Grade A: repack and return to warehouse stock', checked: false },
      { id: 's003-6', stepNumber: 6, description: 'Grade B: quarantine for wash, re-inspect, repack if passed', checked: false },
      { id: 's003-7', stepNumber: 7, description: 'Grade C: log as loss, dispose as per hygiene protocol', checked: false },
      { id: 's003-8', stepNumber: 8, description: 'Approve refund in platform — update return status to Refunded', checked: false },
    ],
  },
  {
    id: 'SOP-004',
    title: 'Production Batch QC Inspection',
    category: 'quality',
    description: 'Quality control process for incoming production batches from manufacturing partner.',
    status: 'active',
    assignedTo: 'QC Manager',
    estimatedMinutes: 45,
    completionCount: 19,
    createdDate: '2026-01-10',
    lastUpdated: '2026-04-18',
    steps: [
      { id: 's004-1', stepNumber: 1, description: 'Receive production batch — verify batch ID, quantity, and SKU mix', checked: false },
      { id: 's004-2', stepNumber: 2, description: 'AQL sampling: inspect random 5% of batch (minimum 20 units)', detail: 'AQL Level II, 1.0 acceptable quality limit for critical defects', checked: false },
      { id: 's004-3', stepNumber: 3, description: 'Run absorbency test: 100ml water pour → check no leakage at 30 min', checked: false },
      { id: 's004-4', stepNumber: 4, description: 'Stitching tension test: pull elastic band and side seams', detail: 'Reject if seam breaks under 5kg force on spring scale', checked: false },
      { id: 's004-5', stepNumber: 5, description: 'Visual inspection: check colour consistency, print alignment, label placement', checked: false },
      { id: 's004-6', stepNumber: 6, description: 'Dimensional check: measure waistband and hip circumference vs spec sheet', checked: false },
      { id: 's004-7', stepNumber: 7, description: 'Document pass rate, defect types, photos of rejects', checked: false },
      { id: 's004-8', stepNumber: 8, description: 'Update batch QC Pass Rate in Manufacturing module — accept or reject lot', checked: false },
    ],
  },
  {
    id: 'SOP-005',
    title: 'NDR (Non-Delivery Report) Resolution',
    category: 'fulfillment',
    description: 'Process for resolving failed delivery attempts and minimising RTO.',
    status: 'active',
    assignedTo: 'Customer Support',
    estimatedMinutes: 10,
    completionCount: 203,
    createdDate: '2026-02-10',
    lastUpdated: '2026-06-05',
    steps: [
      { id: 's005-1', stepNumber: 1, description: 'Pull daily NDR report from courier dashboard at 9 AM', checked: false },
      { id: 's005-2', stepNumber: 2, description: 'For each NDR — identify reason: wrong address, not reachable, refused', checked: false },
      { id: 's005-3', stepNumber: 3, description: 'Attempt customer call within 4 hours of NDR trigger', checked: false },
      { id: 's005-4', stepNumber: 4, description: 'Confirm correct address / re-delivery slot — update in courier portal', checked: false },
      { id: 's005-5', stepNumber: 5, description: 'If 3 attempts failed → initiate RTO, update order status to Returned', checked: false },
      { id: 's005-6', stepNumber: 6, description: 'Log NDR outcome in Ops Platform — update order notes', checked: false },
    ],
  },
  {
    id: 'SOP-006',
    title: 'Vendor PO & Fabric Procurement',
    category: 'vendor',
    description: 'Process for raising and tracking Purchase Orders with fabric and raw material suppliers.',
    status: 'active',
    assignedTo: 'Procurement',
    estimatedMinutes: 25,
    completionCount: 14,
    createdDate: '2026-01-25',
    lastUpdated: '2026-05-10',
    steps: [
      { id: 's006-1', stepNumber: 1, description: 'Review raw material stock against next 60-day production plan', checked: false },
      { id: 's006-2', stepNumber: 2, description: 'Calculate order quantity: Production need + 20% buffer − Current stock', checked: false },
      { id: 's006-3', stepNumber: 3, description: 'Get quotations from 2+ vendors — compare price, lead time, MOQ', checked: false },
      { id: 's006-4', stepNumber: 4, description: 'Raise PO in Ops Platform — get approval from Operations Head', checked: false },
      { id: 's006-5', stepNumber: 5, description: 'Share PO with vendor — confirm delivery date and payment terms', checked: false },
      { id: 's006-6', stepNumber: 6, description: 'Track PO status weekly — follow up 7 days before expected delivery', checked: false },
      { id: 's006-7', stepNumber: 7, description: 'Receive goods — verify quantity and quality vs PO specs', checked: false },
      { id: 's006-8', stepNumber: 8, description: 'Update raw material stock in Ops Platform — mark PO as Received', checked: false },
    ],
  },
];

// ─── Integrations ──────────────────────────────────────────────────────────────
export const INIT_INTEGRATIONS: Integration[] = [
  {
    id: 'int-amazon',
    channelId: 'amazon',
    channelName: 'Amazon',
    apiType: 'sp_api',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-flipkart',
    channelId: 'flipkart',
    channelName: 'Flipkart',
    apiType: 'seller_api',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-myntra',
    channelId: 'myntra',
    channelName: 'Myntra',
    apiType: 'csv_only',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-meesho',
    channelId: 'meesho',
    channelName: 'Meesho',
    apiType: 'csv_only',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-swiggy',
    channelId: 'swiggy',
    channelName: 'Swiggy Instamart',
    apiType: 'partner_api',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-zepto',
    channelId: 'zepto',
    channelName: 'Zepto',
    apiType: 'partner_api',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
  {
    id: 'int-website',
    channelId: 'website',
    channelName: 'Website (Shopify)',
    apiType: 'partner_api',
    status: 'disconnected',
    syncedOrders: 0,
    syncedInventory: 0,
    syncErrors: 0,
    autoSyncEnabled: false,
  },
];

// ─── Scale Readiness ───────────────────────────────────────────────────────────
export const INIT_READINESS_ITEMS: ReadinessItem[] = [
  // Manufacturing
  { id: 'r-mfg-1', pillar: 'manufacturing', item: 'Production Capacity (units/month)', current: 12000, target: 36000, unit: 'units', note: 'Current single-vendor capacity; need 2 more partners for 3x' },
  { id: 'r-mfg-2', pillar: 'manufacturing', item: 'Active Manufacturing Partners', current: 1, target: 3, unit: 'vendors', note: 'Onboarding Bengaluru and Surat units' },
  { id: 'r-mfg-3', pillar: 'manufacturing', item: 'QC Pass Rate', current: 97, target: 98, unit: '%', note: 'Inline QC process partially implemented' },
  { id: 'r-mfg-4', pillar: 'manufacturing', item: 'Raw Material Buffer (days)', current: 21, target: 45, unit: 'days', note: 'Need to increase fabric inventory cover' },
  // Logistics
  { id: 'r-log-1', pillar: 'logistics', item: 'On-Time Delivery Rate', current: 88, target: 95, unit: '%', note: 'Need better courier mix and NDR handling' },
  { id: 'r-log-2', pillar: 'logistics', item: 'Warehouse Sq. Ft. Capacity', current: 2000, target: 6000, unit: 'sq ft', note: 'Current Gurgaon facility; need 2nd warehouse' },
  { id: 'r-log-3', pillar: 'logistics', item: 'Courier Partners Active', current: 3, target: 5, unit: 'couriers', note: 'Need Xpressbees and DTDC for tier-2/3 coverage' },
  // Technology
  { id: 'r-tech-1', pillar: 'technology', item: 'API Integrations Active', current: 0, target: 4, unit: 'channels', note: 'Amazon and Flipkart SP-API pending setup' },
  { id: 'r-tech-2', pillar: 'technology', item: 'Ops Platform Coverage', current: 75, target: 100, unit: '%', note: 'This platform; SOP automation in progress' },
  { id: 'r-tech-3', pillar: 'technology', item: 'Automation Level (manual → auto)', current: 30, target: 80, unit: '%', note: 'Shipping label printing, invoice generation not yet automated' },
  // Team
  { id: 'r-team-1', pillar: 'team', item: 'Ops Team Size', current: 4, target: 12, unit: 'people', note: 'Fulfillment, QC, Customer Support, Procurement heads needed' },
  { id: 'r-team-2', pillar: 'team', item: 'SOP Coverage', current: 6, target: 15, unit: 'SOPs', note: '9 more SOPs needed for all ops functions' },
  { id: 'r-team-3', pillar: 'team', item: 'Training Completion', current: 60, target: 90, unit: '%', note: 'New hires pending SOP walkthroughs' },
  // Finance
  { id: 'r-fin-1', pillar: 'finance', item: 'Working Capital (months cover)', current: 2, target: 4, unit: 'months', note: 'Series A deployment to extend to 4 months' },
  { id: 'r-fin-2', pillar: 'finance', item: 'Gross Margin', current: 52, target: 58, unit: '%', note: 'COGS reduction via volume discounts at 3x' },
  { id: 'r-fin-3', pillar: 'finance', item: 'Burn Rate Coverage', current: 18, target: 24, unit: 'months', note: 'Current Series A runway' },
];

export const INIT_ACTION_ITEMS: ActionItem[] = [
  { id: 'a-001', pillar: 'manufacturing', title: 'Onboard 2nd Manufacturing Partner (Bengaluru)', description: 'Identify, audit, and sign agreement with a 2nd garment manufacturer in Bengaluru for 10K units/month additional capacity.', owner: 'Aman Agarwal', dueDate: '2026-08-31', priority: 'critical', status: 'in_progress', linkedTo3xTarget: true },
  { id: 'a-002', pillar: 'logistics', title: 'Set up 2nd Warehouse (Mumbai or Pune)', description: 'Lease 3,000 sq ft warehouse in West India to reduce last-mile delivery time for ~35% of orders.', owner: 'Ops Head', dueDate: '2026-09-15', priority: 'critical', status: 'not_started', linkedTo3xTarget: true },
  { id: 'a-003', pillar: 'technology', title: 'Connect Amazon SP-API', description: 'Complete Amazon SP-API OAuth setup to auto-sync orders, inventory, and returns.', owner: 'Tech Lead', dueDate: '2026-07-15', priority: 'high', status: 'not_started', linkedTo3xTarget: true },
  { id: 'a-004', pillar: 'technology', title: 'Connect Flipkart Seller API', description: 'Complete Flipkart Seller API OAuth setup for order and inventory sync.', owner: 'Tech Lead', dueDate: '2026-07-31', priority: 'high', status: 'not_started', linkedTo3xTarget: true },
  { id: 'a-005', pillar: 'team', title: 'Hire Fulfillment Operations Manager', description: 'Hire experienced ops manager to own daily fulfillment, NDR resolution, and courier coordination.', owner: 'Founder', dueDate: '2026-07-31', priority: 'critical', status: 'in_progress', linkedTo3xTarget: true },
  { id: 'a-006', pillar: 'manufacturing', title: 'Increase raw material buffer to 45 days', description: 'Place larger fabric POs to build 45-day raw material buffer and avoid stockouts during peak demand.', owner: 'Procurement', dueDate: '2026-07-01', priority: 'high', status: 'not_started', linkedTo3xTarget: true },
  { id: 'a-007', pillar: 'logistics', title: 'Onboard Xpressbees for Tier-2/3 coverage', description: 'Add Xpressbees as preferred courier for Tier-2/3 cities to improve OTD rate.', owner: 'Ops Head', dueDate: '2026-07-20', priority: 'medium', status: 'not_started', linkedTo3xTarget: false },
  { id: 'a-008', pillar: 'finance', title: 'Negotiate volume discounts with manufacturers at 3x volumes', description: 'Renegotiate COGS rates with Tirupur vendor at 30K+ units/month to improve gross margin by 4-6pp.', owner: 'Founder', dueDate: '2026-08-01', priority: 'high', status: 'not_started', linkedTo3xTarget: true },
  { id: 'a-009', pillar: 'technology', title: 'Automate shipping label generation', description: 'Integrate Shiprocket / Easyship API to auto-generate shipping labels on order confirmation.', owner: 'Tech Lead', dueDate: '2026-08-15', priority: 'medium', status: 'not_started', linkedTo3xTarget: false },
  { id: 'a-010', pillar: 'team', title: 'Complete SOP documentation for all 15 ops processes', description: 'Document remaining 9 SOPs covering manufacturing coordination, finance reconciliation, and customer support.', owner: 'Ops Head', dueDate: '2026-07-31', priority: 'medium', status: 'in_progress', linkedTo3xTarget: false },
];

// ─── Helper Formatters ─────────────────────────────────────────────────────────
export function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatNumber(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
