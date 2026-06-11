import { useState, useMemo } from 'react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { AddOrderForm, UpdateOrderStatusForm, BulkStatusForm } from '../components/forms/OrderForms';
import { CHANNELS, SKUS, PRODUCTS } from '../data/mockData';
import { useStore } from '../store';
import { Search, Filter, ShoppingCart, Clock, CheckCircle, XCircle, Plus, Edit2, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { OrderStatus } from '../types';

const STATUS_OPTS: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

type ModalState =
  | { kind: 'add' }
  | { kind: 'update_status'; orderId: string; currentStatus: OrderStatus }
  | { kind: 'bulk'; orderIds: string[] }
  | null;

export default function OrdersPage() {
  const orders = useStore(s => s.orders);

  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [modal,         setModal]         = useState<ModalState>(null);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch  = search === '' || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = statusFilter  === 'all' || o.status  === statusFilter;
    const matchChannel = channelFilter === 'all' || o.channelId === channelFilter;
    return matchSearch && matchStatus && matchChannel;
  }), [orders, search, statusFilter, channelFilter]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const byStatus = STATUS_OPTS.map(s => ({ status: s, count: orders.filter(o => o.status === s).length }));
  const revenue  = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);
  const deliveryRate = ((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(1);
  const cancelRate   = ((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100).toFixed(1);

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(prev => prev.size === paginated.length ? new Set() : new Set(paginated.map(o => o.id)));
  }

  const modalTitle = modal?.kind === 'add' ? 'Create New Order'
    : modal?.kind === 'update_status' ? 'Update Order Status'
    : 'Bulk Status Update';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Order Management" subtitle="All channels · Real-time tracking · SLA monitoring" />

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modalTitle} width="md">
        {modal?.kind === 'add'           && <AddOrderForm onClose={() => setModal(null)} />}
        {modal?.kind === 'update_status' && <UpdateOrderStatusForm orderId={modal.orderId} currentStatus={modal.currentStatus} onClose={() => setModal(null)} />}
        {modal?.kind === 'bulk'          && <BulkStatusForm orderIds={modal.orderIds} onClose={() => { setModal(null); setSelected(new Set()); }} />}
      </Modal>

      <div className="p-6 space-y-5">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders',    value: orders.length.toLocaleString(), icon: ShoppingCart, color: 'text-violet-600 bg-violet-50' },
            { label: 'Revenue',         value: `₹${(revenue / 100000).toFixed(1)}L`, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Delivery Rate',   value: `${deliveryRate}%`, icon: Clock,       color: 'text-blue-600 bg-blue-50' },
            { label: 'Cancellation %',  value: `${cancelRate}%`,  icon: XCircle,     color: 'text-red-500 bg-red-50' },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}><t.icon size={18} /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t.label}</p>
                <p className="text-xl font-bold text-slate-900">{t.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Order Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byStatus} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byStatus.map((entry, i) => {
                  const colors: Record<string, string> = { delivered: '#10b981', shipped: '#06b6d4', processing: '#6366f1', confirmed: '#3b82f6', pending: '#f59e0b', cancelled: '#94a3b8', returned: '#ef4444' };
                  return <Cell key={i} fill={colors[entry.status] ?? '#94a3b8'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 flex-1 min-w-48">
              <Search size={13} className="text-slate-400" />
              <input type="text" placeholder="Search order ID, customer, city…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none">
                <option value="all">All Statuses</option>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none">
                <option value="all">All Channels</option>
                {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selected.size > 0 && (
              <button onClick={() => setModal({ kind: 'bulk', orderIds: [...selected] })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
                <RefreshCw size={12} /> Update {selected.size} Orders
              </button>
            )}
            <button onClick={() => setModal({ kind: 'add' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 ml-auto">
              <Plus size={12} /> New Order
            </button>
            <span className="text-xs text-slate-500">{filtered.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded" />
                  </th>
                  {['Order ID','Channel','Product','Size','Customer','City','Date','Amount','Status',''].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(order => {
                  const ch   = CHANNELS.find(c => c.id === order.channelId)!;
                  const sku  = SKUS.find(s => s.id === order.skuId)!;
                  const prod = PRODUCTS.find(p => p.id === sku?.productId)!;
                  return (
                    <tr key={order.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${selected.has(order.id) ? 'bg-violet-50/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleSelect(order.id)} className="rounded" />
                      </td>
                      <td className="px-3 py-2.5 font-mono font-semibold text-violet-700">{order.id}</td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: ch?.color }} />
                          {ch?.name.replace(' Instamart','')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{prod?.shortName}</td>
                      <td className="px-3 py-2.5"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{sku?.size}</span></td>
                      <td className="px-3 py-2.5 text-slate-700">{order.customer}</td>
                      <td className="px-3 py-2.5 text-slate-500">{order.city}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{order.date}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">₹{order.amount}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setModal({ kind: 'update_status', orderId: order.id, currentStatus: order.status })}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                          title="Update status"
                        >
                          <Edit2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium ${page === p ? 'bg-violet-600 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
