import { useState } from 'react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { UpdateReturnStatusForm } from '../components/forms/ReturnForms';
import { CHANNELS, SKUS, PRODUCTS } from '../data/mockData';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RotateCcw, AlertTriangle, CheckCircle, DollarSign, Edit2 } from 'lucide-react';
import type { Return } from '../types';

const REASON_LABELS: Record<string, string> = {
  wrong_size: 'Wrong Size', defect: 'Defect / Quality',
  not_as_described: 'Not as Described', changed_mind: 'Changed Mind',
  delivery_damage: 'Delivery Damage',
};
const REASON_COLORS: Record<string, string> = {
  wrong_size: '#f59e0b', defect: '#ef4444', not_as_described: '#6366f1',
  changed_mind: '#94a3b8', delivery_damage: '#f97316',
};

type ModalState = { kind: 'update'; returnId: string; currentStatus: Return['status'] } | null;

export default function ReturnsPage() {
  const returns = useStore(s => s.returns);
  const orders  = useStore(s => s.orders);

  const [modal, setModal] = useState<ModalState>(null);

  const totalRefund      = returns.reduce((s, r) => s + r.refundAmount, 0);
  const restockableCount = returns.filter(r => r.restockable).length;
  const returnRate       = ((returns.length / Math.max(orders.length, 1)) * 100).toFixed(1);

  const byReason = Object.entries(
    returns.reduce((acc, r) => { acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([reason, count]) => ({ reason: REASON_LABELS[reason] ?? reason, count, color: REASON_COLORS[reason] ?? '#94a3b8' }))
   .sort((a, b) => b.count - a.count);

  const byChannel = CHANNELS.map(ch => ({
    channel: ch.name.replace(' Instamart', ''),
    returns: returns.filter(r => r.channelId === ch.id).length,
    color:   ch.color,
  })).filter(c => c.returns > 0);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Returns Management" subtitle="Return tracking · Reason analysis · Restocking decisions" />

      <Modal open={modal !== null} onClose={() => setModal(null)} title="Update Return Status" width="sm">
        {modal && <UpdateReturnStatusForm returnId={modal.returnId} currentStatus={modal.currentStatus} onClose={() => setModal(null)} />}
      </Modal>

      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Returns (MTD)', value: returns.length,              icon: RotateCcw,    color: 'text-orange-600 bg-orange-50' },
            { label: 'Return Rate',         value: `${returnRate}%`,            icon: AlertTriangle,color: 'text-red-500 bg-red-50' },
            { label: 'Restockable',         value: restockableCount,            icon: CheckCircle,  color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Refunds Issued',      value: `₹${(totalRefund/1000).toFixed(1)}K`, icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
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
            <h2 className="text-sm font-bold text-slate-800 mb-4">Returns by Reason</h2>
            <div className="flex gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={byReason} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="count">
                    {byReason.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byReason.map(r => (
                  <div key={r.reason} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-slate-600">{r.reason}</span>
                    </div>
                    <span className="font-bold text-slate-800">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
              <strong>Key insight:</strong> Wrong Size is the #1 return reason — add a pre-purchase fit guide and size recommendation tool.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Returns by Channel</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byChannel} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="channel" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="returns" radius={[4, 4, 0, 0]}>
                  {byChannel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Returns table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Returns Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Return ID','Order ID','Channel','Product','Size','Reason','Status','Refund','Restockable',''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(ret => {
                  const ch   = CHANNELS.find(c => c.id === ret.channelId)!;
                  const sku  = SKUS.find(s => s.id === ret.skuId)!;
                  const prod = PRODUCTS.find(p => p.id === sku?.productId)!;
                  return (
                    <tr key={ret.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono font-semibold text-orange-600">{ret.id}</td>
                      <td className="px-4 py-2.5 font-mono text-violet-600">{ret.orderId}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: ch?.color }} />
                          {ch?.name.replace(' Instamart','')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">{prod?.shortName}</td>
                      <td className="px-4 py-2.5"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{sku?.size}</span></td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          style={{ background: `${REASON_COLORS[ret.reason]}15`, color: REASON_COLORS[ret.reason], borderColor: `${REASON_COLORS[ret.reason]}30` }}>
                          {REASON_LABELS[ret.reason]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={ret.status} /></td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">₹{ret.refundAmount}</td>
                      <td className="px-4 py-2.5">
                        {ret.restockable
                          ? <span className="text-emerald-600 font-semibold">Yes</span>
                          : <span className="text-red-500 font-semibold">No</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setModal({ kind: 'update', returnId: ret.id, currentStatus: ret.status })}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors" title="Update status">
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

        {/* SOP */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2">Returns SOP</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-700">
            {[
              { title: 'Defect / Damage',          body: 'Immediate refund. Item NOT restocked. Flag to QC with batch ID. Log in defect tracker.' },
              { title: 'Wrong Size / Changed Mind', body: 'Offer exchange first. If declined, refund. Restock after sanitization + inspection. 48hr SLA.' },
              { title: 'Delivery Damage',           body: 'Raise courier claim within 24hrs. Refund customer immediately. Recover cost from courier.' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="font-bold mb-1">{s.title}</p>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
