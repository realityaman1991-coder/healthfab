import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '../../types';

interface KpiCardProps {
  kpi: KpiData;
  compact?: boolean;
}

export default function KpiCard({ kpi, compact }: KpiCardProps) {
  const isPositive = kpi.change > 0;
  const isNeutral = kpi.change === 0;
  const isNegativeGood = kpi.label.toLowerCase().includes('return');

  const changeGood = isNegativeGood ? !isPositive : isPositive;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</p>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isNeutral
              ? 'bg-slate-100 text-slate-500'
              : changeGood
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-500'
          }`}
        >
          {isNeutral ? (
            <Minus size={10} />
          ) : changeGood ? (
            <TrendingUp size={10} />
          ) : (
            <TrendingDown size={10} />
          )}
          {Math.abs(kpi.change)}%
        </div>
      </div>
      <p className={`font-bold text-slate-900 mt-2 ${compact ? 'text-xl' : 'text-2xl'}`}>{kpi.value}</p>
      <p className="text-xs text-slate-400 mt-1">{kpi.changeLabel}</p>
    </div>
  );
}
