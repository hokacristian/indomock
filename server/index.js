import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3006;
// 0.0.0.0 accepts both loopback (127.0.0.1) and external interfaces.
// Set HOST=127.0.0.1 to only listen locally (e.g. behind nginx).
const HOST = process.env.HOST || '0.0.0.0';

const server = createApp().listen(PORT, HOST, () => {
  const shown = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;
  console.log(`[indomock] listening on http://${HOST}:${PORT}  →  http://${shown}:${PORT}/api/v1`);
});

server.on('error', (err) => {
  console.error(`[indomock] failed to start: ${err.message}`);
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
