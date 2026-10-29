import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { getJSON, API_PREFIX } from './api.js';

/* ── Toasts ─────────────────────────────────────────────────────────────── */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const dismiss = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), []);
  const push = useCallback(
    (message, tone = 'success') => {
      const tid = ++id.current;
      setToasts((t) => [...t.slice(-2), { id: tid, message, tone }]);
      setTimeout(() => dismiss(tid), 3200);
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-fg shadow-lg"
          >
            {t.tone === 'error' ? (
              <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-accent-text" aria-hidden="true" />
            )}
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-mr-1 ml-1 grid size-6 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── API metadata (categories, provinces, payment methods, field types) ── */
const FALLBACK_META = {
  categories: [],
  payment_methods: [],
  transaction_statuses: ['settlement', 'pending', 'expired'],
  provinces: [],
  field_types: [],
};
const MetaCtx = createContext({ meta: FALLBACK_META, status: 'loading', reload: () => {} });
export const useMeta = () => useContext(MetaCtx);

export function MetaProvider({ children }) {
  const [state, setState] = useState({ meta: FALLBACK_META, status: 'loading' });
  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    getJSON(`${API_PREFIX}/meta`)
      .then((json) => setState({ meta: json.data, status: 'ready' }))
      .catch(() => setState({ meta: FALLBACK_META, status: 'error' }));
  }, []);
  useEffect(load, [load]);
  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <MetaCtx.Provider value={value}>{children}</MetaCtx.Provider>;
}
