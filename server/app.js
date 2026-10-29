import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { apiRouter } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const EXPOSED_HEADERS = [
  'X-Response-Time', 'X-IndoMock-Seed', 'X-Simulated-Delay', 'Retry-After',
  'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'WWW-Authenticate',
].join(', ');

/** Public API → open CORS. */
function cors(req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': EXPOSED_HEADERS,
    'Access-Control-Max-Age': '86400',
  });
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

/** Small fixed-window, in-memory rate limiter (per IP) for the public API. */
function rateLimit({ windowMs = 60_000, max = 180 } = {}) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.reset <= now) hits.delete(ip);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.set({
      'X-RateLimit-Limit': String(max),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(entry.reset / 1000)),
    });
    if (entry.count > max) {
      const retry = Math.ceil((entry.reset - now) / 1000);
      res.set('Retry-After', String(retry));
      return res.status(429).json({
        success: false,
        error: { code: 429, type: 'TOO_MANY_REQUESTS', message: `Rate limit exceeded (${max} req/min). Retry in ${retry}s.`, simulated: false },
      });
    }
    return next();
  };
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Behind a reverse proxy (nginx/Caddy/Cloudflare) on the same host by default.
  app.set('trust proxy', process.env.TRUST_PROXY ?? 'loopback');
  app.set('json spaces', 2);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'https://api.dicebear.com'],
          'connect-src': ["'self'"],
          // TLS is terminated by the proxy; don't force https on plain-http local runs.
          'upgrade-insecure-requests': null,
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      strictTransportSecurity: process.env.NODE_ENV === 'production',
    }),
  );
  app.use(compression());

  app.use(
    '/api',
    cors,
    rateLimit({ max: Number(process.env.RATE_LIMIT_PER_MIN) || 180 }),
    express.json({ limit: '32kb' }),
    (req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    },
  );
  app.get('/api', (req, res) => res.redirect(302, '/api/v1'));
  app.use('/api/v1', apiRouter());
  app.use('/api', (req, res) =>
    res.status(404).json({ success: false, error: { code: 404, type: 'NOT_FOUND', message: 'Unknown API version. Use /api/v1' } }),
  );

  if (existsSync(DIST_DIR)) {
    app.use(
      '/assets',
      express.static(path.join(DIST_DIR, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }),
    );
    app.use(express.static(DIST_DIR, { index: false, maxAge: '1h' }));
    // SPA fallback: any other GET that wants HTML gets index.html.
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.set('Cache-Control', 'no-cache');
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  } else {
    app.get('/', (req, res) =>
      res.type('text').send('IndoMock API is running. Frontend not built yet — run `npm run build` (or use `npm run dev`).\nAPI: /api/v1'),
    );
  }

  // JSON error handler (malformed JSON bodies, unexpected exceptions).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) console.error('[indomock]', err);
    res.status(status).json({
      success: false,
      error: { code: status, type: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR', message: status >= 500 ? 'Unexpected server error.' : err.message },
    });
  });

  return app;
}
