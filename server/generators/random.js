/**
 * Seedable pseudo-random toolkit.
 * Every generator receives an `rng` instance so that `?seed=` produces
 * byte-for-byte reproducible fixtures (handy for snapshot tests).
 */

// mulberry32 — tiny, fast, good enough for mock data.
function mulberry32(a) {
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Turn any string/number seed into a 32-bit integer.
export function hashSeed(input) {
  const str = String(input);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export function createRng(seed) {
  const resolvedSeed =
    seed === undefined || seed === null || seed === ''
      ? Math.floor(Math.random() * 2 ** 31)
      : /^\d+$/.test(String(seed))
        ? Number(seed) >>> 0
        : hashSeed(seed);

  const next = mulberry32(resolvedSeed);

  const rng = {
    seed: resolvedSeed,
    next,
    /** Integer in [min, max] inclusive. */
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    float(min, max, decimals = 2) {
      const v = next() * (max - min) + min;
      return Number(v.toFixed(decimals));
    },
    bool(probability = 0.5) {
      return next() < probability;
    },
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    /** Pick from [{ value, weight }] or an object map { value: weight }. */
    weighted(entries) {
      const list = Array.isArray(entries)
        ? entries
        : Object.entries(entries).map(([value, weight]) => ({ value, weight }));
      const total = list.reduce((sum, e) => sum + e.weight, 0);
      let roll = next() * total;
      for (const e of list) {
        roll -= e.weight;
        if (roll < 0) return e.value;
      }
      return list[list.length - 1].value;
    },
    shuffle(list) {
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    sample(list, count) {
      return rng.shuffle(list).slice(0, count);
    },
    digits(length) {
      let out = '';
      for (let i = 0; i < length; i++) out += Math.floor(next() * 10);
      return out;
    },
    alphanum(length, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
      let out = '';
      for (let i = 0; i < length; i++) out += alphabet[Math.floor(next() * alphabet.length)];
      return out;
    },
    letters(length) {
      return rng.alphanum(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    },
    /** RFC 4122 v4-shaped UUID (seeded, not crypto-grade). */
    uuid() {
      const hex = '0123456789abcdef';
      let out = '';
      for (let i = 0; i < 36; i++) {
        if ([8, 13, 18, 23].includes(i)) out += '-';
        else if (i === 14) out += '4';
        else if (i === 19) out += hex[(Math.floor(next() * 16) & 0x3) | 0x8];
        else out += hex[Math.floor(next() * 16)];
      }
      return out;
    },
  };
  return rng;
}

export const pad = (value, length) => String(value).padStart(length, '0');
