import Header from '../components/Layout/Header';
import { COURIERS, CHANNELS } from '../data/mockData';
import { useStore } from '../store';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Truck, Clock, AlertTriangle, TrendingUp, Package } from 'lucide-react';

export default function LogisticsPage() {
  const ORDERS = useStore(s => s.orders);
  const totalShipments = COURIERS.reduce((s, c) => s + c.shipmentsThisMonth, 0);
  const avgTransit = (COURIERS.reduce((s, c) => s + c.transitDays * c.shipmentsThisMonth, 0) / totalShipments).toFixed(1);
  const avgNdr = (COURIERS.reduce((s, c) => s + c.ndrRate * c.shipmentsThisMonth, 0) / totalShipments).toFixed(1);
  const avgCost = (COURIERS.reduce((s, c) => s + c.costPerShipment * c.shipmentsThisMonth, 0) / totalShipments).toFixed(0);

  const channelFulfillment = CHANNELS.map(ch => {
    const chOrders = ORDERS.filter(o => o.channelId === ch.id);
    const delivered = chOrders.filter(o => o.status === 'delivered').length;
    const total = chOrders.length;
    return {
      name: ch.name.replace(' Instamart', ''),
      fulfillmentRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
      slaHours: ch.slaHours,
      color: ch.color,
    };
  });

  // Cost vs performance scatter
  const scatterData = COURIERS.map(c => ({
    name: c.name,
    cost: c.costPerShipment,
    onTime: c.onTimeDelivery,
    volume: c.shipmentsThisMonth,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Logistics & Fulfillment" subtitle="Courier performance · NDR tracking · SLA adherence · Channel fulfillment" />
      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Shipments (MTD)', value: totalShipments.toLocaleString(), icon: Package, color: 'text-violet-600 bg-violet-50' },
            { label: 'Avg Transit Days', value: `${avgTransit}d`, icon: Clock, color: 'text-blue-600 bg-blue-50' },
            { label: 'Avg NDR Rate', value: `${avgNdr}%`, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
            { label: 'Avg Cost/Shipment', value: `₹${avgCost}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
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

        {/* Courier scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURIERS.map(c => {
            const perfScore = ((c.onTimeDelivery / 100) * 0.4 + (1 - c.ndrRate / 20) * 0.3 + (1 - c.damageClaims / 30) * 0.3) * 100;
            const perfColor = perfScore >= 80 ? 'text-emerald-600' : perfScore >= 65 ? 'text-amber-600' : 'text-red-500';
            return (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Truck size={16} className="text-slate-600" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                  </div>
                  <span className={`text-lg font-bold ${perfColor}`}>{perfScore.toFixed(0)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className={`text-base font-bold ${c.onTimeDelivery >= 90 ? 'text-emerald-600' : c.onTimeDelivery >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
                      {c.onTimeDelivery}%
                    </p>
                    <p className="text-[9px] text-slate-400">On-Time</p>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${c.ndrRate <= 6 ? 'text-emerald-600' : c.ndrRate <= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                      {c.ndrRate}%
                    </p>
                    <p className="text-[9px] text-slate-400">NDR Rate</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-700">{c.transitDays}d</p>
                    <p className="text-[9px] text-slate-400">Transit</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cost/Shipment</span>
                    <span className="font-semibold text-slate-800">₹{c.costPerShipment}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipments MTD</span>
                    <span className="font-semibold text-slate-800">{c.shipmentsThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Damage Claims</span>
                    <span className={`font-semibold ${c.damageClaims <= 8 ? 'text-emerald-600' : c.damageClaims <= 16 ? 'text-amber-600' : 'text-red-500'}`}>
                      {c.damageClaims}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>COD Remittance</span>
                    <span className="font-semibold text-slate-800">{c.codRemittanceDays}d</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {c.zones.map(z => (
                      <span key={z} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">{z}</span>
                    ))}
                  </div>
                </div>

                {/* Performance bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                    <span>Perf Score</span>
                    <span>{perfScore.toFixed(0)}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${perfScore >= 80 ? 'bg-emerald-500' : perfScore >= 65 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${perfScore}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Channel fulfillment rate */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Fulfillment Rate by Channel</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelFulfillment} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: unknown) => [`${v}%`, 'Fulfillment Rate']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="fulfillmentRate" radius={[4, 4, 0, 0]}>
                  {channelFulfillment.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Courier: Cost vs On-Time %</h2>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="cost" name="Cost/Shipment" unit="₹" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Cost/Shipment (₹)', position: 'bottom', fontSize: 10, fill: '#94a3b8', offset: -2 }} />
                <YAxis dataKey="onTime" name="On-Time %" unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <ZAxis dataKey="volume" range={[60, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs shadow">
                        <p className="font-bold text-slate-800">{d.name}</p>
                        <p className="text-slate-600">Cost: ₹{d.cost}</p>
                        <p className="text-slate-600">On-Time: {d.onTime}%</p>
                        <p className="text-slate-600">Volume: {d.volume.toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Channel SLA Requirements</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Channel','Fulfillment SLA','Avg Delivery','SLA Status','Recommended Courier(s)'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHANNELS.map(ch => {
                  const slaOk = ch.avgDeliveryDays * 24 <= ch.slaHours;
                  const reco = ch.id === 'amazon' || ch.id === 'flipkart'
                    ? 'Delhivery, BlueDart'
                    : ch.id === 'swiggy' || ch.id === 'zepto'
                    ? 'Partner Fleet'
                    : ch.id === 'meesho'
                    ? 'Ecom Express, Delhivery'
                    : 'BlueDart, Delhivery';
                  return (
                    <tr key={ch.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2 font-medium text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: ch.color }} />
                          {ch.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">{ch.slaHours < 24 ? `${ch.slaHours}h` : `${ch.slaHours / 24}d`}</td>
                      <td className="px-4 py-2.5 text-slate-700">{ch.avgDeliveryDays === 0 ? '<2h' : `${ch.avgDeliveryDays}d`}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${slaOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {slaOk ? 'Within SLA' : 'SLA Risk'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{reco}</td>
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
