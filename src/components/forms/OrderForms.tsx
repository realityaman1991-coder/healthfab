import { useState } from 'react';
import { Field, Input, Select, FormRow, FormActions } from '../common/Modal';
import { useStore } from '../../store';
import { SKUS, CHANNELS, PRODUCTS, SIZES } from '../../data/mockData';
import type { Order, OrderStatus, ChannelId } from '../../types';

const CITIES = ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow','Surat','Kochi'];
const CITY_STATE: Record<string, string> = {
  Mumbai: 'Maharashtra', Delhi: 'Delhi', Bengaluru: 'Karnataka',
  Hyderabad: 'Telangana', Chennai: 'Tamil Nadu', Pune: 'Maharashtra',
  Kolkata: 'West Bengal', Ahmedabad: 'Gujarat', Jaipur: 'Rajasthan',
  Lucknow: 'UP', Surat: 'Gujarat', Kochi: 'Kerala',
};

// ── Add new order ──────────────────────────────────────────────────────────────
interface AddOrderFormProps { onClose: () => void }

export function AddOrderForm({ onClose }: AddOrderFormProps) {
  const addOrder = useStore(s => s.addOrder);
  const orders   = useStore(s => s.orders);

  const [product, setProduct]   = useState('gpf-heavy');
  const [size, setSize]         = useState<string>('M');
  const [channel, setChannel]   = useState<ChannelId>('website');
  const [customer, setCustomer] = useState('');
  const [city, setCity]         = useState('Mumbai');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);

  const skuId = `${product}-${size}`;
  const sku = SKUS.find(s => s.id === skuId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `ORD-${String(orders.length + 10001).padStart(6, '0')}`;
    const order: Order = {
      id,
      channelId: channel,
      skuId,
      qty: 1,
      amount: Number(amount) || sku?.mrp || 899,
      status: 'pending',
      date,
      customer,
      city,
      state: CITY_STATE[city] ?? 'Other',
      trackingId: undefined,
      courierId: undefined,
    };
    addOrder(order);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow>
        <Field label="Product" required>
          <Select value={product} onChange={e => setProduct(e.target.value)}>
            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Size" required>
          <Select value={size} onChange={e => setSize(e.target.value)}>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Channel" required>
          <Select value={channel} onChange={e => setChannel(e.target.value as ChannelId)}>
            {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Amount (₹)" hint={`MRP: ₹${sku?.mrp ?? 899}`}>
          <Input type="number" min="1" placeholder={String(sku?.mrp ?? 899)} value={amount} onChange={e => setAmount(e.target.value)} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Customer Name" required>
          <Input placeholder="e.g. Priya S" value={customer} onChange={e => setCustomer(e.target.value)} required />
        </Field>
        <Field label="City" required>
          <Select value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
      </FormRow>
      <Field label="Order Date" required>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </Field>
      <FormActions onCancel={onClose} submitLabel="Create Order" />
    </form>
  );
}

// ── Update order status ────────────────────────────────────────────────────────
interface UpdateStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  onClose: () => void;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'returned'],
  delivered:  ['returned'],
  cancelled:  [],
  returned:   [],
};

export function UpdateOrderStatusForm({ orderId, currentStatus, onClose }: UpdateStatusFormProps) {
  const updateOrderStatus = useStore(s => s.updateOrderStatus);
  const next = STATUS_FLOW[currentStatus];
  const [status, setStatus] = useState<OrderStatus>(next[0] ?? currentStatus);
  const [deliveredDate, setDeliveredDate] = useState(new Date().toISOString().split('T')[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateOrderStatus(orderId, status, status === 'delivered' ? deliveredDate : undefined);
    onClose();
  }

  if (next.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-slate-500">
        This order is in a final state (<strong>{currentStatus}</strong>) and cannot be updated further.
        <button onClick={onClose} className="mt-4 block mx-auto px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
        <p><span className="font-semibold">Order:</span> {orderId}</p>
        <p><span className="font-semibold">Current Status:</span> {currentStatus}</p>
      </div>
      <Field label="New Status" required>
        <Select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}>
          {next.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </Field>
      {status === 'delivered' && (
        <Field label="Delivered Date">
          <Input type="date" value={deliveredDate} onChange={e => setDeliveredDate(e.target.value)} />
        </Field>
      )}
      <FormActions onCancel={onClose} submitLabel="Update Status" />
    </form>
  );
}

// ── Bulk status update ─────────────────────────────────────────────────────────
interface BulkStatusFormProps {
  orderIds: string[];
  onClose: () => void;
}

export function BulkStatusForm({ orderIds, onClose }: BulkStatusFormProps) {
  const bulkUpdateOrders = useStore(s => s.bulkUpdateOrders);
  const [status, setStatus] = useState<OrderStatus>('shipped');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    bulkUpdateOrders(orderIds, status);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700 border border-amber-200">
        Updating status for <strong>{orderIds.length} orders</strong>.
      </div>
      <Field label="New Status" required>
        <Select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}>
          {(['confirmed','processing','shipped','delivered','cancelled'] as OrderStatus[]).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </Select>
      </Field>
      <FormActions onCancel={onClose} submitLabel={`Update ${orderIds.length} Orders`} />
    </form>
  );
}
