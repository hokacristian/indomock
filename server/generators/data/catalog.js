/**
 * WarungKu / UMKM retail catalog.
 * Base prices are typical 2026 warung shelf prices in IDR; the generator adds
 * small regional variance (±6%) and rounds to "pretty" retail prices.
 *
 * Entry: [brand, name, unit, [[variant, basePrice], ...], supplier]
 */

export const CATEGORIES = {
  sembako: {
    label: 'Sembako',
    code: 'SMB',
    items: [
      ['Pandan Wangi', 'Beras Pandan Wangi', 'karung', [['5 kg', 82000], ['10 kg', 160000]], 'PB Sumber Rejeki'],
      ['Rojolele', 'Beras Rojolele Super', 'karung', [['5 kg', 78000], ['25 kg', 372000]], 'PB Sumber Rejeki'],
      ['Setra Ramos', 'Beras Setra Ramos Premium', 'karung', [['5 kg', 76000], ['10 kg', 149000]], 'CV Lumbung Padi'],
      ['Bulog', 'Beras SPHP Medium', 'pack', [['5 kg', 62500]], 'Perum BULOG'],
      ['Bimoli', 'Minyak Goreng Bimoli', 'pouch', [['1 L', 21500], ['2 L', 42000]], 'PT Salim Ivomas Pratama'],
      ['Sunco', 'Minyak Goreng Sunco', 'pouch', [['1 L', 20500], ['2 L', 40000]], 'PT Mikie Oleo Nabati'],
      ['Filma', 'Minyak Goreng Filma', 'pouch', [['2 L', 41000]], 'PT Sinar Mas Agro Resources'],
      ['MinyaKita', 'Minyak Goreng MinyaKita', 'pouch', [['1 L', 15700]], 'Distributor Resmi MinyaKita'],
      ['Gulaku', 'Gula Pasir Gulaku', 'pack', [['1 kg', 18500], ['500 g', 9500]], 'PT Sugar Labinta'],
      ['Rose Brand', 'Gula Pasir Rose Brand', 'pack', [['1 kg', 18000]], 'PT Tunas Baru Lampung'],
      ['Peternak Lokal', 'Telur Ayam Negeri', 'kg', [['1 kg', 30000], ['1/2 kg', 15500], ['1 tray (30 btr)', 57000]], 'Peternakan Jaya Makmur'],
      ['Segitiga Biru', 'Tepung Terigu Segitiga Biru', 'pack', [['1 kg', 14500]], 'PT Bogasari Flour Mills'],
      ['Rose Brand', 'Tepung Beras Rose Brand', 'pack', [['500 g', 9000]], 'PT Tunas Baru Lampung'],
      ['Garam Cap Kapal', 'Garam Beryodium', 'pack', [['250 g', 3500]], 'PT Garam Indonesia'],
    ],
  },
  'mie-instan': {
    label: 'Mie Instan',
    code: 'MIE',
    items: [
      ['Indomie', 'Indomie Goreng Original', 'bungkus', [['85 g', 3500], ['dus isi 40', 128000]], 'PT Indofood Sukses Makmur'],
      ['Indomie', 'Indomie Soto Mie', 'bungkus', [['70 g', 3300]], 'PT Indofood Sukses Makmur'],
      ['Indomie', 'Indomie Ayam Bawang', 'bungkus', [['69 g', 3300]], 'PT Indofood Sukses Makmur'],
      ['Indomie', 'Indomie Goreng Rendang', 'bungkus', [['91 g', 3800]], 'PT Indofood Sukses Makmur'],
      ['Indomie', 'Indomie Kari Ayam', 'bungkus', [['72 g', 3500]], 'PT Indofood Sukses Makmur'],
      ['Mie Sedaap', 'Mie Sedaap Goreng', 'bungkus', [['90 g', 3400]], 'PT Wings Food'],
      ['Mie Sedaap', 'Mie Sedaap Soto', 'bungkus', [['75 g', 3200]], 'PT Wings Food'],
      ['Mie Sedaap', 'Mie Sedaap Korean Spicy Chicken', 'bungkus', [['87 g', 4500]], 'PT Wings Food'],
      ['Sarimi', 'Sarimi Isi 2 Ayam Kecap', 'bungkus', [['115 g', 4000]], 'PT Indofood Sukses Makmur'],
      ['Supermi', 'Supermi Ayam Bawang', 'bungkus', [['75 g', 3000]], 'PT Indofood Sukses Makmur'],
      ['Pop Mie', 'Pop Mie Rasa Ayam', 'cup', [['75 g', 6000]], 'PT Indofood Sukses Makmur'],
    ],
  },
  'kopi-teh': {
    label: 'Kopi & Teh',
    code: 'KPT',
    items: [
      ['Kapal Api', 'Kopi Kapal Api Special Mix', 'renceng', [['10 x 25 g', 14000], ['sachet', 1500]], 'PT Santos Jaya Abadi'],
      ['Kapal Api', 'Kopi Bubuk Kapal Api Special', 'pack', [['165 g', 16500]], 'PT Santos Jaya Abadi'],
      ['ABC', 'Kopi ABC Susu', 'renceng', [['10 x 31 g', 15000]], 'PT Santos Jaya Abadi'],
      ['Good Day', 'Good Day Cappuccino', 'renceng', [['10 x 25 g', 17500]], 'PT Santos Jaya Abadi'],
      ['Torabika', 'Torabika Cappuccino', 'renceng', [['10 x 25 g', 17000]], 'PT Mayora Indah'],
      ['Luwak White Koffie', 'Luwak White Koffie Original', 'renceng', [['10 x 20 g', 14500]], 'PT Javaprima Abadi'],
      ['Sariwangi', 'Teh Celup Sariwangi', 'box', [['25 kantong', 7500]], 'PT Unilever Indonesia'],
      ['Sosro', 'Teh Celup Sosro', 'box', [['30 kantong', 8000]], 'PT Sinar Sosro'],
      ['Tong Tji', 'Teh Tong Tji Melati', 'pack', [['40 g', 6500]], 'PT Tong Tji Tea Indonesia'],
    ],
  },
  minuman: {
    label: 'Minuman',
    code: 'MNM',
    items: [
      ['Aqua', 'Aqua Air Mineral', 'botol', [['600 ml', 4000], ['1500 ml', 7000], ['galon 19 L', 22000]], 'PT Tirta Investama'],
      ['Le Minerale', 'Le Minerale Air Mineral', 'botol', [['600 ml', 3800], ['1500 ml', 6500]], 'PT Tirta Fresindo Jaya'],
      ['Teh Pucuk Harum', 'Teh Pucuk Harum', 'botol', [['350 ml', 4000]], 'PT Mayora Indah'],
      ['Teh Botol Sosro', 'Teh Botol Sosro Kotak', 'kotak', [['250 ml', 3800]], 'PT Sinar Sosro'],
      ['Pocari Sweat', 'Pocari Sweat', 'botol', [['500 ml', 8500]], 'PT Amerta Indah Otsuka'],
      ['Floridina', 'Floridina Orange', 'botol', [['350 ml', 4000]], 'PT Mayora Indah'],
      ['Coca-Cola', 'Coca-Cola', 'botol', [['390 ml', 6000], ['1.5 L', 15000]], 'PT Coca-Cola Distribution Indonesia'],
      ['Kratingdaeng', 'Kratingdaeng', 'botol', [['150 ml', 6500]], 'PT Asia Health Energi Beverages'],
      ['Extra Joss', 'Extra Joss Sachet', 'renceng', [['6 sachet', 9000]], 'PT Bintang Toedjoe'],
    ],
  },
  susu: {
    label: 'Susu & Olahan',
    code: 'SSU',
    items: [
      ['Frisian Flag', 'Susu Kental Manis Frisian Flag', 'kaleng', [['370 g', 13500]], 'PT Frisian Flag Indonesia'],
      ['Indomilk', 'Indomilk Susu Kental Manis Sachet', 'renceng', [['6 x 37 g', 9000]], 'PT Indolakto'],
      ['Ultra Milk', 'Ultra Milk Coklat', 'kotak', [['200 ml', 6500], ['1 L', 21000]], 'PT Ultrajaya Milk Industry'],
      ['Bear Brand', 'Bear Brand Susu Steril', 'kaleng', [['189 ml', 11000]], 'PT Nestle Indonesia'],
      ['Dancow', 'Dancow FortiGro Instant', 'box', [['400 g', 52000]], 'PT Nestle Indonesia'],
      ['Yakult', 'Yakult', 'pack', [['5 x 65 ml', 11500]], 'PT Yakult Indonesia Persada'],
    ],
  },
  'bumbu-dapur': {
    label: 'Bumbu Dapur',
    code: 'BMB',
    items: [
      ['Bango', 'Kecap Manis Bango', 'pouch', [['220 ml', 11500], ['550 ml', 24000]], 'PT Unilever Indonesia'],
      ['ABC', 'Kecap Manis ABC', 'botol', [['135 ml', 7000]], 'PT Heinz ABC Indonesia'],
      ['ABC', 'Saus Sambal ABC Extra Pedas', 'botol', [['335 ml', 15500]], 'PT Heinz ABC Indonesia'],
      ['Indofood', 'Sambal Indofood Pedas', 'botol', [['340 ml', 14500]], 'PT Indofood Sukses Makmur'],
      ['Royco', 'Royco Kaldu Ayam', 'renceng', [['12 x 8 g', 6000]], 'PT Unilever Indonesia'],
      ['Masako', 'Masako Rasa Sapi', 'renceng', [['12 x 9 g', 6000]], 'PT Ajinomoto Indonesia'],
      ['Ajinomoto', 'Ajinomoto MSG', 'pack', [['100 g', 5500]], 'PT Ajinomoto Indonesia'],
      ['Bamboe', 'Bamboe Bumbu Rendang', 'sachet', [['36 g', 6000]], 'PT Bamboe Indonesia'],
      ['Sasa', 'Tepung Bumbu Sasa', 'pack', [['210 g', 8500]], 'PT Sasa Inti'],
    ],
  },
  snack: {
    label: 'Snack & Camilan',
    code: 'SNK',
    items: [
      ['Chitato', 'Chitato Sapi Panggang', 'pack', [['68 g', 11500]], 'PT Indofood Fritolay Makmur'],
      ['Qtela', 'Qtela Keripik Singkong Balado', 'pack', [['60 g', 8000]], 'PT Indofood Fritolay Makmur'],
      ['Taro', 'Taro Net Seaweed', 'pack', [['65 g', 9000]], 'PT Rasa Mutu Utama'],
      ['Beng-Beng', 'Beng-Beng', 'pcs', [['20 g', 2500], ['box isi 20', 46000]], 'PT Mayora Indah'],
      ['SilverQueen', 'SilverQueen Cashew', 'pcs', [['58 g', 16500]], 'PT Petra Food'],
      ['Tango', 'Tango Wafer Coklat', 'pack', [['130 g', 9500]], 'PT Ultrajaya'],
      ['Roma', 'Roma Kelapa', 'pack', [['300 g', 11000]], 'PT Mayora Indah'],
      ['Khong Guan', 'Khong Guan Assorted Biscuits', 'kaleng', [['1.6 kg', 98000]], 'PT Khong Guan Biscuit'],
      ['Oreo', 'Oreo Original', 'pack', [['133 g', 9500]], 'PT Mondelez Indonesia'],
      ['Chiki', 'Chiki Balls Keju', 'pack', [['55 g', 6500]], 'PT Indofood Fritolay Makmur'],
    ],
  },
  'perawatan-diri': {
    label: 'Perawatan Diri',
    code: 'PRD',
    items: [
      ['Lifebuoy', 'Sabun Batang Lifebuoy Total 10', 'pcs', [['110 g', 5000]], 'PT Unilever Indonesia'],
      ['Lux', 'Sabun Cair Lux Soft Rose', 'pouch', [['450 ml', 24500]], 'PT Unilever Indonesia'],
      ['Nuvo', 'Sabun Batang Nuvo', 'pcs', [['72 g', 3500]], 'PT Wings Surya'],
      ['Pepsodent', 'Pasta Gigi Pepsodent', 'tube', [['190 g', 13500]], 'PT Unilever Indonesia'],
      ['Formula', 'Pasta Gigi Formula', 'tube', [['190 g', 12000]], 'PT Ultra Prima Abadi'],
      ['Sunsilk', 'Sampo Sunsilk Hitam', 'sachet', [['renceng 12 x 10 ml', 11000], ['botol 170 ml', 26000]], 'PT Unilever Indonesia'],
      ['Clear', 'Sampo Clear Men', 'botol', [['160 ml', 31000]], 'PT Unilever Indonesia'],
      ['Rexona', 'Rexona Men Roll On', 'botol', [['45 ml', 21000]], 'PT Unilever Indonesia'],
      ['Wardah', 'Wardah Lightening Facial Foam', 'tube', [['100 ml', 28000]], 'PT Paragon Technology & Innovation'],
    ],
  },
  kebersihan: {
    label: 'Kebersihan Rumah',
    code: 'KBR',
    items: [
      ['Rinso', 'Deterjen Rinso Anti Noda', 'pack', [['770 g', 24500]], 'PT Unilever Indonesia'],
      ['So Klin', 'Deterjen So Klin Softergent', 'pack', [['770 g', 19500]], 'PT Wings Surya'],
      ['Daia', 'Deterjen Daia Bunga', 'pack', [['850 g', 17000]], 'PT Wings Surya'],
      ['Sunlight', 'Sunlight Jeruk Nipis', 'pouch', [['755 ml', 17500]], 'PT Unilever Indonesia'],
      ['Mama Lemon', 'Mama Lemon Jeruk Nipis', 'pouch', [['780 ml', 15000]], 'PT Lion Wings'],
      ['Wipol', 'Wipol Karbol Wangi Cemara', 'pouch', [['750 ml', 15500]], 'PT Unilever Indonesia'],
      ['Baygon', 'Baygon Aerosol', 'kaleng', [['600 ml', 42000]], 'PT SC Johnson Indonesia'],
      ['Molto', 'Molto Pewangi Pakaian', 'pouch', [['800 ml', 19000]], 'PT Unilever Indonesia'],
    ],
  },
  rokok: {
    label: 'Rokok',
    code: 'RKK',
    items: [
      ['Sampoerna', 'Sampoerna Mild', 'bungkus', [['isi 16', 36000], ['slop 10 bks', 352000]], 'PT HM Sampoerna'],
      ['Gudang Garam', 'Gudang Garam Surya 12', 'bungkus', [['isi 12', 29500]], 'PT Gudang Garam'],
      ['Gudang Garam', 'Gudang Garam Filter Internasional', 'bungkus', [['isi 12', 25500]], 'PT Gudang Garam'],
      ['Djarum', 'Djarum Super', 'bungkus', [['isi 12', 26500]], 'PT Djarum'],
      ['Djarum', 'LA Bold', 'bungkus', [['isi 16', 33000]], 'PT Djarum'],
      ['Dji Sam Soe', 'Dji Sam Soe Kretek', 'bungkus', [['isi 12', 22000]], 'PT HM Sampoerna'],
    ],
  },
  'gas-energi': {
    label: 'Gas & Kebutuhan Rumah',
    code: 'GAS',
    items: [
      ['Pertamina', 'LPG 3 kg (Isi Ulang)', 'tabung', [['3 kg', 22000]], 'Pangkalan Resmi Pertamina'],
      ['Pertamina', 'Bright Gas', 'tabung', [['5.5 kg', 95000]], 'Pangkalan Resmi Pertamina'],
      ['ABC', 'Baterai ABC Alkaline AA', 'pack', [['isi 2', 12000]], 'PT International Chemical Industry'],
      ['Philips', 'Lampu LED Philips', 'pcs', [['10 W', 32000]], 'PT Signify Commercial Indonesia'],
      ['Tolak Angin', 'Tolak Angin Cair', 'box', [['5 sachet', 18000]], 'PT Sido Muncul'],
      ['Paseo', 'Tisu Paseo Smart', 'pack', [['250 sheet', 12500]], 'PT Indah Kiat Pulp & Paper'],
    ],
  },
};

/** Flattened catalog with stable per-variant identity (used by SKU/barcode). */
export const CATALOG = Object.entries(CATEGORIES).flatMap(([slug, cat]) =>
  cat.items.flatMap(([brand, name, unit, variants, supplier], itemIndex) =>
    variants.map(([variant, basePrice], variantIndex) => ({
      category: slug,
      categoryLabel: cat.label,
      categoryCode: cat.code,
      brand,
      name,
      unit,
      variant,
      basePrice,
      supplier,
      // Deterministic index so SKU/barcode stay stable for the same product.
      key: `${cat.code}-${String(itemIndex + 1).padStart(2, '0')}${variantIndex + 1}`,
    })),
  ),
);

export const MERCHANT_NAMES = [
  'WarungKu Bu Siti', 'Toko Berkah Jaya', 'Warung Madura 24 Jam', 'Toko Sembako Pak Haji', 'Kios Sumber Rezeki',
  'Toko Kelontong Makmur', 'Warung Bu Endang', 'Minimarket Barokah', 'Toko Sinar Abadi', 'Warung Mbak Yuni',
  'Toko Amanah Mart', 'Kedai Kopi Kenangan Senja', 'Warung Sejahtera', 'Toko Cahaya Baru', 'Agen Sembako Lancar',
];
