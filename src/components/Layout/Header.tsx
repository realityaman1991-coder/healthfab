import { Bell, Search, RefreshCw, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const resetToDefaults = useStore(s => s.resetToDefaults);

  function handleReset() {
    if (window.confirm('Reset all data to sample defaults? This will clear any changes you have made.')) {
      resetToDefaults();
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500">
          <Search size={14} />
          <span>Search...</span>
        </div>

        {/* Persistent storage indicator */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <RefreshCw size={11} />
          <span>Auto-saved</span>
        </div>

        {/* Reset to demo data */}
        <button
          onClick={handleReset}
          title="Reset all data to sample defaults"
          className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <RotateCcw size={11} />
          <span>Reset Data</span>
        </button>

        {/* Alert badge */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow">
          HO
        </div>
      </div>
    </header>
  );
}
