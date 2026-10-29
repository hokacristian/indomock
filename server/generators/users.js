/**
 * Indonesian user/citizen profile generator.
 *
 * NIK (Nomor Induk Kependudukan) layout — 16 digits:
 *   PP KK CC  DDMMYY  SSSS
 *   │  │  │   │       └─ serial 0001–9999
 *   │  │  │   └─ birth date; DD + 40 for female
 *   │  │  └─ kecamatan
 *   │  └─ kabupaten/kota
 *   └─ provinsi
 */
import { NAMES, ETHNICITY_LABEL, OPERATORS, RELIGION_WEIGHTS, EASTERN_PROVINCES, MARITAL, BLOOD_TYPES, OCCUPATIONS, EMAIL_DOMAINS } from './data/people.js';
import { PROVINCES, CITY_INDEX, STREETS, GANG_PREFIX, PERUMAHAN } from './data/regions.js';
import { pad } from './random.js';
import { isoWIB, dateOnly, normalizeKey, slugify } from './format.js';
import { ApiError } from '../lib/errors.js';

const GENDER_ALIASES = {
  male: 'male', m: 'male', l: 'male', pria: 'male', 'laki-laki': 'male', laki: 'male', cowok: 'male',
  female: 'female', f: 'female', p: 'female', wanita: 'female', perempuan: 'female', cewek: 'female',
};

export function parseGender(raw) {
  if (raw === undefined || raw === '' || raw === 'all' || raw === 'any') return undefined;
  const g = GENDER_ALIASES[String(raw).toLowerCase()];
  if (!g) throw new ApiError(400, `Invalid gender "${raw}".`, { allowed: ['male', 'female', 'L', 'P'] });
  return g;
}

export function findProvince(raw) {
  const key = normalizeKey(raw);
  if (!key) return undefined;
  return PROVINCES.find(
    (p) => p.code === key || normalizeKey(p.name) === key || p.aliases.some((a) => normalizeKey(a) === key),
  ) ?? PROVINCES.find((p) => normalizeKey(p.name).includes(key));
}

/** Resolve the pool of cities that satisfy ?city= and ?prov= filters. */
export function resolveCityPool({ city, prov }) {
  let pool = CITY_INDEX;
  if (prov) {
    const province = findProvince(prov);
    if (!province) {
      throw new ApiError(400, `Unknown province "${prov}".`, {
        hint: 'Use a province name, alias, or 2-digit code. See GET /api/v1/regions',
        examples: ['jabar', 'DKI Jakarta', '51', 'sumut'],
      });
    }
    pool = pool.filter((c) => c.province.code === province.code);
  }
  if (city) {
    const key = normalizeKey(city);
    const matches = pool.filter((c) => normalizeKey(c.name).includes(key));
    if (!matches.length) {
      throw new ApiError(400, `Unknown city "${city}"${prov ? ` in province "${prov}"` : ''}.`, {
        hint: 'Partial, case-insensitive match against Kota/Kabupaten names. See GET /api/v1/regions',
        available: pool.slice(0, 20).map((c) => c.shortName),
      });
    }
    pool = matches;
  }
  return pool;
}

function buildName(rng, ethnicity, gender) {
  const set = NAMES[ethnicity];
  if (ethnicity === 'bali') {
    const prefix = gender === 'male' ? 'I' : 'Ni';
    if (rng.bool(0.12)) {
      return `${rng.pick(set.nobility[gender])} ${rng.pick(set[gender])}`;
    }
    const order = rng.pick(set.birthOrder);
    return `${prefix} ${rng.pick(order)} ${rng.pick(set[gender])}`;
  }
  const first = rng.pick(set[gender]);
  if (ethnicity === 'batak') {
    // Batak women's names commonly include "br." (boru) before the marga.
    const marga = rng.pick(set.marga);
    if (gender === 'female' && rng.bool(0.45)) return `${first} br. ${marga}`;
    return rng.bool(0.3) ? `${first} ${rng.pick(set.middle.male)} ${marga}` : `${first} ${marga}`;
  }
  // Single-name Javanese ("Sutrisno") still exists, mostly among older people.
  if (ethnicity === 'jawa' && rng.bool(0.08)) return first;
  const last = rng.pick(set.last[gender]);
  if (last === first) return first;
  if (rng.bool(0.25)) {
    const middle = rng.pick(set.middle[gender]);
    if (middle !== first && middle !== last) return `${first} ${middle} ${last}`;
  }
  return `${first} ${last}`;
}

function buildPhone(rng) {
  const operator = rng.weighted(OPERATORS.map((o) => ({ value: o, weight: o.weight })));
  const prefix = rng.pick(operator.prefixes);
  const local = `${prefix}${rng.digits(rng.pick([7, 8, 8]))}`; // 11–12 digits total
  const intl = `+62${local.slice(1)}`;
  const pretty = `+62 ${local.slice(1, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
  return { phone: intl, phone_local: local, phone_display: pretty, operator: operator.name };
}

function buildAddress(rng, city) {
  const district = rng.pick(city.districts);
  const village = rng.pick(district.villages);
  const rt = pad(rng.int(1, 15), 3);
  const rw = pad(rng.int(1, 12), 3);
  const style = rng.weighted({ street: 6, gang: 2, perum: 2 });
  let street;
  if (style === 'gang') {
    street = `${rng.pick(STREETS)} ${rng.pick(GANG_PREFIX)} ${rng.pick(['Masjid', 'Mushola', 'Kelinci', 'Haji Naim', 'Sawo', 'Buntu', 'Damai', 'Swadaya'])} No. ${rng.int(1, 80)}`;
  } else if (style === 'perum') {
    street = `${rng.pick(PERUMAHAN)} Blok ${rng.letters(1)}${rng.int(1, 12)} No. ${rng.int(1, 40)}`;
  } else {
    street = `${rng.pick(STREETS)} No. ${rng.int(1, 250)}`;
  }
  const villageLabel = city.name.startsWith('Kabupaten') && rng.bool(0.4) ? 'Desa' : 'Kel.';
  return {
    district,
    address: {
      street,
      rt,
      rw,
      kelurahan: village.name,
      kecamatan: district.name,
      city: city.name,
      province: city.province.name,
      postal_code: village.postal,
      full: `${street}, RT ${rt}/RW ${rw}, ${villageLabel} ${village.name}, Kec. ${district.name}, ${city.name}, ${city.province.name} ${village.postal}`,
    },
  };
}

export function generateUsers(rng, { limit, gender, city, prov }) {
  const g = parseGender(gender);
  const pool = resolveCityPool({ city, prov });
  const now = Date.now();
  const usedNik = new Set();

  return Array.from({ length: limit }, (_, i) => {
    const c = rng.pick(pool);
    const sex = g ?? (rng.bool() ? 'male' : 'female');
    const ethnicity = rng.weighted(c.province.ethnic);
    const name = buildName(rng, ethnicity, sex);
    const { address, district } = buildAddress(rng, c);

    // Age 17–70, skewed towards productive age (KTP is issued at 17).
    const age = Math.min(70, 17 + Math.floor(rng.next() ** 1.6 * 54));
    const birth = new Date(now - age * 365.25 * 864e5 - rng.int(0, 364) * 864e5);
    const birthDate = dateOnly(birth); // WIB calendar date, so NIK and birth_date always agree
    const [by, bm, bd] = birthDate.split('-');
    const dob = `${pad(Number(bd) + (sex === 'female' ? 40 : 0), 2)}${bm}${by.slice(2)}`;
    const region = `${c.province.code}${c.code}${district.code}`;
    let nik;
    do nik = `${region}${dob}${pad(rng.int(1, 9999), 4)}`;
    while (usedNik.has(nik));
    usedNik.add(nik);

    const religionTable = ethnicity === 'bali' ? 'bali'
      : ethnicity === 'batak' ? 'batak'
        : ethnicity === 'minang' ? 'minang'
          : EASTERN_PROVINCES.has(c.province.code) ? 'eastern' : 'default';

    const handleParts = name.toLowerCase().replace(/\bbr\.\s/, '').split(/\s+/).map(slugify).filter(Boolean);
    const handle = [handleParts[0], handleParts.at(-1)].filter((v, idx, arr) => arr.indexOf(v) === idx).join(rng.pick(['.', '_', '']));
    const email = `${handle}${rng.bool(0.6) ? rng.int(1, 99) : ''}@${rng.weighted(EMAIL_DOMAINS)}`;
    const createdAt = new Date(now - rng.int(0, 900) * 864e5 - rng.int(0, 86399) * 1000);

    return {
      id: i + 1,
      uuid: rng.uuid(),
      nik,
      name,
      gender: sex,
      gender_id: sex === 'male' ? 'Laki-laki' : 'Perempuan',
      ethnicity: ETHNICITY_LABEL[ethnicity],
      birth_place: c.shortName,
      birth_date: birthDate,
      age,
      religion: rng.weighted(RELIGION_WEIGHTS[religionTable]),
      marital_status: age < 21 ? 'Belum Kawin' : rng.weighted(MARITAL),
      blood_type: rng.weighted(BLOOD_TYPES),
      occupation: age < 23 && rng.bool(0.6) ? 'Pelajar/Mahasiswa' : rng.pick(OCCUPATIONS),
      email,
      ...buildPhone(rng),
      address,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      is_verified: rng.bool(0.82),
      created_at: isoWIB(createdAt),
    };
  });
}
