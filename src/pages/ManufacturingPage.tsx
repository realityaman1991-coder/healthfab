import { useState } from 'react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { AddBatchForm, UpdateBatchForm, RawMaterialForm } from '../components/forms/ManufacturingForms';
import { VENDORS, PRODUCTS } from '../data/mockData';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Factory, AlertTriangle, CheckCircle, TrendingUp, Plus, Edit2 } from 'lucide-react';

const BATCH_COLORS: Record<string, string> = {
  completed: '#10b981', in_progress: '#6366f1', planned: '#94a3b8', qc_pending: '#f59e0b', rejected: '#ef4444',
};

type ModalState =
  | { kind: 'add_batch' }
  | { kind: 'update_batch'; batchId: string }
  | { kind: 'add_material' }
  | { kind: 'update_material'; materialId: string }
  | null;

export default function ManufacturingPage() {
  const batches       = useStore(s => s.productionBatches);
  const rawMaterials  = useStore(s => s.rawMaterials);
  const [modal, setModal] = useState<ModalState>(null);

  const totalPlanned  = batches.reduce((s, b) => s + b.plannedQty, 0);
  const totalProduced = batches.filter(b => b.actualQty).reduce((s, b) => s + (b.actualQty ?? 0), 0);
  const completedBatches = batches.filter(b => b.qcPassRate);
  const avgQcRate = completedBatches.length > 0
    ? completedBatches.reduce((s, b) => s + (b.qcPassRate ?? 0), 0) / completedBatches.length
    : 0;
  const lowStockMaterials = rawMaterials.filter(m => m.currentStock <= m.reorderPoint);

  const batchByStatus = ['planned','in_progress','completed','qc_pending'].map(s => ({
    status: s,
    count:  batches.filter(b => b.status === s).length,
    color:  BATCH_COLORS[s] ?? '#94a3b8',
  }));

  const qcData = batches.filter(b => b.qcPassRate).map(b => ({
    batch:    b.id.replace('BATCH-','#'),
    passRate: b.qcPassRate,
    product:  PRODUCTS.find(p => p.id === b.productId)?.shortName,
  }));

  const modalTitles: Record<string, string> = {
    add_batch:       'Plan New Production Batch',
    update_batch:    'Update Batch',
    add_material:    'Add Raw Material',
    update_material: 'Update Stock Level',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Manufacturing & Production" subtitle="Batch tracking · QC · Raw materials · Capacity planning" />

      <Modal open={modal !== null} onClose={() => setModal(null)}
        title={modal ? modalTitles[modal.kind] : ''} width="md">
        {modal?.kind === 'add_batch'       && <AddBatchForm onClose={() => setModal(null)} />}
        {modal?.kind === 'update_batch'    && <UpdateBatchForm batchId={modal.batchId} onClose={() => setModal(null)} />}
        {modal?.kind === 'add_material'    && <RawMaterialForm onClose={() => setModal(null)} />}
        {modal?.kind === 'update_material' && <RawMaterialForm materialId={modal.materialId} onClose={() => setModal(null)} />}
      </Modal>

      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Units Planned',      value: totalPlanned.toLocaleString(),  icon: Factory,       color: 'text-violet-600 bg-violet-50' },
            { label: 'Units Produced (MTD)',value: totalProduced.toLocaleString(), icon: CheckCircle,   color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Avg QC Pass Rate',   value: `${avgQcRate.toFixed(1)}%`,     icon: TrendingUp,    color: 'text-blue-600 bg-blue-50' },
            { label: 'Low Stock Materials',value: lowStockMaterials.length,        icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Batches by Status</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={batchByStatus} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {batchByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">QC Pass Rate by Batch</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={qcData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="batch" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[90, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: unknown) => [`${v}%`, 'QC Pass Rate']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="passRate" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production batches */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Production Batches</h2>
            <button onClick={() => setModal({ kind: 'add_batch' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
              <Plus size={12} /> Plan Batch
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Batch ID','Product','Size','Planned','Actual','Start','End','QC %','Manufacturer','Status',''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => {
                  const prod = PRODUCTS.find(p => p.id === batch.productId)!;
                  const mfr  = VENDORS.find(v => v.id === batch.manufacturerId)!;
                  return (
                    <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono font-semibold text-violet-700">{batch.id}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{prod?.shortName}</td>
                      <td className="px-4 py-2.5"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{batch.sizeId}</span></td>
                      <td className="px-4 py-2.5 text-slate-700">{batch.plannedQty}</td>
                      <td className="px-4 py-2.5">
                        {batch.actualQty ? (
                          <span className={`font-semibold ${batch.actualQty >= batch.plannedQty * 0.98 ? 'text-emerald-600' : 'text-amber-600'}`}>{batch.actualQty}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{batch.startDate}</td>
                      <td className="px-4 py-2.5 text-slate-500">{batch.endDate}</td>
                      <td className="px-4 py-2.5">
                        {batch.qcPassRate ? (
                          <span className={`font-bold ${batch.qcPassRate >= 97 ? 'text-emerald-600' : batch.qcPassRate >= 95 ? 'text-amber-600' : 'text-red-500'}`}>{batch.qcPassRate}%</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 truncate max-w-32">{mfr?.name}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={batch.status} /></td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setModal({ kind: 'update_batch', batchId: batch.id })}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors" title="Update batch">
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

        {/* Raw Materials */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-800">Raw Material Inventory</h2>
              {lowStockMaterials.length > 0 && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <AlertTriangle size={10} /> {lowStockMaterials.length} need reorder
                </span>
              )}
            </div>
            <button onClick={() => setModal({ kind: 'add_material' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
              <Plus size={12} /> Add Material
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Material','Unit','Current Stock','Reorder Point','Status','Cost/Unit','Supplier','Lead Time',''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map(rm => {
                  const supplier = VENDORS.find(v => v.id === rm.supplierId)!;
                  const pct      = rm.currentStock / rm.reorderPoint;
                  const needsReorder = rm.currentStock <= rm.reorderPoint;
                  return (
                    <tr key={rm.id} className={`border-b border-slate-50 hover:bg-slate-50/60 ${needsReorder ? 'bg-red-50/20' : ''}`}>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{rm.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{rm.unit}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${needsReorder ? 'text-red-600' : 'text-slate-800'}`}>{rm.currentStock.toLocaleString()}</span>
                          <div className="w-14 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${pct >= 2 ? 'bg-emerald-500' : pct >= 1 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(100, (pct / 3) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{rm.reorderPoint.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${needsReorder ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {needsReorder ? 'Reorder Now' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">₹{rm.costPerUnit}/{rm.unit.replace('s','')}</td>
                      <td className="px-4 py-2.5 text-slate-600 truncate max-w-32">{supplier?.name}</td>
                      <td className="px-4 py-2.5 text-slate-600">{rm.leadTimeDays}d</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setModal({ kind: 'update_material', materialId: rm.id })}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors" title="Update stock">
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

        {/* Capacity planning */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-5">
          <h2 className="text-sm font-bold text-violet-800 mb-2 flex items-center gap-2">
            <TrendingUp size={14} /> Capacity Planning: 3x Scale Target
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-violet-700">
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="font-bold mb-1">Current Capacity</p>
              <p className="text-2xl font-bold text-violet-600">~18K</p>
              <p>units/month across {VENDORS.filter(v => v.type === 'manufacturer' && v.status === 'active').length} manufacturers</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="font-bold mb-1">3x Target Capacity</p>
              <p className="text-2xl font-bold text-indigo-600">~54K</p>
              <p>units/month — requires 1 additional manufacturer onboarding</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="font-bold mb-1">Action Required</p>
              <ul className="space-y-1 mt-1 list-disc list-inside">
                <li>Onboard 3rd manufacturer by Aug 2026</li>
                <li>Secure fabric supply for 54K/mo volume</li>
                <li>Upgrade QC team (add 2 QA inspectors)</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
