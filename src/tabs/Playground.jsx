import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, Square, Users, Store, Receipt, Blocks, Timer, HardDrive, ChevronRight, SlidersHorizontal, Inbox, WifiOff } from 'lucide-react';
import { Button, Card, CardHeader, CopyButton, Field, MethodBadge, Segmented, Select, StatusBadge, cx } from '../components/ui/primitives.jsx';
import { CodeView } from '../components/ui/CodeView.jsx';
import SnippetTabs from '../components/SnippetTabs.jsx';
import { useMeta } from '../lib/context.jsx';
import { buildPath, cleanParams, formatBytes, origin, timedFetch } from '../lib/api.js';
import { buildSnippet, SNIPPET_LANGS } from '../lib/snippets.js';
import { useElapsed } from '../lib/hooks.js';

const ENDPOINTS = [
  { id: 'users', icon: Users, title: 'Users', desc: 'Warga + NIK, HP, alamat' },
  { id: 'products', icon: Store, title: 'Products', desc: 'Inventaris warung/UMKM' },
  { id: 'transactions', icon: Receipt, title: 'Transactions', desc: 'QRIS, e-wallet, VA' },
  { id: 'custom', icon: Blocks, title: 'Custom', desc: 'Skema bebas via ?fields=' },
];

const INITIAL_PARAMS = {
  users: { limit: '5', gender: '', city: '', prov: '' },
  products: { limit: '5', category: '', min_price: '', max_price: '' },
  transactions: { limit: '3', status: '', payment_method: '' },
  custom: { limit: '5', fields: 'nama:full_name,nik:nik,hp:phone,operator:operator,kota:city' },
};

const STATUS_OPTIONS = [
  ['', 'None (real response)'],
  ['201', '201 Created'], ['204', '204 No Content'],
  ['400', '400 Bad Request'], ['401', '401 Unauthorized'], ['403', '403 Forbidden'], ['404', '404 Not Found'],
  ['422', '422 Unprocessable'], ['429', '429 Too Many Requests'],
  ['500', '500 Internal Error'], ['502', '502 Bad Gateway'], ['503', '503 Unavailable'], ['504', '504 Gateway Timeout'],
];
const DELAY_PRESETS = [['0', 'None'], ['300', '4G'], ['1500', '3G'], ['3000', '2G']];

export default function Playground() {
  const { meta } = useMeta();
  const [endpoint, setEndpoint] = useState('users');
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [common, setCommon] = useState({ delay: '', status: '', format: 'json', seed: '' });
  const [lang, setLang] = useState('curl');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const abortRef = useRef();
  const elapsed = useElapsed(loading);

  // `status` doubles as the transactions filter, so use the unambiguous alias there.
  const simKey = endpoint === 'transactions' ? 'status_code' : 'status';
  const query = useMemo(
    () => cleanParams({
      ...params[endpoint],
      delay: common.delay === '0' ? '' : common.delay,
      [simKey]: common.status,
      format: common.format === 'json' ? '' : common.format,
      seed: common.seed,
    }),
    [params, endpoint, common, simKey],
  );
  const path = buildPath(endpoint, query);
  const fullUrl = `${origin()}${path}`;

  const setParam = (key, value) => setParams((p) => ({ ...p, [endpoint]: { ...p[endpoint], [key]: value } }));
  const setC = (key, value) => setCommon((c) => ({ ...c, [key]: value }));

  const send = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const r = await timedFetch(path, { signal: controller.signal });
      setRes({ ...r, path });
    } catch (err) {
      if (err.name !== 'AbortError') setRes({ networkError: err.message, path });
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [path]);

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  // Ctrl/⌘ + Enter sends from anywhere in the playground.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [send]);

  // Fire one request on first mount so the response panel isn't empty.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { send(); }, []);

  const snippets = useMemo(
    () => SNIPPET_LANGS.map((l) => ({ ...l, code: buildSnippet(l.id, endpoint, query) })),
    [endpoint, query],
  );

  const body = res && !res.networkError
    ? res.json ? JSON.stringify(res.json, null, 2) : res.text || '(empty body)'
    : '';
  const p = params[endpoint];

  return (
    <div className="space-y-5">
      {/* Endpoint picker */}
      <div role="radiogroup" aria-label="Endpoint" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ENDPOINTS.map(({ id, icon: Icon, title, desc }) => {
          const active = endpoint === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setEndpoint(id)}
              className={cx(
                'group flex items-start gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-150',
                active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <span className={cx('grid size-8 shrink-0 place-items-center rounded-lg ring-1', active ? 'bg-accent text-accent-fg ring-transparent' : 'bg-surface-2 text-fg-muted ring-line')}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <MethodBadge />
                  <span className="truncate font-mono text-sm font-semibold text-fg">/{id}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-fg-muted">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* URL bar */}
      <div className="card flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
          <MethodBadge />
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-fg [scrollbar-width:none]" aria-label="Request URL">
            <span className="text-fg-muted">{origin()}</span>
            {path.split('?')[0]}
            {path.includes('?') && <span className="syn-str">?{path.split('?')[1]}</span>}
          </code>
          <CopyButton text={fullUrl} label="Copy URL" toast="URL copied" iconOnly variant="ghost" />
        </div>
        {loading ? (
          <Button variant="danger" size="lg" icon={Square} onClick={cancel} className="sm:w-36">
            Cancel <span className="font-mono tabular-nums">{(elapsed / 1000).toFixed(1)}s</span>
          </Button>
        ) : (
          <Button variant="primary" size="lg" icon={Send} onClick={send} className="sm:w-36">
            Send <span className="kbd hidden !border-accent-fg/30 !bg-transparent !text-accent-fg lg:inline">⌘↵</span>
          </Button>
        )}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* Request builder */}
        <Card aria-labelledby="pg-params">
          <CardHeader id="pg-params" title="Query parameters" icon={SlidersHorizontal} description="Changes update the URL & snippets live." />
          <div className="space-y-4 p-4 sm:p-5">
            <Field label="limit" htmlFor="pg-limit" hint="1–100">
              <input id="pg-limit" type="number" min={1} max={100} value={p.limit} onChange={(e) => setParam('limit', e.target.value)} className="input font-mono" />
            </Field>

            {endpoint === 'users' && (
              <>
                <Field label="gender" htmlFor="pg-gender">
                  <Select id="pg-gender" value={p.gender} onChange={(v) => setParam('gender', v)}>
                    <option value="">any</option><option value="male">male</option><option value="female">female</option>
                  </Select>
                </Field>
                <Field label="city" htmlFor="pg-city" hint="Partial match, e.g. bandung, surabaya, denpasar">
                  <input id="pg-city" value={p.city} onChange={(e) => setParam('city', e.target.value)} placeholder="bandung" className="input font-mono" />
                </Field>
                <Field label="prov" htmlFor="pg-prov" hint="Name, alias (jabar, dki) or code (32)">
                  <Select id="pg-prov" value={p.prov} onChange={(v) => setParam('prov', v)}>
                    <option value="">any</option>
                    {meta.provinces.map((x) => <option key={x.code} value={x.code}>{x.code} · {x.name}</option>)}
                  </Select>
                </Field>
              </>
            )}
            {endpoint === 'products' && (
              <>
                <Field label="category" htmlFor="pg-cat">
                  <Select id="pg-cat" value={p.category} onChange={(v) => setParam('category', v)}>
                    <option value="">any</option>
                    {meta.categories.map((c) => <option key={c.slug} value={c.slug}>{c.slug}</option>)}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="min_price" htmlFor="pg-min" hint="IDR">
                    <input id="pg-min" type="number" min={0} step={500} value={p.min_price} onChange={(e) => setParam('min_price', e.target.value)} placeholder="1000" className="input font-mono" />
                  </Field>
                  <Field label="max_price" htmlFor="pg-max" hint="IDR">
                    <input id="pg-max" type="number" min={0} step={500} value={p.max_price} onChange={(e) => setParam('max_price', e.target.value)} placeholder="50000" className="input font-mono" />
                  </Field>
                </div>
              </>
            )}
            {endpoint === 'transactions' && (
              <>
                <Field label="status" htmlFor="pg-tstatus">
                  <Select id="pg-tstatus" value={p.status} onChange={(v) => setParam('status', v)}>
                    <option value="">any</option>
                    {meta.transaction_statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="payment_method" htmlFor="pg-pay">
                  <Select id="pg-pay" value={p.payment_method} onChange={(v) => setParam('payment_method', v)}>
                    <option value="">any</option>
                    {meta.payment_methods.map((m) => <option key={m.slug} value={m.slug}>{m.slug}</option>)}
                  </Select>
                </Field>
              </>
            )}
            {endpoint === 'custom' && (
              <Field label="fields" htmlFor="pg-fields" hint="Comma-separated name:type pairs. See /api/v1/custom/types">
                <textarea id="pg-fields" rows={3} value={p.fields} onChange={(e) => setParam('fields', e.target.value)} className="input h-auto py-2 font-mono text-xs leading-5" spellCheck={false} />
              </Field>
            )}

            <div className="space-y-4 border-t border-line pt-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Developer params</p>
              <Field label="delay (ms)" htmlFor="pg-delay" hint="Simulated latency, max 10000">
                <div className="flex gap-2">
                  <input id="pg-delay" type="number" min={0} max={10000} step={100} value={common.delay} onChange={(e) => setC('delay', e.target.value)} placeholder="0" className="input w-24 font-mono" />
                  <Segmented label="Delay presets" size="sm" value={common.delay || '0'} onChange={(v) => setC('delay', v)} options={DELAY_PRESETS.map(([value, label]) => ({ value, label }))} className="flex-1" />
                </div>
              </Field>
              <Field label={simKey === 'status' ? 'status (HTTP code)' : 'status_code (HTTP code)'} htmlFor="pg-status">
                <Select id="pg-status" value={common.status} onChange={(v) => setC('status', v)}>
                  {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="label" id="pg-format-l">format</span>
                  <Segmented label="Response format" size="sm" value={common.format} onChange={(v) => setC('format', v)} options={[{ value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }]} className="w-full" />
                </div>
                <Field label="seed" htmlFor="pg-seed">
                  <input id="pg-seed" value={common.seed} onChange={(e) => setC('seed', e.target.value.slice(0, 64))} placeholder="random" className="input h-9 font-mono" spellCheck={false} />
                </Field>
              </div>
            </div>
          </div>
        </Card>

        {/* Response */}
        <Card aria-labelledby="pg-response" className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 sm:px-5">
            <h2 id="pg-response" className="text-sm font-semibold text-fg">Response</h2>
            <div aria-live="polite" className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <span className="size-2 animate-pulse rounded-full bg-info" aria-hidden="true" />
                  Waiting… {elapsed} ms
                </span>
              ) : res?.networkError ? (
                <StatusBadge status={0} text="Network error" />
              ) : res ? (
                <>
                  <StatusBadge status={res.status} text={res.statusText} />
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums"><Timer className="size-3.5" aria-hidden="true" />{res.ms} ms</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums"><HardDrive className="size-3.5" aria-hidden="true" />{formatBytes(res.size)}</span>
                </>
              ) : null}
            </div>
            {res && !res.networkError && (
              <div className="ml-auto flex items-center gap-2">
                <button type="button" aria-expanded={showHeaders} onClick={() => setShowHeaders((s) => !s)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">
                  <ChevronRight className={cx('size-3.5 transition-transform duration-150', showHeaders && 'rotate-90')} aria-hidden="true" />
                  Headers
                </button>
                <CopyButton text={body} label="Copy" toast="Response copied" />
              </div>
            )}
          </div>

          {showHeaders && res?.headers && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-line bg-surface-2/50 px-4 py-3 font-mono text-xs sm:px-5">
              {res.headers.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="syn-key">{k}</dt>
                  <dd className="min-w-0 break-all text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className={cx('p-3 sm:p-4 transition-opacity duration-200', loading && 'opacity-50')} aria-busy={loading}>
            {res?.networkError ? (
              <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong text-center">
                <WifiOff className="size-6 text-danger" aria-hidden="true" />
                <p className="text-sm font-medium text-fg">Request failed before a response arrived</p>
                <p className="text-xs text-fg-muted">{res.networkError}</p>
              </div>
            ) : res ? (
              <CodeView code={body} language={res.json ? 'json' : 'text'} label="Response body" maxHeight="34rem" />
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-fg-muted">
                <Inbox className="size-6" aria-hidden="true" />
                <p className="text-sm">Hit <span className="font-semibold text-fg">Send</span> to see the live response.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card aria-label="Client code snippets">
        <CardHeader title="Use it in your app" description="Generated from the current request — copy & paste into your project." />
        <SnippetTabs snippets={snippets} active={lang} onChange={setLang} />
      </Card>
    </div>
  );
}
