import { useState } from 'react';
import { Field, Input, Select, FormRow, FormActions } from '../common/Modal';
import { useStore } from '../../store';
import type { Vendor, PurchaseOrder, VendorType } from '../../types';

// ── Add / Edit Vendor ─────────────────────────────────────────────────────────
interface VendorFormProps {
  existing?: Vendor;
  onClose: () => void;
}

export function VendorForm({ existing, onClose }: VendorFormProps) {
  const addVendor    = useStore(s => s.addVendor);
  const updateVendor = useStore(s => s.updateVendor);
  const vendors      = useStore(s => s.vendors);

  const [name,     setName]     = useState(existing?.name     ?? '');
  const [type,     setType]     = useState<VendorType>(existing?.type ?? 'fabric');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [contact,  setContact]  = useState(existing?.contactName ?? '');
  const [phone,    setPhone]    = useState(existing?.phone    ?? '');
  const [otd,      setOtd]      = useState(String(existing?.onTimeDeliveryRate ?? 90));
  const [quality,  setQuality]  = useState(String(existing?.qualityScore ?? 85));
  const [lead,     setLead]     = useState(String(existing?.leadTimeDays ?? 7));
  const [moq,      setMoq]      = useState(String(existing?.moq ?? 500));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vendor: Vendor = {
      id:                 existing?.id ?? `V${String(vendors.length + 100).padStart(3, '0')}`,
      name, type, location, contactName: contact, phone,
      onTimeDeliveryRate: Number(otd),
      qualityScore:       Number(quality),
      costRating:         existing?.costRating ?? 3,
      leadTimeDays:       Number(lead),
      moq:                Number(moq),
      activeOrders:       existing?.activeOrders ?? 0,
      totalSpendMTD:      existing?.totalSpendMTD ?? 0,
      status:             existing?.status ?? 'active',
    };
    if (existing) {
      updateVendor(existing.id, vendor);
    } else {
      addVendor(vendor);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow>
        <Field label="Vendor Name" required>
          <Input placeholder="e.g. Shree Textiles" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Type" required>
          <Select value={type} onChange={e => setType(e.target.value as VendorType)}>
            <option value="fabric">Fabric Supplier</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="packaging">Packaging</option>
            <option value="courier">Courier</option>
          </Select>
        </Field>
      </FormRow>
      <Field label="Location" required>
        <Input placeholder="e.g. Surat, Gujarat" value={location} onChange={e => setLocation(e.target.value)} required />
      </Field>
      <FormRow>
        <Field label="Contact Name" required>
          <Input placeholder="e.g. Ramesh Patel" value={contact} onChange={e => setContact(e.target.value)} required />
        </Field>
        <Field label="Phone">
          <Input placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value)} />
        </Field>
      </FormRow>
      <FormRow cols={3}>
        <Field label="On-Time Delivery %" required>
          <Input type="number" min="0" max="100" value={otd} onChange={e => setOtd(e.target.value)} required />
        </Field>
        <Field label="Quality Score (0–100)" required>
          <Input type="number" min="0" max="100" value={quality} onChange={e => setQuality(e.target.value)} required />
        </Field>
        <Field label="Lead Time (days)" required>
          <Input type="number" min="1" value={lead} onChange={e => setLead(e.target.value)} required />
        </Field>
      </FormRow>
      <Field label="Minimum Order Qty">
        <Input type="number" min="1" value={moq} onChange={e => setMoq(e.target.value)} />
      </Field>
      <FormActions onCancel={onClose} submitLabel={existing ? 'Update Vendor' : 'Add Vendor'} />
    </form>
  );
}

// ── Create Purchase Order ──────────────────────────────────────────────────────
interface POFormProps { onClose: () => void }

export function PurchaseOrderForm({ onClose }: POFormProps) {
  const addPurchaseOrder = useStore(s => s.addPurchaseOrder);
  const purchaseOrders   = useStore(s => s.purchaseOrders);
  const vendors          = useStore(s => s.vendors).filter(v => v.status === 'active');

  const [vendorId,  setVendorId]  = useState(vendors[0]?.id ?? '');
  const [items,     setItems]     = useState('');
  const [qty,       setQty]       = useState('');
  const [amount,    setAmount]    = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDate,   setExpDate]   = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const po: PurchaseOrder = {
      id:           `PO-2026-${String(purchaseOrders.length + 50).padStart(3, '0')}`,
      vendorId,
      items,
      quantity:     Number(qty),
      amount:       Number(amount),
      status:       'draft',
      orderDate,
      expectedDate: expDate,
    };
    addPurchaseOrder(po);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Vendor" required>
        <Select value={vendorId} onChange={e => setVendorId(e.target.value)}>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </Select>
      </Field>
      <Field label="Items / Description" required>
        <Input placeholder="e.g. GPF Heavy – M, L (1000 units)" value={items} onChange={e => setItems(e.target.value)} required />
      </Field>
      <FormRow>
        <Field label="Quantity" required>
          <Input type="number" min="1" placeholder="e.g. 1000" value={qty} onChange={e => setQty(e.target.value)} required />
        </Field>
        <Field label="Amount (₹)" required>
          <Input type="number" min="1" placeholder="e.g. 250000" value={amount} onChange={e => setAmount(e.target.value)} required />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Order Date" required>
          <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
        </Field>
        <Field label="Expected Delivery Date" required>
          <Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} required />
        </Field>
      </FormRow>
      <FormActions onCancel={onClose} submitLabel="Create PO" />
    </form>
  );
}

// ── Update PO Status ──────────────────────────────────────────────────────────
interface POStatusFormProps {
  poId: string;
  currentStatus: PurchaseOrder['status'];
  onClose: () => void;
}

const PO_STATUS_FLOW: Record<PurchaseOrder['status'], PurchaseOrder['status'][]> = {
  draft:          ['sent'],
  sent:           ['confirmed', 'draft'],
  confirmed:      ['in_production'],
  in_production:  ['shipped'],
  shipped:        ['received'],
  received:       [],
};

export function POStatusForm({ poId, currentStatus, onClose }: POStatusFormProps) {
  const updatePOStatus = useStore(s => s.updatePOStatus);
  const next = PO_STATUS_FLOW[currentStatus];
  const [status, setStatus] = useState<PurchaseOrder['status']>(next[0] ?? currentStatus);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePOStatus(poId, status, status === 'received' ? receivedDate : undefined);
    onClose();
  }

  if (next.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-slate-500">
        PO <strong>{poId}</strong> is already <strong>{currentStatus}</strong>.
        <button onClick={onClose} className="mt-4 block mx-auto px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">PO:</span> {poId} · Current: <strong>{currentStatus}</strong></p>
      </div>
      <Field label="New Status" required>
        <Select value={status} onChange={e => setStatus(e.target.value as PurchaseOrder['status'])}>
          {next.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_',' ')}</option>)}
        </Select>
      </Field>
      {status === 'received' && (
        <Field label="Received Date">
          <Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} />
        </Field>
      )}
      <FormActions onCancel={onClose} submitLabel="Update PO" />
    </form>
  );
}
