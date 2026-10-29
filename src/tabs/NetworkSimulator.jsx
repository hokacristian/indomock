import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Wifi, Signal, SignalMedium, SignalLow, WifiOff, Play, RotateCcw, ServerCrash, Lock, ShieldX, SearchX,
  Ban, FileWarning, Hourglass, CloudOff, CheckCircle2, Activity, ListChecks, Users, Store, Receipt, BatteryFull,
} from 'lucide-react';
import { Button, Card, CardHeader, Field, Segmented, StatusBadge, cx } from '../components/ui/primitives.jsx';
import SnippetTabs from '../components/SnippetTabs.jsx';
import { buildPath, origin, timedFetch } from '../lib/api.js';
import { useElapsed } from '../lib/hooks.js';

const NETWORKS = [
  { id: 'wifi', label: 'Wi-Fi / Fiber', delay: 0, icon: Wifi, note: 'Baseline' },
  { id: '4g', label: '4G LTE', delay: 300, icon: Signal, note: '~300 ms' },
  { id: '3g', label: '3G lambat', delay: 1500, icon: SignalMedium, note: '~1.5 s' },
  { id: '2g', label: 'EDGE / 2G', delay: 3500, icon: SignalLow, note: '~3.5 s' },
  { id: 'lost', label: 'Sinyal hilang', delay: 8000, icon: WifiOff, note: '8 s → timeout' },
];

const SCENARIOS = [
  { code: 200, label: 'Success' },
  { code: 400, label: 'Bad request' },
  { code: 401, label: 'Unauthorized' },
  { code: 403, label: 'Forbidden' },
  { code: 404, label: 'Not found' },
  { code: 422, label: 'Validation' },
  { code: 429, label: 'Rate limited' },
  { code: 500, label: 'Server error' },
  { code: 503, label: 'Maintenance' },
];

/** What a well-built app should show for each failure — copy in Bahasa Indonesia, like a real ID app. */
const ERROR_UI = {
  400: { icon: FileWarning, title: 'Permintaan tidak valid', body: 'Ada data yang tidak sesuai. Periksa kembali isian kamu.', action: 'Coba lagi' },
  401: { icon: Lock, title: 'Sesi kamu berakhir', body: 'Demi keamanan, silakan masuk kembali untuk melanjutkan.', action: 'Masuk ulang' },
  403: { icon: ShieldX, title: 'Akses ditolak', body: 'Akun kamu tidak punya izin untuk membuka halaman ini.', action: 'Kembali' },
  404: { icon: SearchX, title: 'Data tidak ditemukan', body: 'Mungkin sudah dihapus atau tautannya salah.', action: 'Ke beranda' },
  422: { icon: FileWarning, title: 'Data belum lengkap', body: 'Format email atau nomor HP belum sesuai.', action: 'Perbaiki' },
  429: { icon: Ban, title: 'Terlalu banyak percobaan', body: 'Tunggu sebentar sebelum mencoba lagi.', action: 'Coba lagi' },
  500: { icon: ServerCrash, title: 'Server sedang bermasalah', body: 'Bukan salah kamu — tim kami sedang memperbaikinya.', action: 'Coba lagi' },
  503: { icon: CloudOff, title: 'Sedang maintenance', body: 'Layanan akan kembali normal sebentar lagi.', action: 'Coba lagi' },
};

const CHECKLIST = {
  loading: ['Show a skeleton within 100 ms — not a blank screen', 'Keep the UI interactive; allow cancel/back', 'Show progress copy after ~1 s ("Memuat data…")'],
  success: ['Render data; reserve layout space to avoid jumps', 'Cache the response for instant revisits'],
  timeout: ['Abort the request with a client timeout (AbortController / Dio receiveTimeout)', 'Explain it is the connection, not the user', 'Offer a one-tap retry, keep any typed input'],
  network: ['Detect offline vs server failure', 'Queue writes and sync when back online'],
  401: ['Clear the token & redirect to login', 'Return the user to where they were after re-auth'],
  429: ['Respect the Retry-After header', 'Disable the retry button with a countdown'],
  500: ['Never show stack traces', 'Retry with exponential backoff (idempotent GETs only)', 'Log with a request id for support'],
  503: ['Read Retry-After; show a maintenance screen', 'Poll less aggressively'],
  default: ['Show a specific, human message + recovery action', 'Keep the error near the content that failed'],
};

const DATASETS = [
  { value: 'users', label: 'Users', icon: Users },
  { value: 'products', label: 'Products', icon: Store },
  { value: 'transactions', label: 'Transaksi', icon: Receipt },
];

function PhoneRow({ dataset, item }) {
  if (dataset === 'users') {
    const initials = item.name.replace(/^(I|Ni)\s/, '').split(' ').slice(0, 2).map((w) => w[0]).join('');
    return (
      <>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-bold text-accent-text">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">{item.name}</span>
          <span className="block truncate text-[11px] text-fg-muted">{item.address.city} · {item.operator}</span>
        </span>
      </>
    );
  }
  if (dataset === 'products') {
    return (
      <>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">{item.name}</span>
          <span className="block truncate text-[11px] text-fg-muted">{item.category_label} · stok {item.stock}</span>
        </span>
        <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-fg">{item.price_formatted}</span>
      </>
    );
  }
  const tone = item.status === 'settlement' ? 'text-accent-text bg-accent-soft' : item.status === 'pending' ? 'text-warn bg-warn-soft' : 'text-fg-muted bg-surface-3';
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[12px] font-medium text-fg">{item.trx_id}</span>
        <span className="block truncate text-[11px] text-fg-muted">{item.payment.label}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="font-mono text-xs font-semibold tabular-nums text-fg">{item.total_formatted}</span>
        <span className={cx('rounded px-1 text-[10px] font-semibold', tone)}>{item.status}</span>
      </span>
    </>
  );
}

function PhoneScreen({ state, dataset, elapsed, timeoutMs, onRetry, retryAfter }) {
  const title = { users: 'Kontak Pelanggan', products: 'Stok Warung', transactions: 'Riwayat Transaksi' }[dataset];

  let content;
  if (state.phase === 'idle') {
    content = (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <Play className="size-6 text-fg-muted" aria-hidden="true" />
        <p className="text-sm text-fg-muted">Pick a network & scenario, then run the simulation.</p>
      </div>
    );
  } else if (state.phase === 'loading') {
    content = (
      <div className="space-y-2 p-3" aria-label="Loading">
        {elapsed > 1000 && <p className="animate-fade-up px-1 pb-1 text-[11px] text-fg-muted">Memuat data… koneksi kamu agak lambat</p>}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <div className="skeleton size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 rounded" style={{ width: `${55 + ((i * 17) % 35)}%` }} />
              <div className="skeleton h-2.5 w-2/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (state.phase === 'success') {
    content = state.rows.length ? (
      <ul className="divide-y divide-line">
        {state.rows.map((item, i) => (
          <li key={i} className="animate-fade-up flex items-center gap-3 px-3 py-2.5" style={{ animationDelay: `${i * 40}ms` }}>
            <PhoneRow dataset={dataset} item={item} />
          </li>
        ))}
      </ul>
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <CheckCircle2 className="size-7 text-accent-text" aria-hidden="true" />
        <p className="text-sm font-semibold text-fg">Berhasil</p>
        <p className="text-xs text-fg-muted">Server returned {state.status} with no content.</p>
      </div>
    );
  } else {
    const ui = state.phase === 'timeout'
      ? { icon: Hourglass, title: 'Koneksi lambat', body: `Server tidak merespons dalam ${(timeoutMs / 1000).toFixed(1)} detik. Periksa sinyal kamu lalu coba lagi.`, action: 'Coba lagi' }
      : state.phase === 'network'
        ? { icon: WifiOff, title: 'Tidak ada koneksi', body: 'Periksa Wi-Fi atau data seluler kamu.', action: 'Coba lagi' }
        : ERROR_UI[state.status] ?? ERROR_UI[500];
    const Icon = ui.icon;
    content = (
      <div role="alert" className="animate-fade-up flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-danger-soft">
          <Icon className="size-7 text-danger" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">{ui.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">{ui.body}</p>
          {state.status === 429 && retryAfter && <p className="mt-1 font-mono text-[11px] text-warn">Retry-After: {retryAfter}s</p>}
        </div>
        <button type="button" onClick={onRetry} className="mt-1 h-10 rounded-full bg-accent px-5 text-xs font-semibold text-accent-fg transition-transform active:scale-95">
          {ui.action}
        </button>
        {state.status && <span className="font-mono text-[10px] text-fg-muted">HTTP {state.status}</span>}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="rounded-[2.2rem] border border-line-strong bg-surface-3 p-2 shadow-xl">
        <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[1.8rem] bg-canvas">
          <div className="flex items-center justify-between px-5 pb-1 pt-3 font-mono text-[11px] font-semibold text-fg">
            <span>09:41</span>
            <span className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
            <span className="flex items-center gap-1 text-fg-muted" aria-hidden="true">
              <Signal className="size-3" /><BatteryFull className="size-3.5" />
            </span>
          </div>
          <div className="border-b border-line px-4 pb-2.5 pt-2">
            <p className="text-[11px] font-medium text-accent-text">WarungKu</p>
            <p className="text-base font-semibold text-fg">{title}</p>
          </div>
          {state.phase === 'loading' && (
            <div className="h-0.5 w-full bg-surface-3" aria-hidden="true">
              <div className="h-full origin-left bg-info transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${Math.min(1, elapsed / timeoutMs)})` }} />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
        </div>
      </div>
    </div>
  );
}

function handlingSnippets(url, timeoutMs) {
  return [
    {
      id: 'react',
      label: 'React',
      code: `const [state, setState] = useState({ phase: 'loading' });

async function load() {
  setState({ phase: 'loading' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), ${timeoutMs});

  try {
    const res = await fetch('${url}', { signal: controller.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setState({
        phase: 'error',
        status: res.status,
        retryAfter: Number(res.headers.get('Retry-After')) || null,
        message: body.error?.message,
      });
    }
    const { data } = await res.json();
    setState({ phase: 'success', data });
  } catch (err) {
    const timedOut = controller.signal.reason === 'timeout';
    setState({ phase: timedOut ? 'timeout' : 'network' });
  } finally {
    clearTimeout(timer);
  }
}`,
    },
    {
      id: 'flutter',
      label: 'Flutter · Dio',
      code: `final dio = Dio(BaseOptions(
  connectTimeout: const Duration(seconds: 5),
  receiveTimeout: const Duration(milliseconds: ${timeoutMs}),
));

Future<void> load() async {
  emit(const LoadState.loading());
  try {
    final res = await dio.get('${url}');
    emit(LoadState.success(res.data['data'] as List));
  } on DioException catch (e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        emit(const LoadState.timeout()); // "Koneksi lambat"
      case DioExceptionType.connectionError:
        emit(const LoadState.offline()); // "Tidak ada koneksi"
      case DioExceptionType.badResponse:
        final code = e.response?.statusCode ?? 0;
        if (code == 401) return logoutAndRedirect();
        final retryAfter = int.tryParse(
            e.response?.headers.value('retry-after') ?? '');
        emit(LoadState.error(code, retryAfter: retryAfter));
      default:
        emit(const LoadState.error(0));
    }
  }
}`,
    },
  ];
}

export default function NetworkSimulator() {
  const [network, setNetwork] = useState('3g');
  const [scenario, setScenario] = useState(200);
  const [dataset, setDataset] = useState('users');
  const [timeoutMs, setTimeoutMs] = useState(5000);
  const [state, setState] = useState({ phase: 'idle' });
  const [log, setLog] = useState([]);
  const [lang, setLang] = useState('react');
  const abortRef = useRef();
  const elapsed = useElapsed(state.phase === 'loading');

  const net = NETWORKS.find((n) => n.id === network);
  const simKey = dataset === 'transactions' ? 'status_code' : 'status';
  const path = buildPath(dataset, { limit: 6, delay: net.delay || '', [simKey]: scenario === 200 ? '' : scenario });

  const run = async () => {
    abortRef.current?.abort('superseded');
    const controller = new AbortController();
    abortRef.current = controller;
    const t0 = performance.now();
    const stamp = () => Math.round(performance.now() - t0);
    setState({ phase: 'loading' });
    setLog([{ t: 0, kind: 'req', text: `GET ${path}` }, { t: 0, kind: 'info', text: `client timeout = ${timeoutMs} ms` }]);
    const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);

    try {
      const r = await timedFetch(path, { signal: controller.signal });
      const retryAfter = r.headers.find(([k]) => k === 'retry-after')?.[1];
      setLog((l) => [...l, { t: stamp(), kind: r.ok ? 'ok' : 'err', text: `${r.status} ${r.statusText} · ${r.ms} ms`, status: r.status }]);
      if (r.ok) setState({ phase: 'success', rows: r.json?.data ?? [], status: r.status });
      else setState({ phase: 'error', status: r.status, retryAfter });
    } catch {
      const reason = controller.signal.reason;
      if (reason === 'superseded') return;
      if (reason === 'timeout') {
        setLog((l) => [...l, { t: stamp(), kind: 'err', text: `Aborted by client timeout (${timeoutMs} ms)` }]);
        setState({ phase: 'timeout' });
      } else {
        setLog((l) => [...l, { t: stamp(), kind: 'err', text: 'Network error (offline / CORS / DNS)' }]);
        setState({ phase: 'network' });
      }
    } finally {
      clearTimeout(timer);
    }
  };

  useEffect(() => () => abortRef.current?.abort('superseded'), []);

  const checklistKey = state.phase === 'error' ? (CHECKLIST[state.status] ? state.status : 'default') : state.phase === 'idle' ? 'loading' : state.phase;
  const willTimeout = net.delay >= timeoutMs;
  const snippets = useMemo(() => handlingSnippets(`${origin()}${path}`, timeoutMs), [path, timeoutMs]);

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card aria-labelledby="sim-net">
            <CardHeader id="sim-net" title="1 · Network profile" icon={Signal} description="Applied via ?delay=<ms> on the real API." />
            <div role="radiogroup" aria-labelledby="sim-net" className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-5">
              {NETWORKS.map(({ id, label, icon: Icon, note, delay }) => {
                const active = id === network;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setNetwork(id)}
                    className={cx(
                      'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-[border-color,background-color] duration-150',
                      active ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong hover:bg-surface-2',
                    )}
                  >
                    <Icon className={cx('size-4', active ? 'text-accent-text' : 'text-fg-muted')} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-medium text-fg">{label}</span>
                      <span className="block font-mono text-[11px] text-fg-muted">{delay ? `delay=${delay}` : 'delay=0'} · {note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card aria-labelledby="sim-err">
            <CardHeader id="sim-err" title="2 · Response scenario" icon={ServerCrash} description="Applied via ?status=<code>. Error bodies & headers (Retry-After, WWW-Authenticate) are realistic." />
            <div role="radiogroup" aria-labelledby="sim-err" className="flex flex-wrap gap-2 p-4 sm:p-5">
              {SCENARIOS.map(({ code, label }) => {
                const active = code === scenario;
                return (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setScenario(code)}
                    className={cx(
                      'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-[border-color,background-color] duration-150',
                      active ? 'border-accent bg-accent-soft text-fg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    <span className={cx('font-mono text-xs font-bold', code >= 500 ? 'text-danger' : code >= 400 ? 'text-warn' : 'text-accent-text')}>{code}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card aria-labelledby="sim-client">
            <CardHeader id="sim-client" title="3 · Client settings" icon={Hourglass} />
            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <span className="label">Dataset</span>
                <Segmented label="Dataset" size="sm" value={dataset} onChange={setDataset} options={DATASETS} className="w-full" />
              </div>
              <Field label={`Client timeout · ${(timeoutMs / 1000).toFixed(1)} s`} htmlFor="sim-timeout" hint={willTimeout ? 'Delay ≥ timeout — this request will time out.' : 'Your app aborts the request after this long.'}>
                <input id="sim-timeout" type="range" min={1000} max={10000} step={500} value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))} className="w-full cursor-pointer accent-accent" />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 sm:px-5">
              <Button variant="primary" size="lg" icon={state.phase === 'idle' ? Play : RotateCcw} loading={state.phase === 'loading'} onClick={run}>
                {state.phase === 'loading' ? `Running… ${(elapsed / 1000).toFixed(1)}s` : state.phase === 'idle' ? 'Run simulation' : 'Run again'}
              </Button>
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg-muted" title={path}>{path}</code>
            </div>
          </Card>
        </div>

        {/* Device preview */}
        <div className="space-y-4 lg:sticky lg:top-32">
          <PhoneScreen state={state} dataset={dataset} elapsed={elapsed} timeoutMs={timeoutMs} onRetry={run} retryAfter={state.retryAfter} />
          <div className="flex justify-center" aria-live="polite">
            {state.phase === 'loading' && <span className="font-mono text-xs text-fg-muted tabular-nums">waiting {elapsed} ms</span>}
            {(state.phase === 'success' || state.phase === 'error') && <StatusBadge status={state.status} text={state.phase === 'success' ? 'OK' : 'Error'} />}
            {state.phase === 'timeout' && <StatusBadge status={0} text="Client timeout" />}
            {state.phase === 'network' && <StatusBadge status={0} text="Network error" />}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card aria-labelledby="sim-log">
          <CardHeader id="sim-log" title="Request timeline" icon={Activity} />
          <ol className="min-h-32 space-y-1.5 p-4 font-mono text-xs sm:p-5">
            {log.length === 0 && <li className="text-fg-muted">No requests yet.</li>}
            {log.map((e, i) => (
              <li key={i} className="animate-fade-up flex gap-3">
                <span className="w-16 shrink-0 text-right tabular-nums text-fg-muted">+{e.t} ms</span>
                <span className={cx(e.kind === 'ok' && 'text-accent-text', e.kind === 'err' && 'text-danger', e.kind === 'req' && 'syn-key', e.kind === 'info' && 'text-fg-muted', 'min-w-0 break-all')}>
                  {e.kind === 'req' ? '→ ' : e.kind === 'info' ? '· ' : '← '}{e.text}
                </span>
              </li>
            ))}
          </ol>
          <div className="border-t border-line p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-fg">
              <ListChecks className="size-4 text-accent-text" aria-hidden="true" />
              Your app should…
            </p>
            <ul className="space-y-1.5 text-sm text-fg-muted">
              {CHECKLIST[checklistKey].map((c) => (
                <li key={c} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card aria-label="Handling code">
          <CardHeader title="Handle every state" description="Loading → success / error / timeout / offline, with the timeout you picked." />
          <SnippetTabs snippets={snippets} active={lang} onChange={setLang} maxHeight="24rem" />
        </Card>
      </div>
    </div>
  );
}
