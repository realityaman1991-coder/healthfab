import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INVENTORY as INIT_INVENTORY,
  WAREHOUSE_STOCK as INIT_WAREHOUSE,
  ORDERS as INIT_ORDERS,
  RETURNS as INIT_RETURNS,
  VENDORS as INIT_VENDORS,
  PURCHASE_ORDERS as INIT_POS,
  PRODUCTION_BATCHES as INIT_BATCHES,
  RAW_MATERIALS as INIT_MATERIALS,
  INIT_SOPS,
  INIT_INTEGRATIONS,
  INIT_READINESS_ITEMS,
  INIT_ACTION_ITEMS,
} from '../data/mockData';
import type {
  InventoryItem, WarehouseStock, Order, Return, Vendor,
  PurchaseOrder, ProductionBatch, RawMaterial,
  ChannelId, OrderStatus,
  SOP, SOPStep, Integration, ReadinessItem, ActionItem,
} from '../types';

interface AppStore {
  // ── Data ──────────────────────────────────────────────────────────────────
  inventory:        InventoryItem[];
  warehouseStock:   WarehouseStock[];
  orders:           Order[];
  returns:          Return[];
  vendors:          Vendor[];
  purchaseOrders:   PurchaseOrder[];
  productionBatches: ProductionBatch[];
  rawMaterials:     RawMaterial[];

  // ── Inventory actions ──────────────────────────────────────────────────────
  updateChannelStock:  (skuId: string, channelId: ChannelId, stock: number, reorderPoint?: number) => void;
  updateWarehouseStock:(skuId: string, quantity: number) => void;
  bulkUpdateInventory: (updates: { skuId: string; channelId: ChannelId; stock: number }[]) => void;

  // ── Order actions ──────────────────────────────────────────────────────────
  addOrder:         (order: Order) => void;
  updateOrderStatus:(orderId: string, status: OrderStatus, deliveredDate?: string) => void;
  bulkUpdateOrders: (orderIds: string[], status: OrderStatus) => void;

  // ── Return actions ─────────────────────────────────────────────────────────
  addReturn:           (ret: Return) => void;
  updateReturnStatus:  (returnId: string, status: Return['status']) => void;

  // ── Vendor actions ─────────────────────────────────────────────────────────
  addVendor:        (vendor: Vendor) => void;
  updateVendor:     (vendorId: string, updates: Partial<Vendor>) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePOStatus:   (poId: string, status: PurchaseOrder['status'], receivedDate?: string) => void;

  // ── Manufacturing actions ──────────────────────────────────────────────────
  addBatch:            (batch: ProductionBatch) => void;
  updateBatch:         (batchId: string, updates: Partial<ProductionBatch>) => void;
  updateRawMaterial:   (materialId: string, currentStock: number) => void;
  addRawMaterial:      (material: RawMaterial) => void;

  // ── SOP actions ────────────────────────────────────────────────────────────
  sops: SOP[];
  addSOP:          (sop: SOP) => void;
  updateSOP:       (sopId: string, updates: Partial<SOP>) => void;
  toggleSOPStep:   (sopId: string, stepId: string) => void;
  resetSOPSteps:   (sopId: string) => void;

  // ── Integration actions ────────────────────────────────────────────────────
  integrations: Integration[];
  saveIntegration: (id: string, updates: Partial<Integration>) => void;

  // ── Scale Readiness actions ────────────────────────────────────────────────
  readinessItems: ReadinessItem[];
  actionItems:    ActionItem[];
  updateReadinessItem: (itemId: string, current: number) => void;
  addActionItem:       (item: ActionItem) => void;
  updateActionItem:    (itemId: string, updates: Partial<ActionItem>) => void;

  // ── Reset ──────────────────────────────────────────────────────────────────
  resetToDefaults: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      inventory:         INIT_INVENTORY,
      warehouseStock:    INIT_WAREHOUSE,
      orders:            INIT_ORDERS,
      returns:           INIT_RETURNS,
      vendors:           INIT_VENDORS,
      purchaseOrders:    INIT_POS,
      productionBatches: INIT_BATCHES,
      rawMaterials:      INIT_MATERIALS,
      sops:              INIT_SOPS,
      integrations:      INIT_INTEGRATIONS,
      readinessItems:    INIT_READINESS_ITEMS,
      actionItems:       INIT_ACTION_ITEMS,

      // ── Inventory ──────────────────────────────────────────────────────────
      updateChannelStock: (skuId, channelId, stock, reorderPoint) =>
        set(s => ({
          inventory: s.inventory.map(i =>
            i.skuId === skuId && i.channelId === channelId
              ? { ...i, stock, ...(reorderPoint !== undefined && { reorderPoint }), lastRestocked: new Date().toISOString().split('T')[0] }
              : i
          ),
        })),

      updateWarehouseStock: (skuId, quantity) =>
        set(s => ({
          warehouseStock: s.warehouseStock.map(w =>
            w.skuId === skuId ? { ...w, quantity } : w
          ),
        })),

      bulkUpdateInventory: (updates) =>
        set(s => {
          const map = new Map(updates.map(u => [`${u.skuId}__${u.channelId}`, u.stock]));
          return {
            inventory: s.inventory.map(i => {
              const key = `${i.skuId}__${i.channelId}`;
              if (map.has(key)) {
                return { ...i, stock: map.get(key)!, lastRestocked: new Date().toISOString().split('T')[0] };
              }
              return i;
            }),
          };
        }),

      // ── Orders ─────────────────────────────────────────────────────────────
      addOrder: (order) =>
        set(s => ({ orders: [order, ...s.orders] })),

      updateOrderStatus: (orderId, status, deliveredDate) =>
        set(s => ({
          orders: s.orders.map(o =>
            o.id === orderId
              ? { ...o, status, ...(deliveredDate && { deliveredDate }) }
              : o
          ),
        })),

      bulkUpdateOrders: (orderIds, status) =>
        set(s => ({
          orders: s.orders.map(o =>
            orderIds.includes(o.id) ? { ...o, status } : o
          ),
        })),

      // ── Returns ────────────────────────────────────────────────────────────
      addReturn: (ret) =>
        set(s => ({ returns: [ret, ...s.returns] })),

      updateReturnStatus: (returnId, status) =>
        set(s => ({
          returns: s.returns.map(r =>
            r.id === returnId ? { ...r, status } : r
          ),
        })),

      // ── Vendors ────────────────────────────────────────────────────────────
      addVendor: (vendor) =>
        set(s => ({ vendors: [vendor, ...s.vendors] })),

      updateVendor: (vendorId, updates) =>
        set(s => ({
          vendors: s.vendors.map(v =>
            v.id === vendorId ? { ...v, ...updates } : v
          ),
        })),

      addPurchaseOrder: (po) =>
        set(s => ({ purchaseOrders: [po, ...s.purchaseOrders] })),

      updatePOStatus: (poId, status, receivedDate) =>
        set(s => ({
          purchaseOrders: s.purchaseOrders.map(p =>
            p.id === poId
              ? { ...p, status, ...(receivedDate && { receivedDate }) }
              : p
          ),
        })),

      // ── Manufacturing ──────────────────────────────────────────────────────
      addBatch: (batch) =>
        set(s => ({ productionBatches: [batch, ...s.productionBatches] })),

      updateBatch: (batchId, updates) =>
        set(s => ({
          productionBatches: s.productionBatches.map(b =>
            b.id === batchId ? { ...b, ...updates } : b
          ),
        })),

      updateRawMaterial: (materialId, currentStock) =>
        set(s => ({
          rawMaterials: s.rawMaterials.map(m =>
            m.id === materialId ? { ...m, currentStock } : m
          ),
        })),

      addRawMaterial: (material) =>
        set(s => ({ rawMaterials: [material, ...s.rawMaterials] })),

      // ── SOPs ───────────────────────────────────────────────────────────────
      addSOP: (sop) =>
        set(s => ({ sops: [sop, ...s.sops] })),

      updateSOP: (sopId, updates) =>
        set(s => ({
          sops: s.sops.map(sop => sop.id === sopId ? { ...sop, ...updates } : sop),
        })),

      toggleSOPStep: (sopId, stepId) =>
        set(s => ({
          sops: s.sops.map(sop => {
            if (sop.id !== sopId) return sop;
            const steps = sop.steps.map((step: SOPStep) =>
              step.id === stepId ? { ...step, checked: !step.checked } : step
            );
            const allDone = steps.every((step: SOPStep) => step.checked);
            return {
              ...sop,
              steps,
              ...(allDone && { completionCount: sop.completionCount + 1 }),
            };
          }),
        })),

      resetSOPSteps: (sopId) =>
        set(s => ({
          sops: s.sops.map(sop =>
            sop.id === sopId
              ? { ...sop, steps: sop.steps.map((step: SOPStep) => ({ ...step, checked: false })) }
              : sop
          ),
        })),

      // ── Integrations ───────────────────────────────────────────────────────
      saveIntegration: (id, updates) =>
        set(s => ({
          integrations: s.integrations.map(i =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      // ── Scale Readiness ────────────────────────────────────────────────────
      updateReadinessItem: (itemId, current) =>
        set(s => ({
          readinessItems: s.readinessItems.map(r =>
            r.id === itemId ? { ...r, current } : r
          ),
        })),

      addActionItem: (item) =>
        set(s => ({ actionItems: [item, ...s.actionItems] })),

      updateActionItem: (itemId, updates) =>
        set(s => ({
          actionItems: s.actionItems.map(a =>
            a.id === itemId ? { ...a, ...updates } : a
          ),
        })),

      // ── Reset ──────────────────────────────────────────────────────────────
      resetToDefaults: () =>
        set({
          inventory:         INIT_INVENTORY,
          warehouseStock:    INIT_WAREHOUSE,
          orders:            INIT_ORDERS,
          returns:           INIT_RETURNS,
          vendors:           INIT_VENDORS,
          purchaseOrders:    INIT_POS,
          productionBatches: INIT_BATCHES,
          rawMaterials:      INIT_MATERIALS,
          sops:              INIT_SOPS,
          integrations:      INIT_INTEGRATIONS,
          readinessItems:    INIT_READINESS_ITEMS,
          actionItems:       INIT_ACTION_ITEMS,
        }),
    }),
    { name: 'healthfab-ops-store' }
  )
);
