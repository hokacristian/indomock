export const API_PREFIX = '/api/v1';
export const PUBLIC_ORIGIN = 'https://mock.hokacristian.com';

/** Origin used for display & snippets: the real site in prod, the local one in dev. */
export const origin = () => (typeof window !== 'undefined' ? window.location.origin : PUBLIC_ORIGIN);

/** Drop empty values so URLs stay clean. */
export function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ''),
  );
}

export function buildPath(resource, params = {}) {
  const qs = new URLSearchParams(cleanParams(params)).toString();
  return `${API_PREFIX}/${resource}${qs ? `?${qs}` : ''}`;
}

const INTERESTING_HEADERS = [
  'content-type', 'x-response-time', 'x-indomock-seed', 'x-simulated-delay', 'retry-after',
  'www-authenticate', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'cache-control',
];

/**
 * fetch() wrapper that measures wall-clock latency and never throws on HTTP
 * errors — it resolves with a normalized response object instead.
 * Throws only on network failure / abort.
 */
export async function timedFetch(path, { method = 'GET', body, signal } = {}) {
  const started = performance.now();
  const res = await fetch(path, {
    method,
    signal,
    headers: { Accept: 'application/json, text/csv', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const ms = Math.round(performance.now() - started);
  const contentType = res.headers.get('content-type') ?? '';
  let json;
  if (contentType.includes('json') && text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
  }
  const headers = INTERESTING_HEADERS.map((h) => [h, res.headers.get(h)]).filter(([, v]) => v !== null);
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    ms,
    size: new Blob([text]).size,
    contentType,
    headers,
    text,
    json,
  };
}

export async function getJSON(path, signal) {
  const r = await timedFetch(path, { signal });
  if (!r.ok || !r.json) throw new Error(r.json?.error?.message ?? `HTTP ${r.status}`);
  return r.json;
}

export const formatBytes = (n) => (n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(2)} MB`);
