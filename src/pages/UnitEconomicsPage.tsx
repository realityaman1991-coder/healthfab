import { useState } from 'react';
import Header from '../components/Layout/Header';
import { CHANNEL_ECONOMICS, CHANNELS, PRODUCTS } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function UnitEconomicsPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>('gpf-heavy');
  const product = PRODUCTS.find(p => p.id === selectedProduct)!;

  // Stacked bar data
  const stackedData = CHANNEL_ECONOMICS.map(e => {
    const ch = CHANNELS.find(c => c.id === e.channelId)!;
    return {
      channel: ch.name.replace(' Instamart',''),
      cogs: e.cogs,
      fees: e.marketplaceFee,
      logistics: e.logisticsCost,
      packaging: e.packagingCost,
      payments: e.paymentGatewayCost,
      returns: e.returnsCost,
      margin: e.contributionMargin,
      marginPct: e.contributionMarginPct,
      color: ch.color,
    };
  });

  // Radar comparison
  const radarData = [
    { metric: 'Margin %', website: 62.9, amazon: 47.3, flipkart: 50.4, meesho: 55.0 },
    { metric: 'AOV',      website: 94, amazon: 90, flipkart: 90, meesho: 75 },
    { metric: 'Volume',   website: 18, amazon: 32, flipkart: 28, meesho: 7 },
    { metric: 'Returns',  website: 3.2, amazon: 5.1, flipkart: 4.8, meesho: 3.8 },
    { metric: 'Speed',    website: 70, amazon: 95, flipkart: 90, meesho: 60 },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Unit Economics" subtitle="Contribution margin · Channel P&L · Cost waterfall · Channel comparison" />
      <div className="p-6 space-y-5">

        {/* Product selector */}
        <div className="flex gap-2">
          {PRODUCTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                selectedProduct === p.id
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Product economics */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg">{product.name}</h2>
              <p className="text-violet-200 text-sm mt-1">{product.absorbency}</p>
            </div>
            <div className="text-right">
              <p className="text-violet-200 text-xs">MRP</p>
              <p className="text-2xl font-bold">₹{product.mrp}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-violet-200 text-xs">COGS</p>
              <p className="font-bold text-lg">₹{product.costOfGoods}</p>
              <p className="text-violet-300 text-xs">{((product.costOfGoods / product.mrp) * 100).toFixed(1)}% of MRP</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-violet-200 text-xs">Best Channel Margin</p>
              <p className="font-bold text-lg">{CHANNEL_ECONOMICS.reduce((max, e) => Math.max(max, e.contributionMarginPct), 0).toFixed(1)}%</p>
              <p className="text-violet-300 text-xs">Website (D2C)</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-violet-200 text-xs">Worst Channel Margin</p>
              <p className="font-bold text-lg">{CHANNEL_ECONOMICS.reduce((min, e) => Math.min(min, e.contributionMarginPct), Infinity).toFixed(1)}%</p>
              <p className="text-violet-300 text-xs">Myntra</p>
            </div>
          </div>
        </div>

        {/* Channel comparison table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={14} className="text-violet-600" />
            Channel-wise Contribution Margin Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Channel</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500">Avg Order Value</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-red-500">COGS</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-amber-500">Mktpl Fee</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-cyan-600">Logistics</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-violet-500">Packaging</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-emerald-600">PG Cost</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-orange-500">Returns</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-700">Contribution ₹</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-700">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {CHANNEL_ECONOMICS.map(e => {
                  const ch = CHANNELS.find(c => c.id === e.channelId)!;
                  const isTop = e.channelId === 'website';
                  return (
                    <tr key={e.channelId} className={`border-b border-slate-50 ${isTop ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'} transition-colors`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: ch.color }} />
                          <span className="font-semibold text-slate-800">{ch.name}</span>
                          {isTop && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">BEST</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">₹{e.avgOrderValue}</td>
                      <td className="px-3 py-2.5 text-right text-red-600">−₹{e.cogs}</td>
                      <td className="px-3 py-2.5 text-right text-amber-600">{e.marketplaceFee > 0 ? `−₹${e.marketplaceFee}` : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-cyan-700">{e.logisticsCost > 0 ? `−₹${e.logisticsCost}` : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-violet-600">{e.packagingCost > 0 ? `−₹${e.packagingCost}` : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-700">{e.paymentGatewayCost > 0 ? `−₹${e.paymentGatewayCost}` : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-orange-600">−₹{e.returnsCost}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">₹{e.contributionMargin}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-bold text-sm ${e.contributionMarginPct >= 55 ? 'text-emerald-600' : e.contributionMarginPct >= 45 ? 'text-amber-600' : 'text-red-500'}`}>
                          {e.contributionMarginPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stacked cost + margin bar + Waterfall */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Contribution margin comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Margin % by Channel</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stackedData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="channel" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Contribution Margin']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="marginPct" radius={[4, 4, 0, 0]}>
                  {stackedData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insights panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-violet-600" />
              Strategic Insights
            </h2>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', insight: 'Website D2C yields highest margin at 62.9% — every ₹1 Cr shift from marketplaces to website adds ~₹15L in contribution margin.' },
                { icon: Info, color: 'text-blue-600 bg-blue-50', insight: 'Amazon drives 32% of volume but only 47.3% margin. Optimizing returns (currently 5.1%) could add ₹4-5 margin points.' },
                { icon: TrendingDown, color: 'text-red-500 bg-red-50', insight: 'Myntra has the lowest margin (43.1%) due to high 20% commission + 6.1% return rate. Review GMV vs profitability tradeoff.' },
                { icon: Info, color: 'text-amber-600 bg-amber-50', insight: 'Quick Commerce (Swiggy/Zepto) shows 50.7-51% margin — good for impulse/need-now purchases with near-zero returns (1.3%).' },
                { icon: TrendingUp, color: 'text-violet-600 bg-violet-50', insight: 'Meesho at 55% margin with lower AOV (₹749) but good volume — consider bundle pricing to increase AOV.' },
              ].map((ins, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-lg ${ins.color.split(' ')[1]} border border-opacity-20`}>
                  <ins.icon size={14} className={`${ins.color.split(' ')[0]} flex-shrink-0 mt-0.5`} />
                  <p className="text-xs text-slate-700">{ins.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel radar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Channel Performance Radar (Top 4 Channels)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Radar name="Website" dataKey="website" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
              <Radar name="Amazon" dataKey="amazon" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              <Radar name="Flipkart" dataKey="flipkart" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Radar name="Meesho" dataKey="meesho" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
