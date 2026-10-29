import { Router } from 'express';
import { createRng } from '../generators/random.js';
import { generateUsers } from '../generators/users.js';
import { generateProducts } from '../generators/products.js';
import { generateTransactions, PAYMENT_METHODS, TRX_STATUSES } from '../generators/transactions.js';
import { generateCustom, FIELD_TYPE_LIST } from '../generators/custom.js';
import { CATEGORIES } from '../generators/data/catalog.js';
import { PROVINCES } from '../generators/data/regions.js';
import { isoWIB } from '../generators/format.js';
import { ApiError, errorType } from '../lib/errors.js';
import { parseCommon, filterParam, sleep, simulatedError, MAX_LIMIT, MAX_DELAY_MS } from '../lib/simulate.js';
import { toCSV } from '../../shared/exporters.js';

export const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || 'https://mock.hokacristian.com';

function sendError(res, status, message, details) {
  res.status(status).json({
    success: false,
    error: { code: status, type: errorType(status), message, ...(details ? { details } : {}) },
  });
}

/**
 * Wraps a generator with the shared developer features
 * (limit/seed/delay/status/format) and a consistent response envelope.
 */
function dataEndpoint(resource, filterNames, run) {
  return async (req, res) => {
    const started = performance.now();
    const abort = new AbortController();
    res.on('close', () => abort.abort());

    let common;
    try {
      // POST bodies may carry the common params too; query string wins.
      const body = req.method === 'POST' && req.body && typeof req.body === 'object' ? req.body : {};
      common = parseCommon({ ...body, ...req.query });
    } catch (err) {
      return sendError(res, err.status ?? 400, err.message, err.details);
    }

    await sleep(common.delay, abort.signal);
    if (abort.signal.aborted) return undefined;

    res.set('X-Simulated-Delay', String(common.delay));
    const finish = () => res.set('X-Response-Time', `${(performance.now() - started).toFixed(1)}ms`);

    if (common.simulatedStatus >= 400) {
      const { headers, body } = simulatedError(common.simulatedStatus, req.path);
      finish();
      return res.status(common.simulatedStatus).set(headers).json(body);
    }
    if (common.simulatedStatus === 204) {
      finish();
      return res.status(204).end();
    }

    const filters = Object.fromEntries(
      filterNames.map((n) => [n, filterParam(req.query, n) ?? req.body?.[n]]).filter(([, v]) => v !== undefined),
    );
    const rng = createRng(common.seed);

    let result;
    try {
      result = run(rng, { limit: common.limit, ...filters }, req);
    } catch (err) {
      if (err instanceof ApiError) return sendError(res, err.status, err.message, err.details);
      throw err;
    }
    const rows = Array.isArray(result) ? result : result.rows;

    res.status(common.simulatedStatus ?? 200).set('X-IndoMock-Seed', String(rng.seed));
    finish();

    if (common.format === 'csv') {
      res.type('text/csv; charset=utf-8');
      if (req.query.download !== undefined) res.attachment(`indomock-${resource}.csv`);
      return res.send(toCSV(rows));
    }

    return res.json({
      success: true,
      meta: {
        resource,
        count: rows.length,
        limit: common.limit,
        ...(result.available !== undefined ? { available: result.available } : {}),
        seed: rng.seed,
        filters,
        delay_ms: common.delay,
        generated_at: isoWIB(new Date()),
      },
      data: rows,
    });
  };
}

export function apiRouter() {
  const r = Router();

  r.get('/', (req, res) => {
    res.json({
      name: 'IndoMock API',
      version: 'v1',
      description: 'Mock data generator & live REST API untuk developer Indonesia.',
      base_url: `${PUBLIC_BASE}/api/v1`,
      docs: PUBLIC_BASE,
      common_params: {
        limit: `1–${MAX_LIMIT} (default 10)`,
        seed: 'Any string/number for reproducible output',
        delay: `Artificial latency in ms (0–${MAX_DELAY_MS})`,
        status: 'Simulate an HTTP status, e.g. 401, 404, 429, 500, 503 (alias: status_code)',
        format: 'json | csv',
      },
      endpoints: {
        'GET /users': { filters: { gender: ['male', 'female'], city: 'partial city name, e.g. bandung', prov: 'province name/alias/code, e.g. jabar, 31' } },
        'GET /products': { filters: { category: Object.keys(CATEGORIES), min_price: 'IDR', max_price: 'IDR' } },
        'GET /transactions': { filters: { status: Object.keys(TRX_STATUSES), payment_method: Object.keys(PAYMENT_METHODS) } },
        'GET|POST /custom': { filters: { fields: 'name:type,... (GET) or [{name,type}] (POST JSON body)' }, types: '/api/v1/custom/types' },
        'GET /regions': 'Provinces, kota/kabupaten and region codes',
        'GET /health': 'Liveness probe',
      },
    });
  });

  r.get('/health', (req, res) => res.json({ status: 'ok', uptime_s: Math.round(process.uptime()), time: isoWIB(new Date()) }));

  r.get('/regions', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      success: true,
      meta: { count: PROVINCES.length },
      data: PROVINCES.map((p) => ({
        code: p.code,
        name: p.name,
        island: p.island,
        aliases: p.aliases,
        cities: p.cities.map(([code, name]) => ({ code: `${p.code}.${code}`, name })),
      })),
    });
  });

  r.get('/meta', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      success: true,
      data: {
        categories: Object.entries(CATEGORIES).map(([slug, c]) => ({ slug, label: c.label, count: c.items.length })),
        payment_methods: Object.entries(PAYMENT_METHODS).map(([slug, m]) => ({ slug, label: m.label, type: m.type })),
        transaction_statuses: Object.keys(TRX_STATUSES),
        provinces: PROVINCES.map((p) => ({ code: p.code, name: p.name })),
        field_types: FIELD_TYPE_LIST,
      },
    });
  });

  r.get('/custom/types', (req, res) => res.json({ success: true, data: FIELD_TYPE_LIST }));

  r.get('/users', dataEndpoint('users', ['gender', 'city', 'prov'], (rng, o) => generateUsers(rng, o)));
  r.get('/products', dataEndpoint('products', ['category', 'min_price', 'max_price'], (rng, o) => generateProducts(rng, o)));
  r.get('/transactions', dataEndpoint('transactions', ['status', 'payment_method'], (rng, o) => generateTransactions(rng, o)));

  const custom = dataEndpoint('custom', [], (rng, o, req) => generateCustom(rng, { limit: o.limit, fields: req.body?.fields ?? req.query.fields }));
  r.get('/custom', custom);
  r.post('/custom', custom);

  r.use((req, res) => sendError(res, 404, `Endpoint ${req.method} ${req.baseUrl}${req.path} not found.`, { index: '/api/v1' }));
  return r;
}
