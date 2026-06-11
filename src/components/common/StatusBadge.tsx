interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  // Order statuses
  pending:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:      'bg-blue-50 text-blue-700 border-blue-200',
  processing:     'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped:        'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:      'bg-slate-100 text-slate-500 border-slate-200',
  returned:       'bg-red-50 text-red-600 border-red-200',
  // Return statuses
  requested:      'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_transit:     'bg-cyan-50 text-cyan-700 border-cyan-200',
  received:       'bg-blue-50 text-blue-700 border-blue-200',
  refunded:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:       'bg-red-50 text-red-600 border-red-200',
  // Batch statuses
  planned:        'bg-slate-100 text-slate-600 border-slate-200',
  in_progress:    'bg-blue-50 text-blue-700 border-blue-200',
  qc_pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected_batch: 'bg-red-50 text-red-600 border-red-200',
  // Vendor / PO statuses
  active:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:       'bg-slate-100 text-slate-500 border-slate-200',
  onboarding:     'bg-purple-50 text-purple-700 border-purple-200',
  draft:          'bg-slate-100 text-slate-500 border-slate-200',
  sent:           'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_production:  'bg-violet-50 text-violet-700 border-violet-200',
};

const LABELS: Record<string, string> = {
  in_transit: 'In Transit',
  in_progress: 'In Progress',
  in_production: 'In Production',
  qc_pending: 'QC Pending',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const label = LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center border rounded-full font-medium capitalize ${
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    } ${style}`}>
      {label}
    </span>
  );
}
