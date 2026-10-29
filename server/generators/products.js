/**
 * WarungKu / UMKM product inventory generator.
 * SKU and EAN-13 barcode are derived from the catalog key, so the same product
 * always carries the same identifiers — just like a real POS master data table.
 */
import { CATALOG, CATEGORIES } from './data/catalog.js';
import { hashSeed } from './random.js';
import { formatIDR, isoWIB, dateOnly, normalizeKey, prettyPrice } from './format.js';
import { ApiError } from '../lib/errors.js';

/** EAN-13 with GS1 Indonesia prefix 899 and a valid check digit. */
export function ean13(key) {
  const body = `899${String(hashSeed(key)).padStart(10, '0').slice(-9)}`;
  const sum = [...body].reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return `${body}${(10 - (sum % 10)) % 10}`;
}

export function findCategory(raw) {
  const key = normalizeKey(raw);
  if (!key) return undefined;
  const hit = Object.entries(CATEGORIES).find(
    ([slug, c]) => normalizeKey(slug) === key || normalizeKey(c.label) === key || c.code.toLowerCase() === key,
  ) ?? Object.entries(CATEGORIES).find(([slug, c]) => normalizeKey(c.label).includes(key) || normalizeKey(slug).includes(key));
  if (!hit) {
    throw new ApiError(400, `Unknown category "${raw}".`, { allowed: Object.keys(CATEGORIES) });
  }
  return hit[0];
}

function parsePrice(raw, label) {
  if (raw === undefined || raw === '') return undefined;
  const n = Number(String(raw).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n) || n < 0) throw new ApiError(400, `${label} must be a non-negative number (IDR).`);
  return n;
}

/** Build one inventory row from a catalog entry. */
export function buildProduct(rng, entry, id) {
  const price = prettyPrice(entry.basePrice * rng.float(0.94, 1.06, 3));
  const marginPct = rng.float(0.06, 0.22, 3);
  const cost = prettyPrice(price / (1 + marginPct));
  const minStock = rng.pick([5, 10, 12, 20, 24]);
  const stock = rng.bool(0.08) ? 0 : rng.int(0, 180);
  const perishable = ['sembako', 'susu', 'mie-instan', 'snack', 'minuman', 'kopi-teh', 'bumbu-dapur'].includes(entry.category);
  const expiry = new Date(Date.now() + rng.int(perishable ? 20 : 180, perishable ? 400 : 1095) * 864e5);
  const updated = new Date(Date.now() - rng.int(0, 30 * 86400) * 1000);
  const sku = `${entry.categoryCode}-${normalizeKey(entry.brand).replace(/\s/g, '').slice(0, 3).toUpperCase()}-${entry.key.split('-')[1]}`;

  return {
    id,
    sku,
    barcode: ean13(entry.key),
    name: `${entry.name} ${entry.variant}`,
    brand: entry.brand,
    category: entry.category,
    category_label: entry.categoryLabel,
    variant: entry.variant,
    unit: entry.unit,
    price,
    price_formatted: formatIDR(price),
    cost_price: cost,
    margin_percent: Number((((price - cost) / price) * 100).toFixed(1)),
    stock,
    min_stock: minStock,
    stock_status: stock === 0 ? 'habis' : stock < minStock ? 'menipis' : 'tersedia',
    supplier: entry.supplier,
    is_halal: entry.category !== 'rokok' && entry.category !== 'gas-energi',
    expired_at: perishable || rng.bool(0.3) ? dateOnly(expiry) : null,
    updated_at: isoWIB(updated),
  };
}

export function generateProducts(rng, { limit, category, min_price, max_price }) {
  const cat = findCategory(category);
  const min = parsePrice(min_price, 'min_price');
  const max = parsePrice(max_price, 'max_price');
  if (min !== undefined && max !== undefined && min > max) {
    throw new ApiError(400, 'min_price cannot be greater than max_price.', { min_price: min, max_price: max });
  }

  const pool = CATALOG.filter(
    (p) =>
      (!cat || p.category === cat) &&
      // Filter on base price with the ±6% variance window so results are never empty by accident.
      (min === undefined || p.basePrice * 1.06 >= min) &&
      (max === undefined || p.basePrice * 0.94 <= max),
  );

  const rows = rng
    .shuffle(pool)
    .map((entry) => buildProduct(rng, entry, 0))
    .filter((p) => (min === undefined || p.price >= min) && (max === undefined || p.price <= max))
    .slice(0, limit)
    .map((p, i) => ({ ...p, id: i + 1 }));

  return { rows, available: pool.length };
}
