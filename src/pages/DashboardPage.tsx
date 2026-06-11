import Header from '../components/Layout/Header';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DASHBOARD_KPIS, MONTHLY_REVENUE, CHANNEL_REVENUE_SPLIT,
  SIZE_DISTRIBUTION, CHANNELS, formatCurrency, STATE_ORDERS
} from '../data/mockData';
import { useStore } from '../store';
import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

const ALERTS = [
  { level: 'critical', msg: 'GPF Heavy – 3XL below reorder point on Amazon (stock: 65)', sku: 'gpf-heavy-3XL' },
  { level: 'warning',  msg: 'GPF Ultra – M running low on Zepto (stock: 32)', sku: 'gpf-ultra-M' },
  { level: 'warning',  msg: 'PO-2026-043 expected delivery today — not yet received', sku: '' },
  { level: 'info',     msg: 'Myntra returns spike: +22% vs last week', sku: '' },
];

export default function DashboardPage() {
  const ORDERS = useStore(s => s.orders);
  const recentOrders = ORDERS.slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header
        title="Command Center"
        subtitle="HealthFab Operations · Real-time overview · Jun 2026"
      />
      <div className="p-6 space-y-6">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DASHBOARD_KPIS.map(kpi => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              Active Alerts
            </h2>
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
              {ALERTS.length} alerts
            </span>
          </div>
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${
                a.level === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                a.level === 'warning'  ? 'bg-amber-50 border-amber-200 text-amber-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  a.level === 'critical' ? 'bg-red-500' :
                  a.level === 'warning'  ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                {a.msg}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend + Channel Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue trend */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Revenue Trend (Monthly)</h2>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <TrendingUp size={12} /> 3x target on track
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(v: unknown) => [formatCurrency(Number(v)), 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#6366f1', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Channel split pie */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Channel Revenue Split</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={CHANNEL_REVENUE_SPLIT} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {CHANNEL_REVENUE_SPLIT.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {CHANNEL_REVENUE_SPLIT.map(c => (
                <div key={c.channel} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-600">{c.channel}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by channel + Size distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orders per channel bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Orders by Channel (MTD)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={CHANNELS.map(ch => ({
                  name: ch.name.replace(' Instamart',''),
                  orders: ORDERS.filter(o => o.channelId === ch.id).length * 30,
                  color: ch.color,
                }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {CHANNELS.map(ch => (
                    <Cell key={ch.id} fill={ch.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Size distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Size Distribution (All Channels)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SIZE_DISTRIBUTION} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: unknown) => [`${v}%`, 'Share']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top States + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top states */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Top States by Orders (MTD)</h2>
            <div className="space-y-2.5">
              {STATE_ORDERS.slice(0, 8).map((s, i) => {
                const maxOrders = STATE_ORDERS[0].orders;
                const pct = (s.orders / maxOrders) * 100;
                return (
                  <div key={s.state} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                    <span className="text-xs text-slate-700 w-24 font-medium">{s.state}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-14 text-right">{s.orders.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Recent Orders</h2>
              <a href="/orders" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 font-medium">
                View all <ArrowRight size={11} />
              </a>
            </div>
            <div className="space-y-2">
              {recentOrders.map(order => {
                const ch = CHANNELS.find(c => c.id === order.channelId)!;
                return (
                  <div key={order.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ch.color }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{order.id}</p>
                        <p className="text-[10px] text-slate-400">{ch.name} · {order.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-800">₹{order.amount}</span>
                      <StatusBadge status={order.status} />
                    </div>
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
