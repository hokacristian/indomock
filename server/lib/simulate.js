/**
 * Developer query params shared by every data endpoint:
 *   ?limit  ?seed  ?delay=<ms>  ?status=<http code>  ?format=json|csv
 */
import { ApiError, STATUS_TEXT, errorType } from './errors.js';

export const MAX_LIMIT = 100;
export const DEFAULT_LIMIT = 10;
export const MAX_DELAY_MS = 10000;

const first = (v) => (Array.isArray(v) ? v[0] : v);

export function parseCommon(query) {
  const rawLimit = first(query.limit);
  let limit = DEFAULT_LIMIT;
  if (rawLimit !== undefined && rawLimit !== '') {
    const n = Number(rawLimit);
    if (!Number.isFinite(n)) throw new ApiError(400, `limit must be a number between 1 and ${MAX_LIMIT}.`);
    limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(n)));
  }

  const rawDelay = first(query.delay);
  let delay = 0;
  if (rawDelay !== undefined && rawDelay !== '') {
    const n = Number(rawDelay);
    if (!Number.isFinite(n) || n < 0) throw new ApiError(400, `delay must be a non-negative number of milliseconds (max ${MAX_DELAY_MS}).`);
    delay = Math.min(MAX_DELAY_MS, Math.floor(n));
  }

  // ?status is shared with the transactions filter (settlement/pending/expired):
  // a 3-digit number simulates an HTTP status, anything else is a data filter.
  // ?status_code= is an unambiguous alias.
  const rawStatus = first(query.status_code) ?? first(query.status);
  let simulatedStatus;
  if (rawStatus !== undefined && /^\d{3}$/.test(String(rawStatus))) {
    const code = Number(rawStatus);
    if (code < 200 || code > 599 || (code >= 300 && code < 400)) {
      throw new ApiError(400, `Simulated status ${code} is not supported. Use 2xx, 4xx or 5xx.`);
    }
    simulatedStatus = code;
  }

  const format = String(first(query.format) ?? 'json').toLowerCase();
  if (!['json', 'csv'].includes(format)) throw new ApiError(400, `format must be "json" or "csv".`);

  const seed = first(query.seed);
  if (seed !== undefined && String(seed).length > 64) throw new ApiError(400, 'seed must be at most 64 characters.');

  return { limit, delay, simulatedStatus, format, seed: seed === '' ? undefined : seed };
}

/** Value of a filter param, ignoring ?status when it was used as an HTTP code. */
export function filterParam(query, name) {
  const v = first(query[name]);
  if (name === 'status' && v !== undefined && /^\d{3}$/.test(String(v))) return undefined;
  return v === '' ? undefined : v;
}

export const sleep = (ms, signal) =>
  new Promise((resolve) => {
    if (!ms) return resolve();
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });

const SIMULATED_MESSAGES = {
  400: 'Simulated bad request: one or more parameters are invalid.',
  401: 'Simulated unauthorized: missing or invalid Bearer token.',
  403: 'Simulated forbidden: your API key does not have access to this resource.',
  404: 'Simulated not found: the requested resource does not exist.',
  405: 'Simulated method not allowed.',
  408: 'Simulated request timeout: the server gave up waiting for the request.',
  409: 'Simulated conflict: resource state has changed, please refresh.',
  422: 'Simulated validation error: the request was well-formed but contains semantic errors.',
  429: 'Simulated rate limit: too many requests, slow down.',
  500: 'Simulated internal server error: something went wrong on our side.',
  502: 'Simulated bad gateway: upstream service returned an invalid response.',
  503: 'Simulated service unavailable: server is under maintenance.',
  504: 'Simulated gateway timeout: upstream service did not respond in time.',
};

/** Realistic error payload + headers for a simulated HTTP failure. */
export function simulatedError(status, path) {
  const headers = {};
  let extra = {};
  if (status === 401) headers['WWW-Authenticate'] = 'Bearer realm="IndoMock", error="invalid_token"';
  if (status === 405) headers.Allow = 'GET, POST, OPTIONS';
  if (status === 429) {
    headers['Retry-After'] = '30';
    headers['X-RateLimit-Limit'] = '60';
    headers['X-RateLimit-Remaining'] = '0';
    extra = { retry_after_seconds: 30 };
  }
  if (status === 503) {
    headers['Retry-After'] = '120';
    extra = { retry_after_seconds: 120 };
  }
  if (status === 422) {
    extra = { errors: [{ field: 'email', message: 'Format email tidak valid.' }, { field: 'phone', message: 'Nomor HP harus diawali +62 atau 08.' }] };
  }
  return {
    headers,
    body: {
      success: false,
      error: {
        code: status,
        type: errorType(status),
        message: SIMULATED_MESSAGES[status] ?? `Simulated ${STATUS_TEXT[status] ?? 'HTTP'} response.`,
        simulated: true,
        ...extra,
      },
      meta: { path, request_id: `req_${Math.random().toString(36).slice(2, 12)}`, timestamp: new Date().toISOString() },
    },
  };
}
