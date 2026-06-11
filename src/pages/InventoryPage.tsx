import { useState } from 'react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { EditStockForm, BulkRestockForm, WarehouseStockForm } from '../components/forms/InventoryForms';
import { CHANNELS, PRODUCTS, SIZES } from '../data/mockData';
import { useStore } from '../store';
import { Package, AlertTriangle, BarChart3, Warehouse, Plus, Edit2, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ChannelId } from '../types';

type ModalState =
  | { kind: 'edit_stock';   skuId: string; channelId: ChannelId }
  | { kind: 'bulk_restock' }
  | { kind: 'warehouse';    skuId: string; currentQty: number }
  | null;

export default function InventoryPage() {
  const inventory     = useStore(s => s.inventory);
  const warehouseStock = useStore(s => s.warehouseStock);

  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'warehouse'>('grid');
  const [modal, setModal] = useState<ModalState>(null);

  const getStock = (skuId: string, channelId: string) =>
    inventory.find(i => i.skuId === skuId && i.channelId === channelId)?.stock ?? 0;

  const getReorderPoint = (skuId: string, channelId: string) =>
    inventory.find(i => i.skuId === skuId && i.channelId === channelId)?.reorderPoint ?? 50;

  const stockStatus = (stock: number, reorder: number) => {
    if (stock === 0)             return 'oos';
    if (stock <= reorder * 0.5) return 'critical';
    if (stock <= reorder)        return 'low';
    return 'ok';
  };

  const displayChannels = CHANNELS.filter(c => selectedChannel === 'all' || c.id === selectedChannel);

  const channelTotals = CHANNELS.map(ch => ({
    name:  ch.name.replace(' Instamart', ''),
    total: inventory.filter(i => i.channelId === ch.id).reduce((s, i) => s + i.stock, 0),
    color: ch.color,
  }));

  const lowStockItems = inventory.filter(i => {
    const ss = stockStatus(i.stock, i.reorderPoint);
    return ss === 'critical' || ss === 'oos';
  });

  const modalTitle = modal?.kind === 'edit_stock'
    ? 'Edit Channel Stock'
    : modal?.kind === 'bulk_restock'
    ? 'Bulk Restock (All Sizes)'
    : 'Update Warehouse Stock';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Inventory Management" subtitle="Multi-channel stock · Reorder tracking · Warehouse" />

      {/* Modal */}
      <Modal open={modal !== null} onClose={() => setModal(null)} title={modalTitle} width="md">
        {modal?.kind === 'edit_stock' && (
          <EditStockForm
            skuId={modal.skuId}
            channelId={modal.channelId}
            currentStock={getStock(modal.skuId, modal.channelId)}
            reorderPoint={getReorderPoint(modal.skuId, modal.channelId)}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === 'bulk_restock' && (
          <BulkRestockForm onClose={() => setModal(null)} />
        )}
        {modal?.kind === 'warehouse' && (
          <WarehouseStockForm
            skuId={modal.skuId}
            currentQty={modal.currentQty}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      <div className="p-6 space-y-5">

        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total SKUs',               value: SIZES.length * PRODUCTS.length, icon: Package,       color: 'text-violet-600 bg-violet-50' },
            { label: 'Total Units (All Channels)',value: inventory.reduce((s, i) => s + i.stock, 0).toLocaleString(), icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
            { label: 'Low / OOS SKUs',            value: lowStockItems.length,           icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
            { label: 'Warehouse Stock',           value: warehouseStock.reduce((s, w) => s + w.quantity, 0).toLocaleString(), icon: Warehouse, color: 'text-emerald-600 bg-emerald-50' },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}>
                <t.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t.label}</p>
                <p className="text-xl font-bold text-slate-900">{t.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Channel stock chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Stock by Channel</h2>
            <button
              onClick={() => setModal({ kind: 'bulk_restock' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            >
              <RefreshCw size={12} /> Bulk Restock
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelTotals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {channelTotals.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Reorder Alerts ({lowStockItems.length} SKUs)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockItems.slice(0, 9).map((item, i) => {
                const ch = CHANNELS.find(c => c.id === item.channelId);
                const parts = item.skuId.split('-');
                const size = parts[parts.length - 1].toUpperCase();
                const prod = PRODUCTS.find(p => p.id === parts.slice(0, 2).join('-'));
                const ss = stockStatus(item.stock, item.reorderPoint);
                return (
                  <div key={i} className="bg-white rounded-lg border border-red-200 px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{prod?.shortName ?? item.skuId} – {size.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">{ch?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{item.stock} units</p>
                        <StatusBadge status={ss === 'oos' ? 'returned' : 'pending'} />
                      </div>
                      <button
                        onClick={() => setModal({ kind: 'edit_stock', skuId: item.skuId, channelId: item.channelId })}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {(['grid','warehouse'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === v ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {v === 'grid' ? 'Channel Grid' : 'Warehouse'}
                </button>
              ))}
            </div>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="all">All Products</option>
              {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {view === 'grid' && (
              <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300">
                <option value="all">All Channels</option>
                {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {view === 'grid' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Product</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-500">Size</th>
                    {displayChannels.map(ch => (
                      <th key={ch.id} className="text-center px-3 py-2.5 font-semibold" style={{ color: ch.color }}>
                        {ch.name.replace(' Instamart', '')}
                      </th>
                    ))}
                    <th className="text-center px-3 py-2.5 font-semibold text-slate-500">Total</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.filter(p => selectedProduct === 'all' || p.id === selectedProduct).flatMap(product =>
                    SIZES.map(size => {
                      const skuId = `${product.id}-${size}`;
                      const total = displayChannels.reduce((sum, ch) => sum + getStock(skuId, ch.id), 0);
                      return (
                        <tr key={skuId} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                          <td className="px-4 py-2.5 font-medium text-slate-800">{product.shortName}</td>
                          <td className="px-3 py-2.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{size}</span>
                          </td>
                          {displayChannels.map(ch => {
                            const stock  = getStock(skuId, ch.id);
                            const reorder = getReorderPoint(skuId, ch.id);
                            const ss     = stockStatus(stock, reorder);
                            return (
                              <td key={ch.id} className="text-center px-3 py-2.5">
                                <button
                                  onClick={() => setModal({ kind: 'edit_stock', skuId, channelId: ch.id })}
                                  className={`font-semibold hover:underline cursor-pointer ${
                                    ss === 'oos' ? 'text-red-600' :
                                    ss === 'critical' ? 'text-red-500' :
                                    ss === 'low' ? 'text-amber-600' :
                                    'text-slate-700 hover:text-violet-600'
                                  }`}
                                  title="Click to edit stock"
                                >
                                  {stock}
                                </button>
                              </td>
                            );
                          })}
                          <td className="text-center px-3 py-2.5 font-bold text-slate-900">{total}</td>
                          <td className="px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModal({ kind: 'bulk_restock' })}
                              className="p-1 rounded hover:bg-violet-50 text-violet-600"
                              title="Bulk restock this product"
                            >
                              <Plus size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400 px-4 py-2 border-t border-slate-100">
                Click any stock number to edit it directly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['SKU','Location','Qty','Reserved','Available',''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {warehouseStock
                    .filter(ws => {
                      const parts = ws.skuId.split('-');
                      const productId = parts.slice(0, 2).join('-');
                      return selectedProduct === 'all' || productId === selectedProduct;
                    })
                    .map(ws => {
                      const parts = ws.skuId.split('-');
                      const size = parts[parts.length - 1].toUpperCase();
                      const productId = parts.slice(0, 2).join('-');
                      const prod = PRODUCTS.find(p => p.id === productId);
                      return (
                        <tr key={ws.skuId} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                          <td className="px-4 py-2.5 font-medium text-slate-800">{prod?.shortName} – {size}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{ws.location}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">{ws.quantity}</td>
                          <td className="px-3 py-2.5 text-amber-600">{ws.reservedQty}</td>
                          <td className="px-3 py-2.5 font-bold text-emerald-600">{ws.quantity - ws.reservedQty}</td>
                          <td className="px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModal({ kind: 'warehouse', skuId: ws.skuId, currentQty: ws.quantity })}
                              className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-600 rounded text-[10px] font-semibold hover:bg-violet-100"
                            >
                              <Edit2 size={10} /> Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3 border-t border-slate-100 flex gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> OK</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Below reorder point</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Critical / OOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
