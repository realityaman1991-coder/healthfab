import { useState } from 'react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { VendorForm, PurchaseOrderForm, POStatusForm } from '../components/forms/VendorForms';
import { formatCurrency } from '../data/mockData';
import { useStore } from '../store';
import { Users, Star, TrendingUp, Package, AlertTriangle, Plus, Edit2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import type { Vendor } from '../types';

const TYPE_COLORS: Record<string, string> = {
  fabric: '#6366f1', manufacturer: '#10b981', packaging: '#f59e0b', courier: '#06b6d4',
};
const TYPE_LABELS: Record<string, string> = {
  fabric: 'Fabric Supplier', manufacturer: 'Manufacturer', packaging: 'Packaging', courier: 'Courier',
};

type ModalState =
  | { kind: 'add_vendor' }
  | { kind: 'edit_vendor'; vendor: Vendor }
  | { kind: 'add_po' }
  | { kind: 'update_po'; poId: string; currentStatus: string }
  | null;

export default function VendorsPage() {
  const vendors        = useStore(s => s.vendors);
  const purchaseOrders = useStore(s => s.purchaseOrders);

  const [selectedType,   setSelectedType]   = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [modal,          setModal]          = useState<ModalState>(null);

  const filtered      = vendors.filter(v => selectedType === 'all' || v.type === selectedType);
  const activeVendors = vendors.filter(v => v.status === 'active');
  const totalSpend    = vendors.reduce((s, v) => s + v.totalSpendMTD, 0);

  const scorecardVendor = selectedVendor
    ? vendors.find(v => v.id === selectedVendor)
    : vendors.find(v => v.status === 'active');

  const radarData = scorecardVendor ? [
    { metric: 'On-Time',  value: scorecardVendor.onTimeDeliveryRate },
    { metric: 'Quality',  value: scorecardVendor.qualityScore },
    { metric: 'Cost',     value: scorecardVendor.costRating * 20 },
    { metric: 'Speed',    value: Math.max(0, 100 - scorecardVendor.leadTimeDays * 5) },
    { metric: 'MOQ',      value: Math.max(0, 100 - scorecardVendor.moq / 20) },
  ] : [];

  const spendData = activeVendors.map(v => ({
    name:  v.name.split(' ')[0],
    spend: v.totalSpendMTD,
    color: TYPE_COLORS[v.type] ?? '#94a3b8',
  }));

  const modalTitle = modal?.kind === 'add_vendor' ? 'Add New Vendor'
    : modal?.kind === 'edit_vendor' ? `Edit: ${modal.vendor.name}`
    : modal?.kind === 'add_po' ? 'Create Purchase Order'
    : 'Update PO Status';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Vendor & Supplier Management" subtitle="Scorecards · Purchase orders · Spend tracking" />

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modalTitle} width="md">
        {modal?.kind === 'add_vendor'   && <VendorForm onClose={() => setModal(null)} />}
        {modal?.kind === 'edit_vendor'  && <VendorForm existing={modal.vendor} onClose={() => setModal(null)} />}
        {modal?.kind === 'add_po'       && <PurchaseOrderForm onClose={() => setModal(null)} />}
        {modal?.kind === 'update_po'    && <POStatusForm poId={modal.poId} currentStatus={modal.currentStatus as any} onClose={() => setModal(null)} />}
      </Modal>

      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Vendors',  value: activeVendors.length, icon: Users,         color: 'text-violet-600 bg-violet-50' },
            { label: 'Open POs',        value: purchaseOrders.filter(p => p.status !== 'received').length, icon: Package, color: 'text-blue-600 bg-blue-50' },
            { label: 'MTD Spend',       value: formatCurrency(totalSpend), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'At-Risk Vendors', value: vendors.filter(v => v.onTimeDeliveryRate < 88).length, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
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

        {/* Vendor grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Vendor Directory</h2>
            <div className="flex gap-2">
              {['all','fabric','manufacturer','packaging'].map(t => (
                <button key={t} onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedType === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {t === 'all' ? 'All' : TYPE_LABELS[t]}
                </button>
              ))}
              <button onClick={() => setModal({ kind: 'add_vendor' })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
                <Plus size={12} /> Add Vendor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(v => (
              <div key={v.id} onClick={() => setSelectedVendor(v.id === selectedVendor ? null : v.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedVendor === v.id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{v.name}</p>
                    <p className="text-xs text-slate-500">{v.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={v.status} />
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${TYPE_COLORS[v.type]}18`, color: TYPE_COLORS[v.type] }}>
                      {TYPE_LABELS[v.type]}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${v.onTimeDeliveryRate >= 90 ? 'text-emerald-600' : v.onTimeDeliveryRate >= 85 ? 'text-amber-600' : 'text-red-500'}`}>{v.onTimeDeliveryRate}%</p>
                    <p className="text-[9px] text-slate-400">On-Time</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${v.qualityScore >= 90 ? 'text-emerald-600' : v.qualityScore >= 80 ? 'text-amber-600' : 'text-red-500'}`}>{v.qualityScore}</p>
                    <p className="text-[9px] text-slate-400">Quality</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{v.leadTimeDays}d</p>
                    <p className="text-[9px] text-slate-400">Lead Time</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span>MTD: <strong>{formatCurrency(v.totalSpendMTD)}</strong></span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={10} className={i < v.costRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                    <button onClick={e => { e.stopPropagation(); setModal({ kind: 'edit_vendor', vendor: v }); }}
                      className="ml-1 p-1 rounded hover:bg-violet-100 text-violet-600 transition-colors">
                      <Edit2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scorecardVendor && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-1">Vendor Scorecard: {scorecardVendor.name}</h2>
              <p className="text-xs text-slate-500 mb-4">Click any vendor to view scorecard</p>
              <ResponsiveContainer width="100%" height={230}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar name={scorecardVendor.name} dataKey="value" stroke={TYPE_COLORS[scorecardVendor.type]} fill={TYPE_COLORS[scorecardVendor.type]} fillOpacity={0.2} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">MTD Spend by Vendor</h2>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={spendData} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => formatCurrency(Number(v))} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={60} />
                <Tooltip formatter={(v: unknown) => [formatCurrency(Number(v)), 'Spend']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                  {spendData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Purchase Orders</h2>
            <button onClick={() => setModal({ kind: 'add_po' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
              <Plus size={12} /> New PO
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['PO Number','Vendor','Items','Qty','Amount','Status','Order Date','Expected','Received',''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => {
                  const vendor = vendors.find(v => v.id === po.vendorId)!;
                  const isLate = !po.receivedDate && new Date(po.expectedDate) < new Date('2026-06-11') && po.status !== 'received';
                  return (
                    <tr key={po.id} className={`border-b border-slate-50 hover:bg-slate-50/60 ${isLate ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2.5 font-mono font-semibold text-violet-700">{po.id}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{vendor?.name}</td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-40 truncate">{po.items}</td>
                      <td className="px-4 py-2.5 text-slate-700">{po.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{formatCurrency(po.amount)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={po.status} /></td>
                      <td className="px-4 py-2.5 text-slate-500">{po.orderDate}</td>
                      <td className={`px-4 py-2.5 ${isLate ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>{po.expectedDate}{isLate && ' ⚠️'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{po.receivedDate ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setModal({ kind: 'update_po', poId: po.id, currentStatus: po.status })}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors" title="Update PO status">
                          <Edit2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
