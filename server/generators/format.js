/**
 * Indonesian locale formatting helpers (IDR, WIB timestamps, slugs).
 */
import { pad } from './random.js';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** 78000 -> "Rp78.000" */
export function formatIDR(amount) {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp${digits}`;
}

/** Shift a Date so its UTC getters read as WIB (UTC+7) wall-clock time. */
function toWibParts(date) {
  const d = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(),
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    i: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
  };
}

/** ISO-8601 with explicit +07:00 offset, e.g. 2026-10-29T14:23:11+07:00 */
export function isoWIB(date) {
  const p = toWibParts(date);
  return `${p.y}-${pad(p.m + 1, 2)}-${pad(p.d, 2)}T${pad(p.h, 2)}:${pad(p.i, 2)}:${pad(p.s, 2)}+07:00`;
}

/** Human readable, e.g. "29 Okt 2026 14:23:11 WIB" */
export function humanWIB(date) {
  const p = toWibParts(date);
  return `${pad(p.d, 2)} ${BULAN[p.m]} ${p.y} ${pad(p.h, 2)}:${pad(p.i, 2)}:${pad(p.s, 2)} WIB`;
}

/** YYYYMMDD in WIB */
export function compactDateWIB(date) {
  const p = toWibParts(date);
  return `${p.y}${pad(p.m + 1, 2)}${pad(p.d, 2)}`;
}

export function dateOnly(date) {
  const p = toWibParts(date);
  return `${p.y}-${pad(p.m + 1, 2)}-${pad(p.d, 2)}`;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function normalizeKey(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Round to a "pretty" Indonesian retail price (Rp100 / Rp500 steps). */
export function prettyPrice(value) {
  if (value < 5000) return Math.max(100, Math.round(value / 100) * 100);
  if (value < 50000) return Math.round(value / 500) * 500;
  return Math.round(value / 1000) * 1000;
}
