import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users, Store, Receipt, Blocks, RefreshCw, FileJson, FileSpreadsheet, Database, Plus, Trash2,
  Braces, Table2, Settings2, AlertCircle, Dices,
} from 'lucide-react';
import { Button, Card, CardHeader, CopyButton, Field, Segmented, Select, cx } from '../components/ui/primitives.jsx';
import { CodeView } from '../components/ui/CodeView.jsx';
import { useMeta, useToast } from '../lib/context.jsx';
import { buildPath, cleanParams, formatBytes, timedFetch, API_PREFIX } from '../lib/api.js';
import { copyText, downloadFile, useDebounced } from '../lib/hooks.js';
import { flattenRow, toCSV, toSQL } from '../../shared/exporters.js';

const DATASETS = [
  { value: 'users', label: 'Users', icon: Users },
  { value: 'products', label: 'Warung', icon: Store },
  { value: 'transactions', label: 'Transaksi', icon: Receipt },
  { value: 'custom', label: 'Custom', icon: Blocks },
];

const DATASET_COPY = {
  users: 'Warga dengan NIK, HP per operator, alamat lengkap RT/RW.',
  products: 'Inventaris warung/UMKM: SKU, EAN-13 (899), harga Rp, stok.',
  transactions: 'Struk kasir + status pembayaran QRIS, e-wallet & VA.',
  custom: 'Susun skema sendiri dari 35+ tipe field Indonesia.',
};

const PRESETS = {
  'E-commerce customer': [['id', 'id'], ['nama', 'full_name'], ['email', 'email'], ['no_hp', 'phone'], ['alamat', 'address'], ['kota', 'city']],
  'Driver ojol': [['driver_id', 'uuid'], ['nama', 'full_name'], ['no_hp', 'phone'], ['operator', 'operator'], ['plat_nomor', 'plate_number'], ['kota', 'city']],
  'Payroll karyawan': [['nik', 'nik'], ['npwp', 'npwp'], ['nama', 'full_name'], ['perusahaan', 'company'], ['bank', 'bank'], ['no_rekening', 'bank_account']],
};

let fieldSeq = 0;
const mkField = (name, type) => ({ id: ++fieldSeq, name, type });
const presetFields = (key) => PRESETS[key].map(([n, t]) => mkField(n, t));

function validateFields(fields) {
  const errors = {};
  const seen = new Map();
  for (const f of fields) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(f.name)) errors[f.id] = 'Use letters, digits, underscore; must not start with a digit.';
    else if (seen.has(f.name)) errors[f.id] = 'Duplicate field name.';
    seen.set(f.name, true);
  }
  return errors;
}

function DataTable({ rows }) {
  const flat = useMemo(() => rows.map((r) => flattenRow(r)), [rows]);
  const cols = useMemo(() => [...new Set(flat.flatMap((r) => Object.keys(r)))], [flat]);
  return (
    <div className="max-h-[32rem] overflow-auto rounded-lg border border-line" tabIndex={0} role="region" aria-label="Table preview">
      <table className="w-full border-collapse text-left font-mono text-xs">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr>
            {cols.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap border-b border-line px-3 py-2 font-semibold text-fg-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flat.map((r, i) => (
            <tr key={i} className="border-b border-line/70 odd:bg-surface even:bg-canvas/40 hover:bg-surface-2">
              {cols.map((c) => {
                const v = r[c];
                const s = v === null || v === undefined ? '' : String(v);
                return (
                  <td key={c} className={cx('max-w-[18rem] truncate px-3 py-1.5', typeof v === 'number' ? 'text-right tabular-nums syn-num' : 'text-fg')} title={s.length > 30 ? s : undefined}>
                    {v === null ? <span className="syn-null">null</span> : typeof v === 'boolean' ? <span className="syn-bool">{s}</span> : s}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Generator() {
  const { meta, status: metaStatus, reload } = useMeta();
  const toast = useToast();

  const [dataset, setDataset] = useState('users');
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({ users: {}, products: {}, transactions: {} });
  const [seed, setSeed] = useState('');
  const [fields, setFields] = useState(() => presetFields('E-commerce customer'));
  const [view, setView] = useState('json');
  const [tableName, setTableName] = useState('');
  const [createTable, setCreateTable] = useState(true);
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState({ status: 'loading' });
  const abortRef = useRef();

  const fieldErrors = useMemo(() => validateFields(fields), [fields]);
  const customValid = dataset !== 'custom' || (fields.length > 0 && Object.keys(fieldErrors).length === 0);

  const params = useMemo(
    () => cleanParams({ limit: rows, seed, ...(dataset === 'custom' ? {} : filters[dataset]) }),
    [rows, seed, dataset, filters],
  );
  const customBody = useMemo(() => fields.map(({ name, type }) => ({ name, type })), [fields]);
  const requestKey = useDebounced(JSON.stringify({ dataset, params, customBody, nonce }), 300);

  useEffect(() => {
    if (!customValid) return undefined;
    const { dataset: ds, params: p, customBody: body } = JSON.parse(requestKey);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setResult((r) => ({ ...r, status: 'loading' }));

    const req = ds === 'custom'
      ? timedFetch(`${API_PREFIX}/custom`, { method: 'POST', body: { ...p, fields: body }, signal: controller.signal })
      : timedFetch(buildPath(ds, p), { signal: controller.signal });

    req
      .then((r) => {
        if (!r.ok || !r.json?.success) {
          setResult({ status: 'error', error: r.json?.error?.message ?? `HTTP ${r.status}`, details: r.json?.error?.details });
          return;
        }
        setResult({ status: 'success', rows: r.json.data, meta: r.json.meta, ms: r.ms, dataset: ds });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setResult({ status: 'error', error: 'Network error — is the API server running?' });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const data = result.rows ?? [];
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const name = tableName.trim() || (result.dataset ?? dataset);
  const requestPath = dataset === 'custom'
    ? `${API_PREFIX}/custom?${new URLSearchParams({ ...params, fields: fields.map((f) => `${f.name}:${f.type}`).join(',') })}`
    : buildPath(dataset, params);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [dataset]: { ...f[dataset], [key]: value } }));
  const f = filters[dataset] ?? {};

  const fieldGroups = useMemo(() => {
    const groups = {};
    for (const t of meta.field_types) (groups[t.group] ??= []).push(t);
    return groups;
  }, [meta.field_types]);

  const exportCSV = () => {
    downloadFile(`indomock-${name}.csv`, `﻿${toCSV(data)}`, 'text/csv;charset=utf-8');
    toast(`Downloaded ${data.length} rows as CSV`);
  };
  const exportSQL = () => {
    downloadFile(`indomock-${name}.sql`, toSQL(data, { table: name, createTable }), 'application/sql;charset=utf-8');
    toast(`Exported ${data.length} SQL INSERT rows`);
  };
  const copySQL = async () => {
    const ok = await copyText(toSQL(data, { table: name, createTable }));
    toast(ok ? 'SQL copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <Card aria-labelledby="gen-config" className="lg:sticky lg:top-32">
        <CardHeader id="gen-config" title="Dataset" description={DATASET_COPY[dataset]} icon={Settings2} />
        <div className="space-y-5 p-4 sm:p-5">
          <Segmented label="Dataset" options={DATASETS} value={dataset} onChange={setDataset} className="grid w-full grid-cols-4" size="sm" />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="gen-rows" className="label mb-0">Rows</label>
              <input
                type="number"
                min={1}
                max={100}
                value={rows}
                aria-label="Rows (number)"
                onChange={(e) => setRows(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="input h-8 w-20 text-right font-mono tabular-nums"
              />
            </div>
            <input id="gen-rows" type="range" min={1} max={100} value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full cursor-pointer accent-accent" />
            <div className="mt-1 flex justify-between font-mono text-[11px] text-fg-muted" aria-hidden="true">
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>

          {dataset === 'users' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender" htmlFor="g-gender">
                <Select id="g-gender" value={f.gender ?? ''} onChange={(v) => setFilter('gender', v)}>
                  <option value="">Semua</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </Select>
              </Field>
              <Field label="Provinsi" htmlFor="g-prov">
                <Select id="g-prov" value={f.prov ?? ''} onChange={(v) => setFilter('prov', v)}>
                  <option value="">38 provinsi</option>
                  {meta.provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Select>
              </Field>
            </div>
          )}
          {dataset === 'products' && (
            <Field label="Kategori" htmlFor="g-cat">
              <Select id="g-cat" value={f.category ?? ''} onChange={(v) => setFilter('category', v)}>
                <option value="">Semua kategori</option>
                {meta.categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </Select>
            </Field>
          )}
          {dataset === 'transactions' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" htmlFor="g-status">
                <Select id="g-status" value={f.status ?? ''} onChange={(v) => setFilter('status', v)}>
                  <option value="">Semua</option>
                  {meta.transaction_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Payment" htmlFor="g-pay">
                <Select id="g-pay" value={f.payment_method ?? ''} onChange={(v) => setFilter('payment_method', v)}>
                  <option value="">Semua</option>
                  {meta.payment_methods.map((m) => <option key={m.slug} value={m.slug}>{m.label}</option>)}
                </Select>
              </Field>
            </div>
          )}

          {dataset === 'custom' && (
            <fieldset className="space-y-2">
              <div className="flex items-center justify-between">
                <legend className="label mb-0">Schema fields</legend>
                <span className="font-mono text-[11px] text-fg-muted">{fields.length}/40</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PRESETS).map((p) => (
                  <button key={p} type="button" onClick={() => setFields(presetFields(p))} className="rounded-md border border-line px-2 py-1 text-xs text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-fg">
                    {p}
                  </button>
                ))}
              </div>
              <ul className="space-y-2">
                {fields.map((fl, i) => (
                  <li key={fl.id}>
                    <div className="flex gap-2">
                      <input
                        value={fl.name}
                        onChange={(e) => setFields((all) => all.map((x) => (x.id === fl.id ? { ...x, name: e.target.value } : x)))}
                        aria-label={`Field ${i + 1} name`}
                        aria-invalid={!!fieldErrors[fl.id]}
                        aria-describedby={fieldErrors[fl.id] ? `fe-${fl.id}` : undefined}
                        className={cx('input h-9 min-w-0 flex-1 font-mono text-xs', fieldErrors[fl.id] && 'border-danger focus:border-danger focus:ring-danger/30')}
                        spellCheck={false}
                      />
                      <Select
                        value={fl.type}
                        onChange={(v) => setFields((all) => all.map((x) => (x.id === fl.id ? { ...x, type: v } : x)))}
                        aria-label={`Field ${i + 1} type`}
                        className="h-9 min-w-0 flex-1 text-xs"
                      >
                        {Object.entries(fieldGroups).map(([g, types]) => (
                          <optgroup key={g} label={g}>
                            {types.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                          </optgroup>
                        ))}
                        {!meta.field_types.length && <option value={fl.type}>{fl.type}</option>}
                      </Select>
                      <button
                        type="button"
                        onClick={() => setFields((all) => all.filter((x) => x.id !== fl.id))}
                        aria-label={`Remove field ${fl.name || i + 1}`}
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    {fieldErrors[fl.id] && <p id={`fe-${fl.id}`} role="alert" className="mt-1 text-xs text-danger">{fieldErrors[fl.id]}</p>}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="ghost"
                icon={Plus}
                disabled={fields.length >= 40}
                onClick={() => setFields((all) => [...all, mkField(`field_${all.length + 1}`, 'full_name')])}
                className="w-full border-dashed !border-line-strong"
              >
                Add field
              </Button>
            </fieldset>
          )}

          <Field label="Seed (optional)" htmlFor="g-seed" hint="Same seed + params → identical data. Great for snapshot tests.">
            <div className="flex gap-2">
              <input id="g-seed" value={seed} onChange={(e) => setSeed(e.target.value.slice(0, 64))} placeholder="random" className="input font-mono" spellCheck={false} />
              <Button variant="secondary" icon={Dices} aria-label="Use a random seed" title="Random seed" onClick={() => setSeed(String(Math.floor(Math.random() * 1e6)))} className="w-10 px-0" />
            </div>
          </Field>

          <div className="space-y-3 rounded-lg border border-line bg-surface-2/60 p-3">
            <p className="text-xs font-semibold text-fg">SQL export options</p>
            <Field label="Table name" htmlFor="g-table">
              <input id="g-table" value={tableName} onChange={(e) => setTableName(e.target.value.replace(/[^\w]/g, '_').slice(0, 48))} placeholder={dataset} className="input h-9 font-mono text-xs" spellCheck={false} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
              <input type="checkbox" checked={createTable} onChange={(e) => setCreateTable(e.target.checked)} className="size-4 accent-accent" />
              Include <code className="font-mono text-fg">CREATE TABLE</code> (PostgreSQL types)
            </label>
          </div>

          <Button variant="primary" size="lg" icon={RefreshCw} loading={result.status === 'loading'} disabled={!customValid} onClick={() => setNonce((n) => n + 1)} className="w-full">
            {seed ? 'Generate' : 'Regenerate'}
          </Button>
          {metaStatus === 'error' && (
            <p className="flex items-center gap-2 text-xs text-warn">
              <AlertCircle className="size-3.5" aria-hidden="true" /> Could not load filter options.
              <button type="button" onClick={reload} className="underline underline-offset-2">Retry</button>
            </p>
          )}
        </div>
      </Card>

      {/* ── Output ───────────────────────────────────────────────── */}
      <Card aria-labelledby="gen-output" className="min-w-0">
        <CardHeader
          id="gen-output"
          title="Output"
          icon={Braces}
          description={
            result.status === 'success'
              ? `${data.length} rows · ${formatBytes(new Blob([json]).size)} · ${result.ms} ms · seed ${result.meta?.seed}`
              : result.status === 'loading' ? 'Generating…' : 'Fix the error to continue'
          }
          actions={
            <Segmented
              label="Output view"
              size="sm"
              value={view}
              onChange={setView}
              options={[{ value: 'json', label: 'JSON', icon: FileJson }, { value: 'table', label: 'Table', icon: Table2 }]}
            />
          }
        />
        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3 sm:px-5">
          <CopyButton text={() => json} label="Copy JSON" toast={`Copied ${data.length} rows as JSON`} size="md" variant="primary" />
          <Button icon={FileSpreadsheet} onClick={exportCSV} disabled={!data.length}>Download CSV</Button>
          <Button icon={Database} onClick={exportSQL} disabled={!data.length}>Export SQL INSERT</Button>
          <Button variant="ghost" onClick={copySQL} disabled={!data.length} className="ml-auto">Copy SQL</Button>
        </div>

        <div className={cx('relative p-3 sm:p-4 transition-opacity duration-200', result.status === 'loading' && 'opacity-60')} aria-busy={result.status === 'loading'}>
          {result.status === 'error' ? (
            <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-danger/40 bg-danger-soft p-6 text-center">
              <AlertCircle className="size-6 text-danger" aria-hidden="true" />
              <p className="text-sm font-medium text-fg">{result.error}</p>
              {result.details && <pre className="max-w-full overflow-auto font-mono text-xs text-fg-muted">{JSON.stringify(result.details, null, 2)}</pre>}
              <Button size="sm" icon={RefreshCw} onClick={() => setNonce((n) => n + 1)}>Try again</Button>
            </div>
          ) : !result.rows ? (
            <div className="space-y-2 p-2" aria-label="Loading data">
              {Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${40 + ((i * 37) % 55)}%` }} />)}
            </div>
          ) : view === 'json' ? (
            <CodeView code={json} language="json" label="Generated JSON" />
          ) : (
            <DataTable rows={data} />
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 sm:px-5">
          <span className="shrink-0 font-mono text-[11px] font-bold text-accent-text">GET</span>
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg-muted" title={requestPath}>{requestPath}</code>
          <CopyButton text={() => `${window.location.origin}${requestPath}`} label="Copy request URL" toast="Request URL copied" iconOnly variant="ghost" />
        </div>
      </Card>
    </div>
  );
}
