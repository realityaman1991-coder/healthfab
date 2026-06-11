import { useState } from 'react';
import { Field, Select, FormActions } from '../common/Modal';
import { useStore } from '../../store';
import type { Return } from '../../types';

// ── Update return status ───────────────────────────────────────────────────────
interface UpdateReturnFormProps {
  returnId: string;
  currentStatus: Return['status'];
  onClose: () => void;
}

const RETURN_FLOW: Record<Return['status'], Return['status'][]> = {
  requested:  ['in_transit'],
  in_transit: ['received'],
  received:   ['refunded', 'rejected'],
  refunded:   [],
  rejected:   [],
};

export function UpdateReturnStatusForm({ returnId, currentStatus, onClose }: UpdateReturnFormProps) {
  const updateReturnStatus = useStore(s => s.updateReturnStatus);
  const next = RETURN_FLOW[currentStatus];
  const [status, setStatus] = useState<Return['status']>(next[0] ?? currentStatus);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateReturnStatus(returnId, status);
    onClose();
  }

  if (next.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-slate-500">
        Return <strong>{returnId}</strong> is in a final state (<strong>{currentStatus}</strong>).
        <button onClick={onClose} className="mt-4 block mx-auto px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">Return:</span> {returnId}</p>
        <p><span className="font-semibold">Current Status:</span> {currentStatus}</p>
      </div>
      <Field label="New Status" required>
        <Select value={status} onChange={e => setStatus(e.target.value as Return['status'])}>
          {next.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_',' ')}</option>
          ))}
        </Select>
      </Field>
      <FormActions onCancel={onClose} submitLabel="Update Return" />
    </form>
  );
}
