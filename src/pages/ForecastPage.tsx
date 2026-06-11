import { useState } from 'react';
import Header from '../components/Layout/Header';
import { DEMAND_FORECAST, COHORT_DATA, SIZE_DISTRIBUTION, CHANNELS, SKUS, VENDORS } from '../data/mockData';
import { useStore } from '../store';
import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Cell
} from 'recharts';
import { TrendingUp, Users, RefreshCw, Target, AlertTriangle, Package, Calendar, Cpu, CheckCircle2 } from 'lucide-react';

const GROWTH_SCENARIOS = [
  { label: 'Conservative (1.5x)', multiplier: 1.5, color: '#94a3b8' },
  { label: 'Base Case (2x)',      multiplier: 2.0, color: '#6366f1' },
  { label: 'Aggressive (3x)',     multiplier: 3.0, color: '#10b981' },
];

// ─── Inventory Planning Engine ────────────────────────────────────────────────
// Service level z-scores: 90%=1.28, 95%=1.65, 99%=2.33
const Z_SCORES: Record<string, number> = { '90%': 1.28, '95%': 1.65, '99%': 2.33 };

interface PlanningRow {
  skuId:       string;
  totalStock:  number;
  weeklyDemand:number;
  safetyStock: number;
  rop:         number;
  reorderQty:  number;
  daysOfStock: number;
  riskLevel:   'ok' | 'watch' | 'critical';
  action:      string;
}

function computePlan(inventory: import('../types').InventoryItem[], weeklyForecast: number, serviceLevel: string, leadTimeDays: number): PlanningRow[] {
  const z = Z_SCORES[serviceLevel] ?? 1.65;
  const demandStdDev  = weeklyForecast * 0.15; // assume 15% demand variability

  return SKUS.map(sku => {
    const totalStock = inventory.filter(i => i.skuId === sku.id).reduce((s, i) => s + i.stock, 0);
    const sizePct = SIZE_DISTRIBUTION.find(d => d.size === sku.size)?.pct ?? 5;
    const skuWeeklyDemand = Math.round(weeklyForecast * (sizePct / 100));
    const skuDailyDemand  = skuWeeklyDemand / 7;

    const safetyStock = Math.round(z * demandStdDev * Math.sqrt(leadTimeDays / 7) * (sizePct / 100));
    const rop         = Math.round(skuDailyDemand * leadTimeDays + safetyStock);
    const reorderQty  = Math.round(skuWeeklyDemand * 4); // 4-week EOQ
    const daysOfStock = skuDailyDemand > 0 ? Math.round(totalStock / skuDailyDemand) : 999;

    const riskLevel: PlanningRow['riskLevel'] =
      totalStock <= safetyStock    ? 'critical' :
      totalStock <= rop            ? 'watch'    : 'ok';

    const action =
      riskLevel === 'critical' ? `Order ${reorderQty} units URGENT` :
      riskLevel === 'watch'    ? `Order ${reorderQty} units (ROP hit)` :
      `OK — ${daysOfStock}d cover`;

    return { skuId: sku.id, totalStock, weeklyDemand: skuWeeklyDemand, safetyStock, rop, reorderQty, daysOfStock, riskLevel, action };
  }).filter(r => r.weeklyDemand > 0);
}

export default function ForecastPage() {
  const inventory    = useStore(s => s.inventory);
  const [scenario, setScenario] = useState(1);
  const [serviceLevel, setServiceLevel] = useState('95%');
  const [leadTimeDays, setLeadTimeDays] = useState(21);
  const [planFilter,   setPlanFilter]   = useState<'all' | 'critical' | 'watch'>('all');
  const multiplier = GROWTH_SCENARIOS[scenario].multiplier;

  const scenarioForecast = DEMAND_FORECAST.map(d => ({
    ...d,
    forecast: Math.round(d.forecast * (d.actual ? 1 : multiplier / 2)),
    upperBound: Math.round(d.upperBound * (d.actual ? 1 : multiplier / 2)),
    lowerBound: Math.round(d.lowerBound * (d.actual ? 1 : multiplier / 2)),
  }));

  const weeklyForecast = scenarioForecast.find(f => !f.actual)?.forecast ?? 4850;
  const planningRows = computePlan(inventory, weeklyForecast, serviceLevel, leadTimeDays);
  const filteredRows = planFilter === 'all' ? planningRows : planningRows.filter(r => r.riskLevel === planFilter);
  const criticalCount = planningRows.filter(r => r.riskLevel === 'critical').length;
  const watchCount    = planningRows.filter(r => r.riskLevel === 'watch').length;

  // Replenishment schedule: sum reorderQty for at-risk SKUs by week
  const replenishmentSchedule = [
    { week: 'Week 1', urgent: planningRows.filter(r => r.riskLevel === 'critical').reduce((s, r) => s + r.reorderQty, 0), planned: planningRows.filter(r => r.riskLevel === 'watch').reduce((s, r) => s + r.reorderQty, 0) },
    { week: 'Week 2', urgent: 0, planned: Math.round(weeklyForecast * 1.1) },
    { week: 'Week 3', urgent: 0, planned: Math.round(weeklyForecast * 1.0) },
    { week: 'Week 4', urgent: 0, planned: Math.round(weeklyForecast * 1.2) },
  ];

  // Supplier lead times for context
  const suppliers = VENDORS.filter(v => v.type === 'fabric' || v.type === 'manufacturer');

  // SKU-level demand projection
  const skuForecast = SIZE_DISTRIBUTION.map(s => ({
    size: s.size,
    weekly: Math.round((scenarioForecast.find(f => !f.actual)?.forecast ?? 4850) * s.pct / 100),
    monthly: Math.round((scenarioForecast.find(f => !f.actual)?.forecast ?? 4850) * s.pct / 100 * 4.3),
  }));

  // Channel demand split
  const channelForecast = CHANNELS.map(ch => {
    const weights: Record<string, number> = { amazon: 32, flipkart: 28, website: 18, myntra: 9, meesho: 7, swiggy: 3, zepto: 3 };
    const base = (scenarioForecast.find(f => !f.actual)?.forecast ?? 4850);
    return {
      name: ch.name.replace(' Instamart', ''),
      demand: Math.round(base * 4.3 * (weights[ch.id] ?? 0) / 100),
      color: ch.color,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Demand Forecasting" subtitle="28-day cycle modeling · SKU-level projections · Growth scenario planning" />
      <div className="p-6 space-y-5">

        {/* Scenario selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Target size={15} className="text-violet-600" />
            Growth Scenario Planner
          </h2>
          <div className="flex gap-3">
            {GROWTH_SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => setScenario(i)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  scenario === i
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.multiplier}x</div>
                <div className="text-xs mt-0.5">{s.label.split('(')[0]}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-violet-700">
            <strong>Scenario:</strong> {GROWTH_SCENARIOS[scenario].label} — Projected monthly demand reaches{' '}
            <strong>{Math.round((scenarioForecast.find(f => !f.actual)?.forecast ?? 4850) * 4.3 * multiplier / 2).toLocaleString()} units</strong> by Q3 2026.
            Based on 28-day repurchase cycle modeling from 6L existing customers + projected new acquisition.
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Next Week Forecast', value: (scenarioForecast.find(f => !f.actual)?.forecast ?? 0).toLocaleString(), suffix: 'units', icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
            { label: 'Next Month Forecast', value: Math.round((scenarioForecast.find(f => !f.actual)?.forecast ?? 0) * 4.3).toLocaleString(), suffix: 'units', icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
            { label: 'Avg Repeat Rate (90d)', value: '35%', suffix: '', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Repurchase Cycle', value: '28', suffix: 'days', icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}>
                <t.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t.label}</p>
                <p className="text-xl font-bold text-slate-900">{t.value} <span className="text-xs font-normal text-slate-500">{t.suffix}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Demand forecast chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Weekly Demand Forecast (Actuals + Projection)</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Shaded = confidence interval</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={scenarioForecast} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="upperBound" fill="url(#confGrad)" stroke="none" name="Upper Bound" />
              <Area type="monotone" dataKey="lowerBound" fill="#ffffff" stroke="none" name="Lower Bound" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* SKU projection + Channel demand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SKU-level projections */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">SKU Demand Projection (Next Month)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 font-semibold text-slate-500">Size</th>
                    <th className="text-right py-2 font-semibold text-slate-500">Weekly Demand</th>
                    <th className="text-right py-2 font-semibold text-slate-500">Monthly Demand</th>
                    <th className="text-right py-2 font-semibold text-slate-500">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {skuForecast.map(s => (
                    <tr key={s.size} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5">
                        <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-bold">{s.size}</span>
                      </td>
                      <td className="py-2.5 text-right text-slate-700">{s.weekly.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">{s.monthly.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-slate-500">{SIZE_DISTRIBUTION.find(d => d.size === s.size)?.pct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Channel demand forecast */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Channel Demand (Next Month)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelForecast} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                  {channelForecast.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort analysis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={14} className="text-blue-600" />
            Customer Cohort Analysis (Repeat Purchase Rates)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2.5 font-semibold text-slate-500">Acquisition Cohort</th>
                  <th className="text-right py-2.5 font-semibold text-slate-500">New Customers</th>
                  <th className="text-right py-2.5 font-semibold text-slate-500">30-day Repeat %</th>
                  <th className="text-right py-2.5 font-semibold text-slate-500">60-day Repeat %</th>
                  <th className="text-right py-2.5 font-semibold text-slate-500">90-day Repeat %</th>
                </tr>
              </thead>
              <tbody>
                {COHORT_DATA.map(c => (
                  <tr key={c.cohort} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 font-medium text-slate-800">{c.cohort}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">{c.newCustomers.toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      {c.repeatRate30 > 0 ? (
                        <span className="text-blue-600 font-semibold">{c.repeatRate30}%</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {c.repeatRate60 > 0 ? (
                        <span className="text-emerald-600 font-semibold">{c.repeatRate60}%</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {c.repeatRate90 > 0 ? (
                        <span className="text-violet-600 font-semibold">{c.repeatRate90}%</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            * Period panties have ~28-day natural repurchase cycle. 90-day repeat rates track customers who re-purchase across multiple cycles.
          </p>
        </div>

        {/* ── Inventory Planning Engine ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={16} className="text-violet-600" />
            <h2 className="text-sm font-bold text-violet-900">Inventory Planning Engine</h2>
            <span className="text-xs text-violet-500 bg-white/60 px-2 py-0.5 rounded-full border border-violet-200">AI-assisted · Safety stock · ROP · Replenishment</span>
          </div>
          <p className="text-xs text-violet-600 ml-6 mb-4">Adjust parameters to recalculate safety stock, reorder points, and replenishment recommendations for all SKUs.</p>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/70 rounded-xl p-4 border border-violet-100 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Service Level</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                value={serviceLevel}
                onChange={e => setServiceLevel(e.target.value)}
              >
                <option value="90%">90% — Low Risk Tolerance</option>
                <option value="95%">95% — Balanced (Recommended)</option>
                <option value="99%">99% — Zero Stockout Policy</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-0.5">Higher = more safety stock buffer</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier Lead Time: <strong className="text-violet-700">{leadTimeDays} days</strong></label>
              <input
                type="range" min={7} max={45} step={1}
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>7d (fast)</span>
                <span>45d (slow)</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold text-slate-600">Current Supplier Lead Times:</p>
              {suppliers.slice(0, 3).map(s => (
                <div key={s.id} className="flex justify-between text-slate-500">
                  <span className="truncate">{s.name}</span>
                  <span className="font-semibold">{s.leadTimeDays}d</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Critical — Order Now', value: criticalCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
              { label: 'Watch — ROP Reached', value: watchCount, icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              { label: 'SKUs OK', value: planningRows.filter(r => r.riskLevel === 'ok').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Units to Order (Urgent)', value: planningRows.filter(r => r.riskLevel === 'critical').reduce((s, r) => s + r.reorderQty, 0).toLocaleString(), icon: Calendar, color: 'text-violet-600 bg-violet-50 border-violet-200' },
            ].map(t => (
              <div key={t.label} className={`rounded-xl border p-3 flex items-center gap-2 ${t.color.split(' ').slice(1).join(' ')}`}>
                <t.icon size={16} className={t.color.split(' ')[0]} />
                <div>
                  <p className="text-[10px] text-slate-500">{t.label}</p>
                  <p className={`text-lg font-bold ${t.color.split(' ')[0]}`}>{t.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Replenishment schedule */}
          <div className="bg-white/80 rounded-xl border border-violet-100 p-4 mb-4">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Calendar size={12} className="text-violet-600" /> 4-Week Replenishment Schedule
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={replenishmentSchedule} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="urgent"  name="Urgent Order" fill="#ef4444" radius={[3,3,0,0]} />
                <Bar dataKey="planned" name="Planned Order" fill="#6366f1" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SKU table */}
          <div className="bg-white/80 rounded-xl border border-violet-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700">SKU-Level Planning Table</h3>
              <div className="flex gap-1.5">
                {(['all', 'critical', 'watch'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPlanFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border capitalize ${
                      planFilter === f
                        ? f === 'critical' ? 'bg-red-500 text-white border-red-500'
                        : f === 'watch'   ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {f}{f !== 'all' && ` (${f === 'critical' ? criticalCount : watchCount})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    {['SKU', 'Total Stock', 'Weekly Demand', 'Safety Stock', 'ROP', 'Reorder Qty', 'Days Cover', 'Action'].map(h => (
                      <th key={h} className="text-left px-2 py-2 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(r => (
                    <tr key={r.skuId} className={`border-t border-slate-100 ${
                      r.riskLevel === 'critical' ? 'bg-red-50/40' :
                      r.riskLevel === 'watch'    ? 'bg-amber-50/40' : ''
                    }`}>
                      <td className="px-2 py-1.5 font-semibold text-slate-800">{r.skuId}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.totalStock}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.weeklyDemand}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.safetyStock}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.rop}</td>
                      <td className="px-2 py-1.5 text-violet-700 font-semibold">{r.reorderQty}</td>
                      <td className="px-2 py-1.5">
                        <span className={`font-bold ${r.daysOfStock < 14 ? 'text-red-600' : r.daysOfStock < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {r.daysOfStock > 300 ? '∞' : `${r.daysOfStock}d`}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`font-semibold ${
                          r.riskLevel === 'critical' ? 'text-red-600' :
                          r.riskLevel === 'watch'    ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{r.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
