# IndoMock

Mock data generator & live public REST API for Indonesian developers — **mock.hokacristian.com**.

- **Users** — Jawa/Sunda/Batak/Minang/Bali/modern names, structurally valid 16-digit NIK (region + DOB, female DD+40), `+62 8xx` numbers with real Telkomsel/Indosat/XL/Tri prefixes, full addresses (Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kab, 38 Provinsi, Kode Pos).
- **Products** — WarungKu/UMKM catalog (beras, minyak goreng, Indomie, kopi, telur, sabun, rokok…) with IDR prices, SKU, EAN-13 (GS1 899 prefix, valid check digit), stock.
- **Transactions** — TRX-ID, WIB timestamps, line items, QRIS / GoPay / OVO / DANA / ShopeePay / BCA VA / Mandiri VA, `settlement` / `pending` / `expired`.

All data is synthetic and not linked to real people.

## Run

```bash
npm install
npm run dev      # API on :3006 + Vite UI on :5173 (proxies /api)
npm run build    # builds the UI into dist/
npm start        # production: Express serves /api/v1/* and dist/ on :3006
```

Env: `PORT` (3006), `HOST` (`0.0.0.0`; use `127.0.0.1` behind a reverse proxy), `TRUST_PROXY` (`loopback`), `RATE_LIMIT_PER_MIN` (180), `PUBLIC_BASE_URL`.

## API

| Endpoint | Filters |
| --- | --- |
| `GET /api/v1/users` | `gender` (male/female/L/P), `city` (partial), `prov` (name, alias like `jabar`, or code `32`) |
| `GET /api/v1/products` | `category`, `min_price`, `max_price` |
| `GET /api/v1/transactions` | `status` (settlement/pending/expired), `payment_method` |
| `GET\|POST /api/v1/custom` | `fields=name:type,...` or JSON body `{ "fields": [{ "name", "type" }] }` |
| `GET /api/v1/regions`, `/meta`, `/custom/types`, `/health` | — |

Common params on every data endpoint:

- `limit` — 1–100 (default 10)
- `seed` — reproducible output (time-relative fields such as timestamps still follow the clock)
- `delay=<ms>` — simulated latency, max 10000
- `status=<code>` — simulated HTTP response (2xx/4xx/5xx) with realistic bodies and headers (`Retry-After`, `WWW-Authenticate`). On `/transactions`, `status` is the data filter, so use `status_code=<code>` there; numeric `status` values are always treated as HTTP codes.
- `format=json|csv` — add `&download` to get a CSV attachment

```bash
curl "https://mock.hokacristian.com/api/v1/users?limit=5&prov=jabar&delay=1500"
curl "https://mock.hokacristian.com/api/v1/transactions?status=pending&status_code=503"
```

Credits: [Hoka Cristian Son](https://hokacristian.com) · [GitHub](https://github.com/hokacristian-kcs)
