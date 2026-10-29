/**
 * Cashier / fintech transaction generator (POS receipts + payment gateway state).
 */
import { CATALOG, MERCHANT_NAMES } from './data/catalog.js';
import { CITY_INDEX } from './data/regions.js';
import { NAMES } from './data/people.js';
import { buildProduct } from './products.js';
import { pad } from './random.js';
import { formatIDR, isoWIB, humanWIB, compactDateWIB, normalizeKey } from './format.js';
import { ApiError } from '../lib/errors.js';

export const PAYMENT_METHODS = {
  qris: { label: 'QRIS', type: 'qr_code', provider: 'QRIS (Bank Indonesia)', weight: 34, ttlMin: 15 },
  gopay: { label: 'GoPay', type: 'e_wallet', provider: 'GoTo Financial', weight: 18, ttlMin: 15 },
  ovo: { label: 'OVO', type: 'e_wallet', provider: 'OVO', weight: 10, ttlMin: 15 },
  dana: { label: 'DANA', type: 'e_wallet', provider: 'DANA Indonesia', weight: 14, ttlMin: 15 },
  shopeepay: { label: 'ShopeePay', type: 'e_wallet', provider: 'ShopeePay', weight: 10, ttlMin: 15 },
  bca_va: { label: 'BCA Virtual Account', type: 'virtual_account', provider: 'Bank Central Asia', weight: 9, ttlMin: 1440, adminFee: 4000, companyCode: '39358' },
  mandiri_va: { label: 'Mandiri Virtual Account', type: 'virtual_account', provider: 'Bank Mandiri', weight: 5, ttlMin: 1440, adminFee: 4000, companyCode: '88908' },
};

export const TRX_STATUSES = { settlement: 75, pending: 15, expired: 10 };

export function findPaymentMethod(raw) {
  const key = normalizeKey(raw).replace(/\s+/g, '_').replace(/_?virtual_account$/, '_va');
  if (!key) return undefined;
  if (PAYMENT_METHODS[key]) return key;
  const hit = Object.entries(PAYMENT_METHODS).find(([, m]) => normalizeKey(m.label).replace(/\s+/g, '_') === key);
  if (hit) return hit[0];
  throw new ApiError(400, `Unknown payment_method "${raw}".`, { allowed: Object.keys(PAYMENT_METHODS) });
}

export function findTrxStatus(raw) {
  const key = normalizeKey(raw);
  if (!key) return undefined;
  const aliases = { settled: 'settlement', success: 'settlement', paid: 'settlement', lunas: 'settlement', waiting: 'pending', expire: 'expired', kedaluwarsa: 'expired' };
  const status = TRX_STATUSES[key] ? key : aliases[key];
  if (!status) throw new ApiError(400, `Unknown transaction status "${raw}".`, { allowed: Object.keys(TRX_STATUSES), note: 'Numeric values (e.g. ?status=500) simulate HTTP errors instead.' });
  return status;
}

/** Random timestamp in the last 30 days, biased to warung opening hours (06–23 WIB). */
function randomShopTime(rng, now) {
  const daysAgo = rng.int(0, 29);
  const hourWib = rng.weighted({ 6: 3, 7: 6, 8: 7, 9: 6, 10: 6, 11: 7, 12: 9, 13: 7, 14: 5, 15: 5, 16: 6, 17: 8, 18: 9, 19: 10, 20: 9, 21: 7, 22: 4 });
  const midnightWib = Math.floor((now + 7 * 3600e3) / 864e5) * 864e5 - 7 * 3600e3;
  const ts = midnightWib - daysAgo * 864e5 + Number(hourWib) * 3600e3 + rng.int(0, 3599) * 1000;
  return new Date(Math.min(ts, now - rng.int(30, 600) * 1000));
}

function paymentDetail(rng, slug, total) {
  const m = PAYMENT_METHODS[slug];
  const base = { method: slug, label: m.label, type: m.type, provider: m.provider };
  if (m.type === 'virtual_account') {
    return { ...base, va_number: `${m.companyCode}${rng.digits(11)}`, bank_code: slug === 'bca_va' ? '014' : '008' };
  }
  if (m.type === 'qr_code') {
    return { ...base, nmid: `ID${rng.digits(13)}`, acquirer: rng.pick(['BRI', 'BNI', 'Bank Mandiri', 'BCA', 'GoPay', 'DANA']), mdr_fee: Math.round(total * 0.003) };
  }
  return { ...base, reference_id: `${m.label.toUpperCase().slice(0, 3)}${rng.digits(12)}`, account: `08${rng.int(11, 99)}****${rng.digits(4)}` };
}

export function generateTransactions(rng, { limit, status, payment_method }) {
  const forcedStatus = findTrxStatus(status);
  const forcedMethod = findPaymentMethod(payment_method);
  const now = Date.now();
  const methodWeights = Object.fromEntries(Object.entries(PAYMENT_METHODS).map(([k, v]) => [k, v.weight]));
  const firstNames = [...NAMES.jawa.male, ...NAMES.sunda.female, ...NAMES.modern.female, ...NAMES.modern.male, ...NAMES.minang.female];

  return Array.from({ length: limit }, (_, i) => {
    const createdAt = randomShopTime(rng, now);
    const city = rng.pick(CITY_INDEX);
    const method = forcedMethod ?? rng.weighted(methodWeights);
    const m = PAYMENT_METHODS[method];

    const lineCount = rng.weighted({ 1: 20, 2: 25, 3: 22, 4: 15, 5: 10, 6: 8 });
    const items = rng.sample(CATALOG, Number(lineCount)).map((entry) => {
      const p = buildProduct(rng, entry, 0);
      const qty = p.price > 100000 ? 1 : rng.weighted({ 1: 50, 2: 25, 3: 12, 4: 6, 5: 4, 10: 3 });
      return { sku: p.sku, barcode: p.barcode, name: p.name, qty: Number(qty), unit_price: p.price, subtotal: p.price * Number(qty) };
    });

    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const discount = rng.bool(0.15) ? Math.min(subtotal, rng.pick([1000, 2000, 2500, 5000, 10000])) : 0;
    const adminFee = m.adminFee ?? 0;
    const total = subtotal - discount + adminFee;

    // Keep timestamps consistent with the status: pending rows sit inside the
    // payment window, expired rows are past it.
    const trxStatus = forcedStatus ?? rng.weighted(TRX_STATUSES);
    const ttl = m.ttlMin * 60e3;
    let created = createdAt;
    if (trxStatus === 'pending' && created.getTime() + ttl <= now) {
      created = new Date(now - rng.int(1, m.ttlMin - 1) * 60e3 - rng.int(0, 59) * 1000);
    } else if (trxStatus === 'expired' && created.getTime() + ttl > now) {
      created = new Date(now - ttl - rng.int(5, 600) * 60e3);
    }
    const expiry = new Date(created.getTime() + ttl);
    const paidAt = trxStatus === 'settlement' ? new Date(created.getTime() + rng.int(8, m.type === 'virtual_account' ? 7200 : 240) * 1000) : null;

    const merchantSuffix = pad(rng.int(1, 9999), 4);
    return {
      id: i + 1,
      trx_id: `TRX-${compactDateWIB(created)}-${rng.alphanum(6)}`,
      invoice_no: `INV/${compactDateWIB(created).slice(0, 4)}/${compactDateWIB(created).slice(4, 6)}/${pad(rng.int(1, 999999), 6)}`,
      timestamp: isoWIB(created),
      timestamp_wib: humanWIB(created),
      merchant: {
        id: `MCH-${merchantSuffix}`,
        name: rng.pick(MERCHANT_NAMES),
        city: city.name,
        province: city.province.name,
      },
      cashier: rng.pick(firstNames),
      customer: rng.bool(0.4) ? { name: rng.pick(firstNames), phone: `+62 8${rng.int(11, 99)}-****-${rng.digits(4)}` } : null,
      items,
      item_count: items.reduce((s, it) => s + it.qty, 0),
      subtotal,
      discount,
      admin_fee: adminFee,
      total,
      total_formatted: formatIDR(total),
      currency: 'IDR',
      payment: paymentDetail(rng, method, total),
      status: trxStatus,
      paid_at: paidAt ? isoWIB(paidAt) : null,
      expired_at: trxStatus === 'settlement' ? null : isoWIB(expiry),
    };
  });
}
