import Header from '../components/Layout/Header';
import {
  MONTHLY_REVENUE, CHANNEL_ECONOMICS, CHANNELS, COURIERS,
  PRODUCTION_BATCHES, formatCurrency
} from '../data/mockData';
import { useStore } from '../store';
import {
  AreaChart, Area, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart3, Download, TrendingUp, DollarSign, Package, Truck } from 'lucide-react';

const REPORTS = [
  { id: 'revenue',       label: 'Revenue & Orders',        icon: TrendingUp,  color: 'text-violet-600 bg-violet-50' },
  { id: 'uniteconomics', label: 'Channel P&L Summary',     icon: DollarSign,  color: 'text-emerald-600 bg-emerald-50' },
  { id: 'operations',    label: 'Operations Health',        icon: Package,     color: 'text-blue-600 bg-blue-50' },
  { id: 'logistics',     label: 'Logistics Performance',    icon: Truck,       color: 'text-amber-600 bg-amber-50' },
];

// Prepare data
const revenueGrowth = MONTHLY_REVENUE.map((m, i) => ({
  ...m,
  growth: i === 0 ? 0 : Math.round(((m.revenue - MONTHLY_REVENUE[i - 1].revenue) / MONTHLY_REVENUE[i - 1].revenue) * 100),
}));

const channelPnL = CHANNEL_ECONOMICS.map(e => {
  const ch = CHANNELS.find(c => c.id === e.channelId)!;
  const volume = [32, 28, 18, 9, 3, 3, 7][CHANNELS.indexOf(ch)];
  const grossProfit = e.contributionMargin * (volume / 100) * 18420;
  return {
    channel: ch.name.replace(' Instamart', ''),
    margin: e.contributionMarginPct,
    grossProfit: Math.round(grossProfit / 100000),
    color: ch.color,
  };
});

const opsHealth = [
  { metric: 'Fulfillment Rate', value: 94.2, target: 95, unit: '%' },
  { metric: 'Return Rate',      value: 4.1,  target: 3,  unit: '%', inverse: true },
  { metric: 'QC Pass Rate',     value: 97.2, target: 97, unit: '%' },
  { metric: 'OTD Supplier',     value: 91,   target: 92, unit: '%' },
  { metric: 'Inventory Turn',   value: 8.4,  target: 10, unit: 'x' },
  { metric: 'NDR Rate',         value: 7.6,  target: 6,  unit: '%', inverse: true },
];

export default function ReportsPage() {
  const batches = useStore(s => s.productionBatches);
  void batches; // used in production output section if needed
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Reports & Analytics" subtitle="Executive summary · P&L · Operations health · Downloadable insights" />
      <div className="p-6 space-y-5">

        {/* Report types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REPORTS.map(r => (
            <button key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.color}`}>
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">{r.label}</p>
              </div>
              <Download size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg">Executive Ops Report — Jun 2026</h2>
              <p className="text-slate-400 text-sm">HealthFab Series A · Monthly Snapshot</p>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-emerald-400 text-sm font-semibold">
              3x Target: ON TRACK
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Revenue',    value: '₹1.84 Cr', change: '+18.2%' },
              { label: 'Orders',     value: '18,420',   change: '+14.5%' },
              { label: 'Customers',  value: '15,800',   change: '+19.7%' },
              { label: 'Margin',     value: '52.3%',    change: '+2.1pp' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-lg p-3">
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
                <p className="text-emerald-400 text-xs font-semibold">{s.change} MoM</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue + Growth rate */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Revenue Trend & MoM Growth Rate</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block border-dashed" /> Growth %</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueGrowth} margin={{ top: 4, right: 40, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : `${Number(value)}%`,
                  name === 'revenue' ? 'Revenue' : 'MoM Growth'
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel P&L + Orders by channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Channel gross profit */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Channel Gross Profit (₹L) MTD</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelPnL} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${v}L`} />
                <YAxis type="category" dataKey="channel" tick={{ fontSize: 10, fill: '#94a3b8' }} width={72} />
                <Tooltip formatter={(v: unknown) => [`₹${v}L`, 'Gross Profit']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="grossProfit" radius={[0, 4, 4, 0]}>
                  {channelPnL.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New customers trend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">New Customer Acquisition Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: unknown) => [Number(v).toLocaleString(), 'New Customers']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="newCustomers" stroke="#10b981" strokeWidth={2.5} fill="url(#custGrad)" dot={{ fill: '#10b981', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations Health Scorecard */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-violet-600" />
            Operations Health Scorecard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opsHealth.map(m => {
              const isInverse = m.inverse;
              const isGood = isInverse ? m.value <= m.target : m.value >= m.target;
              return (
                <div key={m.metric} className={`rounded-xl border p-4 ${isGood ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700">{m.metric}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isGood ? 'TARGET MET' : 'BELOW TARGET'}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className={`text-2xl font-bold ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.value}{m.unit}
                    </p>
                    <p className="text-xs text-slate-400 mb-0.5">target: {m.target}{m.unit}</p>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (m.value / m.target) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logistics & Manufacturing summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Courier Performance Summary</h2>
            <div className="space-y-2">
              {COURIERS.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-700 w-24 font-medium truncate">{c.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${c.onTimeDelivery}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 w-10 text-right">{c.onTimeDelivery}%</span>
                  <span className={`text-xs font-semibold w-12 text-right ${c.ndrRate <= 6 ? 'text-emerald-600' : c.ndrRate <= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                    NDR: {c.ndrRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Production Output Summary</h2>
            <div className="space-y-2">
              {PRODUCTION_BATCHES.filter(b => b.status === 'completed').map(b => {
                const prod = b.productId === 'gpf-heavy' ? 'GPF Heavy' : 'GPF Ultra';
                return (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-700 w-28 font-medium">{prod} – {b.sizeId}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-violet-500" style={{ width: `${(b.qcPassRate ?? 95)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 w-12 text-right">QC: {b.qcPassRate}%</span>
                    <span className="text-xs text-slate-500 w-12 text-right">{b.actualQty} units</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
