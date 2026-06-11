import { useState } from 'react';
import Header from '../components/Layout/Header';
import { useStore } from '../store';
import {
  BookOpen, CheckCircle2, Circle, ChevronRight, Clock, Users,
  Plus, RotateCcw, Search, Filter, Trophy, AlertCircle, Tag,
  ArrowLeft, Pencil,
} from 'lucide-react';
import type { SOP, SOPCategory, SOPStatus, SOPStep } from '../types';

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CFG: Record<SOPCategory, { label: string; color: string; bg: string }> = {
  fulfillment:   { label: 'Fulfillment',    color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  inventory:     { label: 'Inventory',      color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200'     },
  returns:       { label: 'Returns',        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'   },
  quality:       { label: 'Quality',        color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200'},
  vendor:        { label: 'Vendor',         color: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200'     },
  manufacturing: { label: 'Manufacturing',  color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  hr:            { label: 'HR',             color: 'text-cyan-700',   bg: 'bg-cyan-50 border-cyan-200'     },
  finance:       { label: 'Finance',        color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200'   },
};

// ─── Completion % helper ────────────────────────────────────────────────────────
function completionPct(sop: SOP): number {
  if (!sop.steps.length) return 0;
  return Math.round((sop.steps.filter(s => s.checked).length / sop.steps.length) * 100);
}

// ─── New SOP Modal ─────────────────────────────────────────────────────────────
interface NewSOPModalProps { onClose: () => void }

function NewSOPModal({ onClose }: NewSOPModalProps) {
  const addSOP  = useStore(s => s.addSOP);
  const sops    = useStore(s => s.sops);
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState<SOPCategory>('fulfillment');
  const [desc,     setDesc]     = useState('');
  const [assignee, setAssignee] = useState('');
  const [estMins,  setEstMins]  = useState('15');
  const [steps,    setSteps]    = useState(['', '', '']);

  function addStep() { setSteps(s => [...s, '']); }
  function updateStep(i: number, v: string) { setSteps(s => s.map((x, j) => j === i ? v : x)); }
  function removeStep(i: number) { setSteps(s => s.filter((_, j) => j !== i)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sopSteps: SOPStep[] = steps
      .filter(s => s.trim())
      .map((desc, i) => ({
        id:          `s${String(sops.length + 1).padStart(3,'0')}-${i + 1}`,
        stepNumber:  i + 1,
        description: desc,
        checked:     false,
      }));
    const sop: SOP = {
      id:               `SOP-${String(sops.length + 1).padStart(3, '0')}`,
      title, category, description: desc,
      status:           'active',
      assignedTo:       assignee,
      estimatedMinutes: Number(estMins),
      completionCount:  0,
      createdDate:      new Date().toISOString().split('T')[0],
      lastUpdated:      new Date().toISOString().split('T')[0],
      steps:            sopSteps,
    };
    addSOP(sop);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-bold text-slate-900">Create New SOP</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">SOP Title *</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. Daily Inventory Count" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" value={category} onChange={e => setCategory(e.target.value as SOPCategory)}>
                {(Object.keys(CATEGORY_CFG) as SOPCategory[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_CFG[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Time (min)</label>
              <input type="number" min="1" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" value={estMins} onChange={e => setEstMins(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none h-16" placeholder="Brief description of this SOP's purpose..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned To</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. Fulfillment Team" value={assignee} onChange={e => setAssignee(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Steps *</label>
              <button type="button" onClick={addStep} className="text-xs text-violet-600 font-semibold flex items-center gap-1 hover:text-violet-700">
                <Plus size={12} /> Add step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5 text-right">{i + 1}.</span>
                  <input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder={`Step ${i + 1} description`} value={step} onChange={e => updateStep(i, e.target.value)} />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-slate-300 hover:text-red-400 text-sm">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Create SOP</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── SOP Detail View ───────────────────────────────────────────────────────────
interface SOPDetailProps { sop: SOP; onBack: () => void }

function SOPDetail({ sop, onBack }: SOPDetailProps) {
  const toggleSOPStep = useStore(s => s.toggleSOPStep);
  const resetSOPSteps = useStore(s => s.resetSOPSteps);
  const updateSOP     = useStore(s => s.updateSOP);
  const pct = completionPct(sop);
  const allDone = pct === 100;
  const cfg = CATEGORY_CFG[sop.category];

  function handleToggle(stepId: string) {
    toggleSOPStep(sop.id, stepId);
  }

  function handleReset() {
    if (window.confirm('Reset all steps? This will uncheck all completed steps.')) {
      resetSOPSteps(sop.id);
    }
  }

  function cycleStatus() {
    const next: Record<SOPStatus, SOPStatus> = { active: 'draft', draft: 'archived', archived: 'active' };
    updateSOP(sop.id, { status: next[sop.status], lastUpdated: new Date().toISOString().split('T')[0] });
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium">
          <ArrowLeft size={15} /> Back to SOPs
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                sop.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                sop.status === 'draft'  ? 'bg-amber-50 border-amber-200 text-amber-700' :
                'bg-slate-50 border-slate-200 text-slate-500'
              }`}>{sop.status.toUpperCase()}</span>
              <span className="text-[10px] text-slate-400">#{sop.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{sop.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{sop.description}</p>
          </div>
          <button onClick={cycleStatus} className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 hover:bg-slate-50">
            <Pencil size={11} /> Status
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1"><Users size={11} /> {sop.assignedTo || '—'}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> ~{sop.estimatedMinutes} min</span>
          <span className="flex items-center gap-1"><Trophy size={11} /> Completed {sop.completionCount}x</span>
          <span className="flex items-center gap-1"><Tag size={11} /> Updated {sop.lastUpdated}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">
              {sop.steps.filter(s => s.checked).length} / {sop.steps.length} steps complete
            </span>
            <span className={`font-bold ${allDone ? 'text-emerald-600' : 'text-violet-600'}`}>{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-violet-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {allDone && (
            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={13} /> All steps complete! SOP run #{sop.completionCount + 1} finished.
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {sop.steps.map((step: SOPStep) => (
            <div
              key={step.id}
              onClick={() => handleToggle(step.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                step.checked
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-violet-50/40'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${step.checked ? 'text-emerald-500' : 'text-slate-300'}`}>
                {step.checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-400">Step {step.stepNumber}</span>
                  <span className={`text-sm font-medium ${step.checked ? 'text-emerald-700 line-through decoration-emerald-400' : 'text-slate-800'}`}>
                    {step.description}
                  </span>
                </div>
                {step.detail && (
                  <p className="text-xs text-slate-400 mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <RotateCcw size={12} /> Reset Steps
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SOP Card ──────────────────────────────────────────────────────────────────
function SOPCard({ sop, onClick }: { sop: SOP; onClick: () => void }) {
  const pct = completionPct(sop);
  const cfg = CATEGORY_CFG[sop.category];
  const checked = sop.steps.filter(s => s.checked).length;

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-slate-400">{sop.id}</span>
          </div>
          <p className="font-bold text-slate-900 text-sm leading-tight pr-2 group-hover:text-violet-700 transition-colors">{sop.title}</p>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-400 shrink-0 mt-0.5 transition-colors" />
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{sop.description}</p>

      {/* Progress */}
      {pct > 0 && (
        <div className="mb-3">
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{checked}/{sop.steps.length} steps · {pct}%</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><Users size={9} /> {sop.assignedTo || '—'}</span>
        <span className="flex items-center gap-1"><Clock size={9} /> {sop.estimatedMinutes}m</span>
        <span className="flex items-center gap-1"><Trophy size={9} /> ×{sop.completionCount}</span>
        <span className={`font-bold px-1.5 py-0.5 rounded ${
          sop.status === 'active' ? 'text-emerald-600' :
          sop.status === 'draft'  ? 'text-amber-600' : 'text-slate-400'
        }`}>{sop.status.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SOPsPage() {
  const sops          = useStore(s => s.sops);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew,    setShowNew]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterCat,  setFilterCat]  = useState<SOPCategory | 'all'>('all');

  const selected = sops.find(s => s.id === selectedId);

  const totalSteps    = sops.reduce((n, s) => n + s.steps.length, 0);
  const completedSteps = sops.reduce((n, s) => n + s.steps.filter(x => x.checked).length, 0);
  const activeSops    = sops.filter(s => s.status === 'active').length;
  const inProgress    = sops.filter(s => completionPct(s) > 0 && completionPct(s) < 100).length;

  const filtered = sops.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'all' || s.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(sops.map(s => s.category)));

  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <Header title="SOP Automation" subtitle="Digital standard operating procedures · Step-by-step checklists · Compliance tracking" />
        <div className="p-6">
          <SOPDetail sop={selected} onBack={() => setSelectedId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="SOP Automation" subtitle="Digital standard operating procedures · Step-by-step checklists · Compliance tracking" />
      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active SOPs', value: activeSops, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
            { label: 'In Progress', value: inProgress, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
            { label: 'Steps Checked Today', value: `${completedSteps}/${totalSteps}`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Completions', value: sops.reduce((n, s) => n + s.completionCount, 0), icon: Trophy, color: 'text-blue-600 bg-blue-50' },
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

        {/* Search + Filter + New SOP */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
            <Search size={14} className="text-slate-400" />
            <input
              className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="Search SOPs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-600 focus:outline-none"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value as SOPCategory | 'all')}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{CATEGORY_CFG[c].label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
          >
            <Plus size={14} /> New SOP
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => {
            const cfg = CATEGORY_CFG[c];
            const count = sops.filter(s => s.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setFilterCat(filterCat === c ? 'all' : c)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  filterCat === c ? `${cfg.bg} ${cfg.color}` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cfg.label}
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {/* SOP grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <BookOpen size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No SOPs found. Create your first SOP to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(sop => (
              <SOPCard key={sop.id} sop={sop} onClick={() => setSelectedId(sop.id)} />
            ))}
          </div>
        )}

        {/* Compliance summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-amber-500" />
            SOP Compliance by Category
          </h2>
          <div className="space-y-3">
            {categories.map(cat => {
              const catSops = sops.filter(s => s.category === cat);
              const totalRuns = catSops.reduce((n, s) => n + s.completionCount, 0);
              const cfg = CATEGORY_CFG[cat];
              const activeCount = catSops.filter(s => s.status === 'active').length;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs font-semibold w-24 ${cfg.color}`}>{cfg.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${Math.min(100, totalRuns * 5)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-20 text-right">{activeCount} SOP{activeCount !== 1 ? 's' : ''} · {totalRuns} runs</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {showNew && <NewSOPModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
