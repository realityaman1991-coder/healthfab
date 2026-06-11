import { useState } from 'react';
import { Field, Input, Select, FormRow, FormActions } from '../common/Modal';
import { useStore } from '../../store';
import { SKUS, CHANNELS, PRODUCTS, SIZES } from '../../data/mockData';
import type { ChannelId } from '../../types';

// ── Edit stock for a single SKU × Channel ────────────────────────────────────
interface EditStockFormProps {
  skuId: string;
  channelId: ChannelId;
  currentStock: number;
  reorderPoint: number;
  onClose: () => void;
}

export function EditStockForm({ skuId, channelId, currentStock, reorderPoint, onClose }: EditStockFormProps) {
  const updateChannelStock = useStore(s => s.updateChannelStock);
  const [stock, setStock] = useState(String(currentStock));
  const [rp, setRp] = useState(String(reorderPoint));

  const sku = SKUS.find(s => s.id === skuId);
  const prod = PRODUCTS.find(p => p.id === sku?.productId);
  const ch = CHANNELS.find(c => c.id === channelId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateChannelStock(skuId, channelId, Number(stock), Number(rp));
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">SKU:</span> {prod?.name} — {sku?.size}</p>
        <p><span className="font-semibold">Channel:</span> {ch?.name}</p>
      </div>
      <FormRow>
        <Field label="Current Stock (Units)" required>
          <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
        </Field>
        <Field label="Reorder Point" hint="Alert triggers below this level">
          <Input type="number" min="0" value={rp} onChange={e => setRp(e.target.value)} />
        </Field>
      </FormRow>
      <FormActions onCancel={onClose} submitLabel="Update Stock" />
    </form>
  );
}

// ── Bulk restock form ─────────────────────────────────────────────────────────
interface BulkRestockFormProps {
  onClose: () => void;
}

export function BulkRestockForm({ onClose }: BulkRestockFormProps) {
  const bulkUpdateInventory = useStore(s => s.bulkUpdateInventory);
  const inventory = useStore(s => s.inventory);

  const [selectedProduct, setSelectedProduct] = useState('gpf-heavy');
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>('amazon');
  const [rows, setRows] = useState(
    SIZES.map(size => ({
      size,
      skuId: `${selectedProduct}-${size}`,
      stock: String(inventory.find(i => i.skuId === `${selectedProduct}-${size}` && i.channelId === selectedChannel)?.stock ?? 0),
    }))
  );

  function refreshRows(product: string, channel: ChannelId) {
    setRows(SIZES.map(size => ({
      size,
      skuId: `${product}-${size}`,
      stock: String(inventory.find(i => i.skuId === `${product}-${size}` && i.channelId === channel)?.stock ?? 0),
    })));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    bulkUpdateInventory(rows.map(r => ({ skuId: r.skuId, channelId: selectedChannel, stock: Number(r.stock) })));
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow>
        <Field label="Product" required>
          <Select value={selectedProduct} onChange={e => {
            setSelectedProduct(e.target.value);
            refreshRows(e.target.value, selectedChannel);
          }}>
            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Channel" required>
          <Select value={selectedChannel} onChange={e => {
            const ch = e.target.value as ChannelId;
            setSelectedChannel(ch);
            refreshRows(selectedProduct, ch);
          }}>
            {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
      </FormRow>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Size</th>
              <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Stock (Units)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.size} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">
                  <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-bold">{row.size}</span>
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min="0"
                    value={row.stock}
                    onChange={e => setRows(prev => prev.map((r, j) => j === i ? { ...r, stock: e.target.value } : r))}
                    className="max-w-28"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormActions onCancel={onClose} submitLabel="Update All Sizes" />
    </form>
  );
}

// ── Warehouse stock update ────────────────────────────────────────────────────
interface WarehouseFormProps {
  skuId: string;
  currentQty: number;
  onClose: () => void;
}

export function WarehouseStockForm({ skuId, currentQty, onClose }: WarehouseFormProps) {
  const updateWarehouseStock = useStore(s => s.updateWarehouseStock);
  const [qty, setQty] = useState(String(currentQty));
  const sku = SKUS.find(s => s.id === skuId);
  const prod = PRODUCTS.find(p => p.id === sku?.productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateWarehouseStock(skuId, Number(qty));
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">SKU:</span> {prod?.name} — {sku?.size}</p>
      </div>
      <Field label="Warehouse Quantity" required>
        <Input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} required />
      </Field>
      <FormActions onCancel={onClose} submitLabel="Update Warehouse Stock" />
    </form>
  );
}
