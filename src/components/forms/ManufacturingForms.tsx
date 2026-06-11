import { useState } from 'react';
import { Field, Input, Select, FormRow, FormActions } from '../common/Modal';
import { useStore } from '../../store';
import { VENDORS, PRODUCTS, SIZES } from '../../data/mockData';
import type { ProductionBatch, RawMaterial, SizeId, ProductId } from '../../types';

// ── Add production batch ──────────────────────────────────────────────────────
interface AddBatchFormProps { onClose: () => void }

export function AddBatchForm({ onClose }: AddBatchFormProps) {
  const addBatch = useStore(s => s.addBatch);
  const batches  = useStore(s => s.productionBatches);
  const manufacturers = VENDORS.filter(v => v.type === 'manufacturer' && v.status === 'active');

  const [productId,     setProductId]     = useState<ProductId>('gpf-heavy');
  const [sizeId,        setSizeId]        = useState<SizeId>('M');
  const [plannedQty,    setPlannedQty]    = useState('');
  const [startDate,     setStartDate]     = useState(new Date().toISOString().split('T')[0]);
  const [endDate,       setEndDate]       = useState('');
  const [manufacturerId,setManufacturerId]= useState(manufacturers[0]?.id ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const batch: ProductionBatch = {
      id:             `BATCH-${String(batches.length + 70).padStart(3, '0')}`,
      productId,
      sizeId,
      plannedQty:     Number(plannedQty),
      startDate,
      endDate,
      status:         'planned',
      manufacturerId,
    };
    addBatch(batch);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow>
        <Field label="Product" required>
          <Select value={productId} onChange={e => setProductId(e.target.value as ProductId)}>
            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Size" required>
          <Select value={sizeId} onChange={e => setSizeId(e.target.value as SizeId)}>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Planned Quantity" required>
          <Input type="number" min="1" placeholder="e.g. 500" value={plannedQty} onChange={e => setPlannedQty(e.target.value)} required />
        </Field>
        <Field label="Manufacturer" required>
          <Select value={manufacturerId} onChange={e => setManufacturerId(e.target.value)}>
            {manufacturers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Start Date" required>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </Field>
        <Field label="Expected End Date" required>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </Field>
      </FormRow>
      <FormActions onCancel={onClose} submitLabel="Create Batch" />
    </form>
  );
}

// ── Update batch (status / actual qty / QC) ───────────────────────────────────
interface UpdateBatchFormProps {
  batchId: string;
  onClose: () => void;
}

export function UpdateBatchForm({ batchId, onClose }: UpdateBatchFormProps) {
  const updateBatch = useStore(s => s.updateBatch);
  const batch = useStore(s => s.productionBatches.find(b => b.id === batchId));

  const [status,    setStatus]    = useState(batch?.status ?? 'planned');
  const [actualQty, setActualQty] = useState(String(batch?.actualQty ?? ''));
  const [qcRate,    setQcRate]    = useState(String(batch?.qcPassRate ?? ''));

  if (!batch) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateBatch(batchId, {
      status: status as ProductionBatch['status'],
      ...(actualQty && { actualQty: Number(actualQty) }),
      ...(qcRate    && { qcPassRate: Number(qcRate) }),
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">Batch:</span> {batchId}</p>
        <p><span className="font-semibold">Planned:</span> {batch.plannedQty} units · {batch.productId} – {batch.sizeId}</p>
      </div>
      <Field label="Status" required>
        <Select value={status} onChange={e => setStatus(e.target.value as ProductionBatch['status'])}>
          {(['planned','in_progress','qc_pending','completed','rejected'] as ProductionBatch['status'][]).map(s => (
            <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </Select>
      </Field>
      <FormRow>
        <Field label="Actual Qty Produced" hint="Fill when production completes">
          <Input type="number" min="0" max={batch.plannedQty} placeholder={String(batch.plannedQty)} value={actualQty} onChange={e => setActualQty(e.target.value)} />
        </Field>
        <Field label="QC Pass Rate (%)" hint="Fill after QC inspection">
          <Input type="number" min="0" max="100" step="0.1" placeholder="e.g. 97.5" value={qcRate} onChange={e => setQcRate(e.target.value)} />
        </Field>
      </FormRow>
      <FormActions onCancel={onClose} submitLabel="Update Batch" />
    </form>
  );
}

// ── Update raw material stock ─────────────────────────────────────────────────
interface RawMaterialFormProps {
  materialId?: string; // if set, it's an update; otherwise, add new
  onClose: () => void;
}

export function RawMaterialForm({ materialId, onClose }: RawMaterialFormProps) {
  const updateRawMaterial = useStore(s => s.updateRawMaterial);
  const addRawMaterial    = useStore(s => s.addRawMaterial);
  const materials         = useStore(s => s.rawMaterials);
  const existing          = materials.find(m => m.id === materialId);

  const [name,     setName]     = useState(existing?.name     ?? '');
  const [unit,     setUnit]     = useState(existing?.unit     ?? 'meters');
  const [stock,    setStock]    = useState(String(existing?.currentStock ?? ''));
  const [reorder,  setReorder]  = useState(String(existing?.reorderPoint ?? ''));
  const [cost,     setCost]     = useState(String(existing?.costPerUnit  ?? ''));
  const [lead,     setLead]     = useState(String(existing?.leadTimeDays ?? 7));
  const suppliers = VENDORS.filter(v => v.type === 'fabric' || v.type === 'packaging');
  const [supplierId, setSupplierId] = useState(existing?.supplierId ?? suppliers[0]?.id ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existing) {
      updateRawMaterial(materialId!, Number(stock));
    } else {
      const newMat: RawMaterial = {
        id:           `RM-${String(materials.length + 10).padStart(3, '0')}`,
        name, unit,
        currentStock: Number(stock),
        reorderPoint: Number(reorder),
        costPerUnit:  Number(cost),
        supplierId,
        leadTimeDays: Number(lead),
      };
      addRawMaterial(newMat);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!existing && (
        <>
          <Field label="Material Name" required>
            <Input placeholder="e.g. Cotton-Microfibre Blend" value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <FormRow>
            <Field label="Unit" required>
              <Select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="meters">Meters</option>
                <option value="pieces">Pieces</option>
                <option value="kg">Kg</option>
                <option value="rolls">Rolls</option>
              </Select>
            </Field>
            <Field label="Supplier" required>
              <Select value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                {suppliers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Reorder Point" required>
              <Input type="number" min="0" value={reorder} onChange={e => setReorder(e.target.value)} required />
            </Field>
            <Field label="Cost / Unit (₹)" required>
              <Input type="number" min="0" step="0.01" value={cost} onChange={e => setCost(e.target.value)} required />
            </Field>
          </FormRow>
          <Field label="Lead Time (days)">
            <Input type="number" min="1" value={lead} onChange={e => setLead(e.target.value)} />
          </Field>
        </>
      )}
      {existing && (
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
          <p><span className="font-semibold">Material:</span> {existing.name}</p>
          <p><span className="font-semibold">Unit:</span> {existing.unit}</p>
        </div>
      )}
      <Field label={existing ? 'Current Stock' : 'Initial Stock'} required>
        <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
      </Field>
      <FormActions onCancel={onClose} submitLabel={existing ? 'Update Stock' : 'Add Material'} />
    </form>
  );
}
