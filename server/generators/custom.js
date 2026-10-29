/**
 * Custom schema generator. Each row is backed by one coherent person + product
 * so that e.g. `email` always matches `full_name` within the same row.
 */
import { generateUsers } from './users.js';
import { buildProduct } from './products.js';
import { PAYMENT_METHODS, TRX_STATUSES } from './transactions.js';
import { CATALOG } from './data/catalog.js';
import { isoWIB, dateOnly, formatIDR } from './format.js';
import { ApiError } from '../lib/errors.js';

const BANKS = ['BCA', 'BRI', 'Bank Mandiri', 'BNI', 'BSI', 'CIMB Niaga', 'Permata Bank', 'BTN', 'Bank Jago', 'SeaBank', 'blu by BCA Digital', 'Bank DKI'];
const PLATE_PREFIX = ['B', 'D', 'F', 'T', 'E', 'Z', 'L', 'N', 'W', 'H', 'K', 'AB', 'AD', 'AA', 'DK', 'BK', 'BA', 'BM', 'BG', 'BE', 'DD', 'KT', 'DB', 'DR', 'KB'];
const CO_A = ['Maju', 'Sinar', 'Karya', 'Cipta', 'Mitra', 'Nusa', 'Berkah', 'Sentosa', 'Tunas', 'Bumi', 'Cahaya', 'Graha'];
const CO_B = ['Jaya', 'Abadi', 'Makmur', 'Sejahtera', 'Mandiri', 'Utama', 'Gemilang', 'Perkasa', 'Lestari', 'Sukses'];
const CO_C = ['Indonesia', 'Nusantara', 'Teknologi', 'Digital', 'Logistik', 'Solusi', 'Kreasi', ''];
const SENTENCES = [
  'Pesanan sudah dikirim, mohon ditunggu ya kak.',
  'Barang sampai dengan selamat, packing rapi dan aman.',
  'Pelayanan ramah, harga bersahabat, recommended banget!',
  'Mohon konfirmasi pembayaran sebelum pukul 17.00 WIB.',
  'Stok terbatas, silakan checkout sebelum kehabisan.',
  'Terima kasih sudah berbelanja di toko kami.',
  'Pengiriman via JNE REG estimasi 2-3 hari kerja.',
  'Promo berlaku setiap hari Jumat dan Sabtu.',
  'Silakan hubungi admin untuk pertanyaan lebih lanjut.',
  'Kualitas sesuai deskripsi, seller fast response.',
];

/** type -> { label, group, gen(ctx) } — ctx has rng, row index, person, product. */
export const FIELD_TYPES = {
  id: { label: 'Auto-increment ID', group: 'Dasar', gen: (c) => c.index + 1 },
  uuid: { label: 'UUID v4', group: 'Dasar', gen: (c) => c.rng.uuid() },
  integer: { label: 'Angka (1–1000)', group: 'Dasar', gen: (c) => c.rng.int(1, 1000) },
  boolean: { label: 'Boolean', group: 'Dasar', gen: (c) => c.rng.bool() },
  date: { label: 'Tanggal (YYYY-MM-DD)', group: 'Dasar', gen: (c) => dateOnly(new Date(Date.now() - c.rng.int(0, 730) * 864e5)) },
  datetime_wib: { label: 'Datetime WIB (ISO)', group: 'Dasar', gen: (c) => isoWIB(new Date(Date.now() - c.rng.int(0, 60 * 864e5 / 1000) * 1000)) },
  sentence: { label: 'Kalimat (Bahasa Indonesia)', group: 'Dasar', gen: (c) => c.rng.pick(SENTENCES) },

  full_name: { label: 'Nama Lengkap', group: 'Identitas', gen: (c) => c.person.name },
  first_name: { label: 'Nama Depan', group: 'Identitas', gen: (c) => c.person.name.replace(/^(I|Ni)\s/, '').split(' ')[0] },
  gender: { label: 'Gender', group: 'Identitas', gen: (c) => c.person.gender },
  nik: { label: 'NIK KTP (16 digit)', group: 'Identitas', gen: (c) => c.person.nik },
  npwp: { label: 'NPWP (15 digit)', group: 'Identitas', gen: (c) => { const d = c.rng.digits(15); return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}.${d[8]}-${d.slice(9, 12)}.${d.slice(12)}`; } },
  birth_date: { label: 'Tanggal Lahir', group: 'Identitas', gen: (c) => c.person.birth_date },
  religion: { label: 'Agama', group: 'Identitas', gen: (c) => c.person.religion },
  job: { label: 'Pekerjaan', group: 'Identitas', gen: (c) => c.person.occupation },
  email: { label: 'Email', group: 'Kontak', gen: (c) => c.person.email },
  phone: { label: 'No. HP (+62)', group: 'Kontak', gen: (c) => c.person.phone },
  operator: { label: 'Operator Seluler', group: 'Kontak', gen: (c) => c.person.operator },

  address: { label: 'Alamat Lengkap', group: 'Alamat', gen: (c) => c.person.address.full },
  street: { label: 'Jalan', group: 'Alamat', gen: (c) => c.person.address.street },
  kelurahan: { label: 'Kelurahan', group: 'Alamat', gen: (c) => c.person.address.kelurahan },
  kecamatan: { label: 'Kecamatan', group: 'Alamat', gen: (c) => c.person.address.kecamatan },
  city: { label: 'Kota/Kabupaten', group: 'Alamat', gen: (c) => c.person.address.city },
  province: { label: 'Provinsi', group: 'Alamat', gen: (c) => c.person.address.province },
  postal_code: { label: 'Kode Pos', group: 'Alamat', gen: (c) => c.person.address.postal_code },

  company: { label: 'Nama Perusahaan', group: 'Bisnis', gen: (c) => `${c.rng.pick(['PT', 'PT', 'CV'])} ${c.rng.pick(CO_A)} ${c.rng.pick(CO_B)} ${c.rng.pick(CO_C)}`.trim() },
  bank: { label: 'Nama Bank', group: 'Bisnis', gen: (c) => c.rng.pick(BANKS) },
  bank_account: { label: 'No. Rekening', group: 'Bisnis', gen: (c) => c.rng.digits(c.rng.pick([10, 10, 13, 15])) },
  plate_number: { label: 'Plat Nomor Kendaraan', group: 'Bisnis', gen: (c) => `${c.rng.pick(PLATE_PREFIX)} ${c.rng.int(1, 9999)} ${c.rng.letters(c.rng.int(1, 3))}` },
  product_name: { label: 'Nama Produk Warung', group: 'Bisnis', gen: (c) => c.product.name },
  price_idr: { label: 'Harga (IDR integer)', group: 'Bisnis', gen: (c) => c.product.price },
  price_formatted: { label: 'Harga (Rp format)', group: 'Bisnis', gen: (c) => formatIDR(c.product.price) },
  barcode: { label: 'Barcode EAN-13', group: 'Bisnis', gen: (c) => c.product.barcode },
  payment_method: { label: 'Metode Pembayaran', group: 'Bisnis', gen: (c) => c.rng.pick(Object.values(PAYMENT_METHODS)).label },
  trx_status: { label: 'Status Transaksi', group: 'Bisnis', gen: (c) => c.rng.weighted(TRX_STATUSES) },
};

export const FIELD_TYPE_LIST = Object.entries(FIELD_TYPES).map(([type, f]) => ({ type, label: f.label, group: f.group }));

const FIELD_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;

/** Accepts [{name,type}] or the compact query form "name:type,email:email". */
export function parseSchema(input) {
  let fields = input;
  if (typeof input === 'string') {
    fields = input.split(',').filter(Boolean).map((pair) => {
      const [name, type = name] = pair.split(':').map((s) => s.trim());
      return { name, type };
    });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new ApiError(400, 'Custom schema requires at least one field.', {
      example: { fields: [{ name: 'nama', type: 'full_name' }, { name: 'hp', type: 'phone' }] },
      query_example: '/api/v1/custom?fields=nama:full_name,hp:phone,kota:city',
    });
  }
  if (fields.length > 40) throw new ApiError(400, 'Custom schema supports at most 40 fields.');
  const seen = new Set();
  return fields.map((f, i) => {
    const name = String(f?.name ?? '').trim();
    const type = String(f?.type ?? '').trim();
    if (!FIELD_NAME_RE.test(name)) throw new ApiError(400, `Field #${i + 1}: invalid name "${name}". Use letters, digits and underscores (max 64).`);
    if (seen.has(name)) throw new ApiError(400, `Duplicate field name "${name}".`);
    if (!FIELD_TYPES[type]) throw new ApiError(400, `Field "${name}": unknown type "${type}".`, { allowed: Object.keys(FIELD_TYPES) });
    seen.add(name);
    return { name, type };
  });
}

export function generateCustom(rng, { limit, fields }) {
  const schema = parseSchema(fields);
  const needsPerson = schema.some((f) => FIELD_TYPES[f.type].group !== 'Dasar' && FIELD_TYPES[f.type].group !== 'Bisnis');
  const needsProduct = schema.some((f) => ['product_name', 'price_idr', 'price_formatted', 'barcode'].includes(f.type));
  const people = needsPerson ? generateUsers(rng, { limit }) : [];

  return Array.from({ length: limit }, (_, index) => {
    const ctx = {
      rng,
      index,
      person: people[index],
      product: needsProduct ? buildProduct(rng, rng.pick(CATALOG), index + 1) : undefined,
    };
    return Object.fromEntries(schema.map((f) => [f.name, FIELD_TYPES[f.type].gen(ctx)]));
  });
}
