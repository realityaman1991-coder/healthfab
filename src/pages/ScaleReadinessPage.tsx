import { useState } from 'react';
import Header from '../components/Layout/Header';
import { useStore } from '../store';
import {
  Factory, Truck, Cpu, Users, DollarSign, Target, CheckCircle2,
  AlertTriangle, Clock, TrendingUp, Plus, Pencil, ChevronDown, ChevronUp,
  Zap, BarChart3,
} from 'lucide-react';
import type { ReadinessPillar, ActionPriority, ActionStatus, ActionItem } from '../types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

// ─── Pillar config ─────────────────────────────────────────────────────────────
const PILLAR_CFG: Record<ReadinessPillar, { label: string; icon: typeof Factory; color: string; bg: string; ring: string }> = {
  manufacturing: { label: 'Manufacturing', icon: Factory,    color: 'text-orange-700', bg: 'bg-orange-50',  ring: 'ring-orange-200' },
  logistics:     { label: 'Logistics',     icon: Truck,      color: 'text-blue-700',   bg: 'bg-blue-50',    ring: 'ring-blue-200'   },
  technology:    { label: 'Technology',    icon: Cpu,        color: 'text-violet-700', bg: 'bg-violet-50',  ring: 'ring-violet-200' },
  team:          { label: 'Team',          icon: Users,      color: 'text-emerald-700',bg: 'bg-emerald-50', ring: 'ring-emerald-200'},
  finance:       { label: 'Finance',       icon: DollarSign, color: 'text-pink-700',   bg: 'bg-pink-50',    ring: 'ring-pink-200'   },
};

const PRIORITY_CFG: Record<ActionPriority, { label: string; color: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200',    dot: 'bg-red-500'    },
  high:     { label: 'High',     color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  medium:   { label: 'Medium',   color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-500'   },
  low:      { label: 'Low',      color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
};

const STATUS_CFG: Record<ActionStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'text-slate-500 bg-slate-50 border-slate-200' },
  in_progress: { label: 'In Progress', color: 'text-blue-700 bg-blue-50 border-blue-200'    },
  completed:   { label: 'Completed',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  blocked:     { label: 'Blocked',     color: 'text-red-700 bg-red-50 border-red-200'        },
};

// ─── Add Action Item Modal ─────────────────────────────────────────────────────
function AddActionModal({ onClose }: { onClose: () => void }) {
  const addActionItem = useStore(s => s.addActionItem);
  const actionItems   = useStore(s => s.actionItems);
  const [pillar,   setPillar]   = useState<ReadinessPillar>('manufacturing');
  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [owner,    setOwner]    = useState('');
  const [dueDate,  setDueDate]  = useState('');
  const [priority, setPriority] = useState<ActionPriority>('high');
  const [linked,   setLinked]   = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addActionItem({
      id:               `a-${String(actionItems.length + 1).padStart(3, '0')}`,
      pillar, title, description: desc, owner, dueDate,
      priority, status: 'not_started', linkedTo3xTarget: linked,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Add Action Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. Hire Logistics Manager" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pillar</label>
              <select className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" value={pillar} onChange={e => setPillar(e.target.value as ReadinessPillar)}>
                {(Object.keys(PILLAR_CFG) as ReadinessPillar[]).map(p => (
                  <option key={p} value={p}>{PILLAR_CFG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" value={priority} onChange={e => setPriority(e.target.value as ActionPriority)}>
                {(Object.keys(PRIORITY_CFG) as ActionPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Owner</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. Ops Head" value={owner} onChange={e => setOwner(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none h-16" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={linked} onChange={e => setLinked(e.target.checked)} className="rounded" />
            <span className="text-xs text-slate-600">Linked to 3x Revenue Target</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Add Action</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ScaleReadinessPage() {
  const readinessItems  = useStore(s => s.readinessItems);
  const actionItems     = useStore(s => s.actionItems);
  const updateActionItem = useStore(s => s.updateActionItem);
  const [showAdd,       setShowAdd]       = useState(false);
  const [expandPillar,  setExpandPillar]  = useState<ReadinessPillar | null>('manufacturing');
  const [filterPillar,  setFilterPillar]  = useState<ReadinessPillar | 'all'>('all');
  const [filterStatus,  setFilterStatus]  = useState<ActionStatus | 'all'>('all');

  // Compute per-pillar readiness score (avg current/target %)
  const pillars = Object.keys(PILLAR_CFG) as ReadinessPillar[];

  const pillarScores = pillars.map(p => {
    const items = readinessItems.filter(r => r.pillar === p);
    if (!items.length) return { pillar: p, score: 0, label: PILLAR_CFG[p].label };
    // Normalise: score = avg(min(current/target, 1)) * 100
    const score = Math.round(
      (items.reduce((sum, r) => sum + Math.min(r.current / r.target, 1), 0) / items.length) * 100
    );
    return { pillar: p, score, label: PILLAR_CFG[p].label };
  });

  const overallScore = Math.round(pillarScores.reduce((s, p) => s + p.score, 0) / pillars.length);

  // Action item stats
  const criticalOpen = actionItems.filter(a => a.priority === 'critical' && a.status !== 'completed').length;
  const completed    = actionItems.filter(a => a.status === 'completed').length;
  const linkedTo3x   = actionItems.filter(a => a.linkedTo3xTarget && a.status !== 'completed').length;

  const filteredActions = actionItems.filter(a => {
    const matchPillar = filterPillar === 'all' || a.pillar === filterPillar;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchPillar && matchStatus;
  });

  function cycleStatus(item: ActionItem) {
    const flow: Record<ActionStatus, ActionStatus> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed:   'not_started',
      blocked:     'not_started',
    };
    updateActionItem(item.id, { status: flow[item.status] });
  }

  // Radar chart data
  const radarData = pillarScores.map(p => ({
    subject: PILLAR_CFG[p.pillar].label,
    score:   p.score,
    target:  100,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Scale Readiness" subtitle="3x Revenue Target Tracker · Capacity planning · Action items · Readiness scorecard" />
      <div className="p-6 space-y-5">

        {/* Top summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-lg">3x Scale Readiness — Jun 2026</h2>
              <p className="text-slate-400 text-sm">Current: ₹1.84 Cr MRR → Target: ₹5.5 Cr MRR by Dec 2026</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-center px-4 py-2 rounded-xl ${overallScore >= 80 ? 'bg-emerald-500/20 border border-emerald-500/30' : overallScore >= 60 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <p className={`text-2xl font-black ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{overallScore}%</p>
                <p className="text-slate-400 text-[10px]">Overall Ready</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Critical Actions Open', value: criticalOpen, icon: AlertTriangle, color: criticalOpen > 0 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Actions Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Linked to 3x Target', value: linkedTo3x, icon: Target, color: 'text-amber-400' },
              { label: 'Readiness Score', value: `${overallScore}%`, icon: BarChart3, color: 'text-violet-400' },
            ].map(t => (
              <div key={t.label} className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                <t.icon size={16} className={t.color} />
                <div>
                  <p className="text-slate-400 text-[10px]">{t.label}</p>
                  <p className={`text-lg font-bold ${t.color}`}>{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar scorecards + radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Radar chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center">
            <h2 className="text-sm font-bold text-slate-800 mb-3 self-start">Readiness Radar</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Current" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeDasharray="4 2" strokeWidth={1.5} />
                <Tooltip formatter={(v: unknown) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block border-dashed" /> Target (100%)</span>
            </div>
          </div>

          {/* Pillar bars */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Pillar Readiness Scores</h2>
            <div className="space-y-4">
              {pillarScores.map(({ pillar, score }) => {
                const cfg = PILLAR_CFG[pillar];
                const items = readinessItems.filter(r => r.pillar === pillar);
                const isOpen = expandPillar === pillar;
                return (
                  <div key={pillar}>
                    <button
                      className="w-full flex items-center gap-3 text-left group"
                      onClick={() => setExpandPillar(isOpen ? null : pillar)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} ring-1 ${cfg.ring}`}>
                        <cfg.icon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-800">{cfg.label}</span>
                          <span className={`text-sm font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="mt-2 ml-11 space-y-2">
                        {items.map(r => {
                          const itemPct = Math.min(100, Math.round((r.current / r.target) * 100));
                          const isOk    = itemPct >= 100;
                          const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);
                          return (
                            <div key={r.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-700">{r.item}</span>
                                <span className={`font-bold ${isOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {fmt(r.current)}{r.unit !== '%' && ` ${r.unit}`}{r.unit === '%' && '%'}
                                  <span className="text-slate-400 font-normal"> / {fmt(r.target)}{r.unit !== '%' && ` ${r.unit}`}{r.unit === '%' && '%'}</span>
                                </span>
                              </div>
                              <div className="w-full bg-white rounded-full h-1 mb-1">
                                <div className={`h-1 rounded-full ${isOk ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${itemPct}%` }} />
                              </div>
                              <p className="text-slate-400">{r.note}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              Action Items — Path to 3x
            </h2>
            <div className="flex items-center gap-2">
              <select
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
                value={filterPillar}
                onChange={e => setFilterPillar(e.target.value as ReadinessPillar | 'all')}
              >
                <option value="all">All Pillars</option>
                {pillars.map(p => <option key={p} value={p}>{PILLAR_CFG[p].label}</option>)}
              </select>
              <select
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as ActionStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                {(Object.keys(STATUS_CFG) as ActionStatus[]).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-700"
              >
                <Plus size={12} /> Add Action
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredActions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No action items match the filter.</p>
            ) : filteredActions.map(action => {
              const cfg = PILLAR_CFG[action.pillar];
              const pCfg = PRIORITY_CFG[action.priority];
              const sCfg = STATUS_CFG[action.status];
              const isOverdue = action.dueDate && action.dueDate < '2026-06-11' && action.status !== 'completed';
              return (
                <div key={action.id} className={`border rounded-xl p-3 ${action.status === 'completed' ? 'border-emerald-100 bg-emerald-50/30 opacity-70' : isOverdue ? 'border-red-200 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg} shrink-0 mt-0.5`}>
                      <cfg.icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${pCfg.color}`}>{pCfg.label}</span>
                        {action.linkedTo3xTarget && (
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Target size={8} /> 3x Target
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <AlertTriangle size={8} /> Overdue
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${action.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{action.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{action.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5"><Users size={9} /> {action.owner || '—'}</span>
                        <span className="flex items-center gap-0.5"><Clock size={9} /> {action.dueDate || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sCfg.color}`}>{sCfg.label}</span>
                      <button
                        onClick={() => cycleStatus(action)}
                        className="p-1 rounded hover:bg-slate-100"
                        title="Advance status"
                      >
                        <Pencil size={11} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity calculator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-600" />
            Capacity Planning — 3x Target Calculator
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Dimension', 'Today (1x)', 'Need for 2x', 'Need for 3x', 'Gap (3x)', 'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { dim: 'Orders/Month', now: '18,420', x2: '36,840', x3: '55,260', gap: '+36,840', ok: false },
                  { dim: 'Production Cap. (units)', now: '12,000', x2: '24,000', x3: '36,000', gap: '+24,000', ok: false },
                  { dim: 'Warehouse (sq ft)', now: '2,000', x2: '4,000', x3: '6,000', gap: '+4,000', ok: false },
                  { dim: 'Courier Partners', now: '3', x2: '4', x3: '5', gap: '+2', ok: false },
                  { dim: 'Ops Team Size', now: '4', x2: '8', x3: '12', gap: '+8', ok: false },
                  { dim: 'API Integrations', now: '0', x2: '2', x3: '4', gap: '+4', ok: false },
                  { dim: 'Working Capital (₹ Cr)', now: '0.50', x2: '1.00', x3: '1.50', gap: '+1.00 Cr', ok: false },
                  { dim: 'Gross Margin Target', now: '52%', x2: '55%', x3: '58%', gap: '+6pp', ok: false },
                ].map(r => (
                  <tr key={r.dim} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{r.dim}</td>
                    <td className="px-3 py-2.5 text-slate-600">{r.now}</td>
                    <td className="px-3 py-2.5 text-blue-600 font-medium">{r.x2}</td>
                    <td className="px-3 py-2.5 text-violet-700 font-bold">{r.x3}</td>
                    <td className="px-3 py-2.5 text-amber-600 font-semibold">{r.gap}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {r.ok ? 'Ready' : 'Action Needed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showAdd && <AddActionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
