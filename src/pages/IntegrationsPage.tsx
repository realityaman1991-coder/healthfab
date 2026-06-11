import { useState, useRef } from 'react';
import Header from '../components/Layout/Header';
import { useStore } from '../store';
import Papa from 'papaparse';
import {
  Plug, CheckCircle2, XCircle, Clock, AlertTriangle, Upload,
  Download, RefreshCw, Settings, ChevronRight, FileText,
  ShoppingBag, Zap, Globe, Eye, EyeOff,
} from 'lucide-react';
import type { Integration, ChannelId } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Integration['status'] }) {
  const cfg = {
    connected:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    disconnected: 'bg-slate-100 text-slate-500 border-slate-200',
    error:        'bg-red-100 text-red-600 border-red-200',
    pending:      'bg-amber-100 text-amber-700 border-amber-200',
  }[status];
  const labels = { connected: 'Connected', disconnected: 'Not Connected', error: 'Error', pending: 'Pending' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg}`}>
      {labels[status]}
    </span>
  );
}

// ─── Amazon Connect Modal ─────────────────────────────────────────────────────
function AmazonConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: (creds: Partial<Integration>) => void }) {
  const [clientId,     setClientId]     = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [sellerId,     setSellerId]     = useState('');
  const [refreshToken, _setRefreshToken] = useState('');
  const [showSecret,   setShowSecret]   = useState(false);
  const [step,         setStep]         = useState<'creds' | 'auth' | 'done'>('creds');

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setStep('auth');
  }

  function handleAuthorize() {
    // Simulate OAuth flow — in production redirect to Amazon LWA
    setTimeout(() => {
      setStep('done');
    }, 1500);
  }

  function handleSave() {
    onConnect({
      status: 'connected',
      credentials: { clientId, clientSecret, sellerId, refreshToken: refreshToken || 'simulated_refresh_token' },
      lastSync: new Date().toISOString().split('T')[0],
      syncedOrders: 0,
      autoSyncEnabled: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Connect Amazon SP-API</h2>
            <p className="text-xs text-slate-500">OAuth 2.0 · Free for registered sellers</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-5 pt-4">
          {(['creds', 'auth', 'done'] as const).map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-amber-500 text-white' :
                ['creds','auth','done'].indexOf(step) > i ? 'bg-emerald-500 text-white' :
                'bg-slate-200 text-slate-400'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${['creds','auth','done'].indexOf(step) > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-5 pb-2 text-[10px] text-slate-400 mt-1">
          <span>App Credentials</span><span className="mr-4">Authorize</span><span>Done</span>
        </div>

        <div className="p-5">
          {step === 'creds' && (
            <form onSubmit={handleNext} className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Before you start:</strong> Register your app in <a href="#" className="underline">Amazon Seller Central → Apps & Services → Develop Apps</a>. Get your Client ID and Client Secret from the app credentials page.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Seller ID (Merchant Token)</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="A2XXXXXXXXXXX" value={sellerId} onChange={e => setSellerId(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">LWA Client ID</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="amzn1.application-oa2-client.XXXXX" value={clientId} onChange={e => setClientId(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">LWA Client Secret</label>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="••••••••••••••••" value={clientSecret} onChange={e => setClientSecret(e.target.value)} required />
                  <button type="button" className="absolute right-2 top-2 text-slate-400" onClick={() => setShowSecret(v => !v)}>
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">Next: Authorize <ChevronRight size={14} className="inline" /></button>
              </div>
            </form>
          )}

          {step === 'auth' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Authorize HealthFab Ops Platform</p>
                <p className="text-xs">Click "Authorize with Amazon" below. You'll be redirected to Amazon to grant access to read orders, inventory, and returns data. After authorization, a Refresh Token will be issued.</p>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Permissions requested:</p>
                <p>✓ Read Orders (sellingpartnerapi-eu.amazon.com/orders/v0)</p>
                <p>✓ Read/Write Inventory (fba-inventory)</p>
                <p>✓ Read Returns (merchant-fulfillment)</p>
              </div>
              <button onClick={handleAuthorize} className="w-full py-2.5 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 flex items-center justify-center gap-2">
                <ShoppingBag size={16} /> Authorize with Amazon (Simulated)
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Authorization Successful!</p>
                <p className="text-xs text-slate-500 mt-1">Amazon SP-API connected. Orders and inventory will sync every 2 hours.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 text-left space-y-1">
                <p><strong>Seller ID:</strong> {sellerId || 'A2XXXXXXXXXXX'}</p>
                <p><strong>Endpoint:</strong> sellingpartnerapi-eu.amazon.com (India)</p>
                <p><strong>Sync scope:</strong> Orders, Inventory, Returns</p>
                <p><strong>Auto-sync:</strong> Every 2 hours</p>
              </div>
              <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600">
                Save & Activate Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Flipkart Connect Modal ───────────────────────────────────────────────────
function FlipkartConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: (creds: Partial<Integration>) => void }) {
  const [appId,     setAppId]     = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [done, setDone] = useState(false);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setDone(true); }, 2000);
  }

  function handleSave() {
    onConnect({
      status: 'connected',
      credentials: { clientId: appId, clientSecret: appSecret },
      lastSync: new Date().toISOString().split('T')[0],
      syncedOrders: 0,
      autoSyncEnabled: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Connect Flipkart Seller API</h2>
            <p className="text-xs text-slate-500">OAuth 2.0 · Free for registered sellers</p>
          </div>
        </div>
        <div className="p-5">
          {!done ? (
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                Register at <strong>seller.flipkart.com → Developer</strong> to get your App ID and App Secret.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">App ID</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="fk_app_XXXXXXXX" value={appId} onChange={e => setAppId(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">App Secret</label>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="••••••••••••••••" value={appSecret} onChange={e => setAppSecret(e.target.value)} required />
                  <button type="button" className="absolute right-2 top-2 text-slate-400" onClick={() => setShowSecret(v => !v)}>
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-600">Will sync:</p>
                <p>✓ Orders · ✓ Inventory · ✓ Returns · ✓ Shipments</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={connecting} className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  {connecting ? <><RefreshCw size={14} className="animate-spin" /> Connecting...</> : 'Connect API'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Flipkart API Connected!</p>
                <p className="text-xs text-slate-500 mt-1">Orders and inventory will sync every hour.</p>
              </div>
              <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600">
                Save Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CSV Upload Panel ─────────────────────────────────────────────────────────
type UploadType = 'orders' | 'inventory' | 'returns';

interface ParsedRow { [key: string]: string }

function CSVUploadPanel() {
  const addOrder        = useStore(s => s.addOrder);
  const orders          = useStore(s => s.orders);
  const [type, setType] = useState<UploadType>('orders');
  const [rows,  setRows]  = useState<ParsedRow[]>([]);
  const [error, setError] = useState('');
  const [done,  setDone]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const TEMPLATES: Record<UploadType, { headers: string[]; sample: string }> = {
    orders: {
      headers: ['order_id','channel','sku_id','qty','amount','status','date','customer','city','state'],
      sample: 'ORD-9999,amazon,gpf-heavy-M,1,899,pending,2026-06-11,Priya Sharma,Delhi,DL',
    },
    inventory: {
      headers: ['sku_id','channel_id','stock','reorder_point'],
      sample: 'gpf-heavy-M,amazon,50,20',
    },
    returns: {
      headers: ['return_id','order_id','channel_id','sku_id','reason','status','date','refund_amount'],
      sample: 'RET-9999,ORD-0001,amazon,gpf-heavy-M,wrong_size,requested,2026-06-11,899',
    },
  };

  function downloadTemplate() {
    const t = TEMPLATES[type];
    const csv = [t.headers.join(','), t.sample].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `healthfab_${type}_template.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setDone(false); setRows([]);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length) { setError('Parse error: ' + result.errors[0].message); return; }
        setRows(result.data);
      },
    });
  }

  function handleImport() {
    if (type === 'orders') {
      rows.forEach((row, i) => {
        addOrder({
          id:         row.order_id || `CSV-${String(orders.length + i + 1).padStart(5, '0')}`,
          channelId:  (row.channel || 'website') as ChannelId,
          skuId:      row.sku_id || 'gpf-heavy-M',
          qty:        Number(row.qty) || 1,
          amount:     Number(row.amount) || 0,
          status:     (row.status || 'pending') as Order['status'],
          date:       row.date || new Date().toISOString().split('T')[0],
          customer:   row.customer || 'CSV Import',
          city:       row.city || '',
          state:      row.state || '',
        });
      });
    }
    setDone(true);
    setRows([]);
    if (fileRef.current) fileRef.current.value = '';
  }

  // TS needs the import for Order status type
  type Order = import('../types').Order;

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {(['orders', 'inventory', 'returns'] as UploadType[]).map(t => (
          <button key={t} onClick={() => { setType(t); setRows([]); setError(''); setDone(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
              type === t ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Template download */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <FileText size={16} className="text-slate-400 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-slate-700">Download {type} template</p>
          <p className="text-slate-400">Required columns: {TEMPLATES[type].headers.join(', ')}</p>
        </div>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-violet-600 font-semibold hover:text-violet-700">
          <Download size={13} /> Template
        </button>
      </div>

      {/* File upload */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">Drop CSV or Excel file here, or click to browse</p>
        <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx, .xls · Max 5 MB</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">{rows.length} rows parsed — preview:</p>
            <button onClick={handleImport} className="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-700">
              <Upload size={12} /> Import {rows.length} rows
            </button>
          </div>
          <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-200">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 sticky top-0">
                <tr>{Object.keys(rows[0]).map(h => <th key={h} className="px-2 py-1.5 text-left font-semibold text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1.5 text-slate-700 truncate max-w-24">{v}</td>)}
                  </tr>
                ))}
                {rows.length > 5 && (
                  <tr className="border-t border-slate-100">
                    <td colSpan={Object.keys(rows[0]).length} className="px-2 py-1.5 text-slate-400 text-center">
                      ... and {rows.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
          <CheckCircle2 size={14} /> Import complete! Data added to the platform.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Modal = { type: 'amazon' } | { type: 'flipkart' } | null;

export default function IntegrationsPage() {
  const integrations  = useStore(s => s.integrations);
  const saveIntegration = useStore(s => s.saveIntegration);
  const [modal, setModal] = useState<Modal>(null);

  const connected = integrations.filter(i => i.status === 'connected').length;

  const API_CHANNELS = integrations.filter(i => i.apiType === 'sp_api' || i.apiType === 'seller_api');
  const OTHER_CHANNELS = integrations.filter(i => i.apiType !== 'sp_api' && i.apiType !== 'seller_api');

  function handleConnect(id: string, updates: Partial<Integration>) {
    saveIntegration(id, updates);
  }

  function handleDisconnect(id: string) {
    if (window.confirm('Disconnect this integration? Data sync will stop.')) {
      saveIntegration(id, { status: 'disconnected', credentials: undefined, autoSyncEnabled: false });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <Header title="Integrations & Data Import" subtitle="Connect marketplaces via API · Bulk upload CSV/Excel · Sync orders, inventory & returns" />
      <div className="p-6 space-y-5">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Channels Connected', value: connected, max: integrations.length, icon: Plug, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'API Integrations', value: API_CHANNELS.filter(i => i.status === 'connected').length, max: API_CHANNELS.length, icon: Zap, color: 'text-amber-600 bg-amber-50' },
            { label: 'Orders Synced Today', value: integrations.reduce((s, i) => s + i.syncedOrders, 0).toLocaleString(), icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
            { label: 'Sync Errors', value: integrations.reduce((s, i) => s + i.syncErrors, 0), icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}>
                <t.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t.label}</p>
                <p className="text-xl font-bold text-slate-900">
                  {t.value}{'max' in t ? <span className="text-sm font-normal text-slate-400">/{t.max}</span> : ''}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* API Integrations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">API Integrations</h2>
            <span className="text-xs text-slate-400 ml-1">Real-time sync via official seller APIs</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {API_CHANNELS.map(intg => {
              const isAmazon = intg.id === 'int-amazon';
              const color = isAmazon ? 'amber' : 'blue';
              return (
                <div key={intg.id} className={`border rounded-xl p-4 ${intg.status === 'connected' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${color}-50 border border-${color}-200 flex items-center justify-center`}>
                        <ShoppingBag size={18} className={`text-${color}-600`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{intg.channelName}</p>
                        <p className="text-[10px] text-slate-400">{isAmazon ? 'SP-API (Selling Partner API)' : 'Flipkart Seller API'}</p>
                      </div>
                    </div>
                    <StatusBadge status={intg.status} />
                  </div>

                  {intg.status === 'connected' ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className="text-sm font-bold text-slate-800">{intg.syncedOrders.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400">Orders Synced</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className="text-sm font-bold text-slate-800">{intg.syncedInventory}</p>
                          <p className="text-[9px] text-slate-400">SKUs Synced</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className={`text-sm font-bold ${intg.syncErrors > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{intg.syncErrors}</p>
                          <p className="text-[9px] text-slate-400">Errors</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">Last sync: {intg.lastSync} · Auto-sync {intg.autoSyncEnabled ? 'ON' : 'OFF'}</p>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => saveIntegration(intg.id, { lastSync: new Date().toISOString().split('T')[0] })} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <RefreshCw size={11} /> Sync Now
                        </button>
                        <button onClick={() => handleDisconnect(intg.id)} className="flex items-center gap-1 py-1.5 px-2 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                          <XCircle size={11} /> Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p className="font-semibold text-slate-600">What syncs:</p>
                        <p>Orders · Inventory levels · Returns · Shipment tracking</p>
                      </div>
                      <button
                        onClick={() => setModal({ type: isAmazon ? 'amazon' : 'flipkart' })}
                        className={`w-full py-2 rounded-lg bg-${color}-500 text-white text-sm font-semibold hover:bg-${color}-600 flex items-center justify-center gap-2`}
                      >
                        <Plug size={14} /> Connect {intg.channelName}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Other channels */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Other Channels</h2>
            <span className="text-xs text-slate-400 ml-1">No public seller API — use CSV/Excel import below</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {OTHER_CHANNELS.map(intg => {
              const apiLabel = intg.apiType === 'partner_api' ? 'Partner API (Direct Setup)' : 'CSV Import Only';
              const canPartnerConnect = intg.apiType === 'partner_api';
              return (
                <div key={intg.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={14} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{intg.channelName}</p>
                        <p className="text-[10px] text-slate-400">{apiLabel}</p>
                      </div>
                    </div>
                    <StatusBadge status={intg.status} />
                  </div>
                  {canPartnerConnect ? (
                    <button className="w-full py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1">
                      <Settings size={11} /> Setup via Partner Program
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <AlertTriangle size={11} />
                      <span>No public API — use CSV import below</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Upload size={15} className="text-violet-600" />
            <h2 className="text-sm font-bold text-slate-800">Bulk Import — CSV / Excel</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4 ml-6">Upload data from any channel. Download the template, fill it in, and import.</p>
          <CSVUploadPanel />
        </div>

        {/* Data sync log */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Sync Activity Log</h2>
          </div>
          <div className="space-y-2">
            {[
              { time: '09:02 AM', event: 'CSV Import', detail: '42 orders imported from Myntra June export', icon: Upload, color: 'text-violet-600' },
              { time: '07:30 AM', event: 'System Start', detail: 'Ops Platform loaded — all modules active', icon: CheckCircle2, color: 'text-emerald-600' },
              { time: 'Yesterday', event: 'CSV Import', detail: '18 returns imported from Meesho returns report', icon: Upload, color: 'text-violet-600' },
              { time: 'Yesterday', event: 'Manual Update', detail: 'Inventory updated for Amazon FBA — 7 SKUs', icon: RefreshCw, color: 'text-blue-600' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <log.icon size={14} className={`${log.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-700">{log.event}</span>
                  <span className="text-xs text-slate-500 ml-2">{log.detail}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      {modal?.type === 'amazon' && (
        <AmazonConnectModal
          onClose={() => setModal(null)}
          onConnect={(creds) => handleConnect('int-amazon', creds)}
        />
      )}
      {modal?.type === 'flipkart' && (
        <FlipkartConnectModal
          onClose={() => setModal(null)}
          onConnect={(creds) => handleConnect('int-flipkart', creds)}
        />
      )}
    </div>
  );
}
