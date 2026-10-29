/**
 * 38 Provinsi Indonesia with Kemendagri-style region codes (used to build a
 * structurally valid NIK), representative Kota/Kabupaten, Kecamatan,
 * Kelurahan/Desa and Kode Pos.
 *
 * City entry: [kabKotaCode, name, { Kecamatan: [[Kelurahan, KodePos], ...] }]
 * `ethnic` biases which naming tradition is generated for residents.
 *
 * NOTE: Data is realistic but intentionally a curated subset — it is mock data,
 * not an authoritative administrative dataset.
 */

const DEFAULT = { modern: 4, jawa: 2 };

export const PROVINCES = [
  // ── Sumatera ───────────────────────────────────────────────────────────
  {
    code: '11', name: 'Aceh', aliases: ['nad', 'nanggroe aceh darussalam'], island: 'Sumatera',
    ethnic: { modern: 5, minang: 1, jawa: 1 },
    cities: [
      ['71', 'Kota Banda Aceh', {
        Baiturrahman: [['Peuniti', '23116'], ['Seutui', '23243'], ['Neusu Jaya', '23243']],
        'Syiah Kuala': [['Kopelma Darussalam', '23111'], ['Lamgugob', '23115']],
      }],
      ['73', 'Kota Lhokseumawe', {
        'Banda Sakti': [['Kampung Jawa Lama', '24351'], ['Keude Aceh', '24312']],
      }],
    ],
  },
  {
    code: '12', name: 'Sumatera Utara', aliases: ['sumut', 'north sumatra'], island: 'Sumatera',
    ethnic: { batak: 7, jawa: 2, modern: 2, minang: 1 },
    cities: [
      ['71', 'Kota Medan', {
        'Medan Baru': [['Darat', '20153'], ['Petisah Hulu', '20151'], ['Babura', '20153']],
        'Medan Petisah': [['Petisah Tengah', '20112'], ['Sekip', '20113']],
        'Medan Kota': [['Pasar Baru', '20212'], ['Teladan Barat', '20217']],
      }],
      ['72', 'Kota Pematangsiantar', {
        'Siantar Barat': [['Proklamasi', '21111'], ['Dwikora', '21115']],
      }],
      ['06', 'Kabupaten Toba', {
        Balige: [['Balige I', '22312'], ['Napitupulu Bagasan', '22313']],
        Laguboti: [['Pasar Laguboti', '22381']],
      }],
    ],
  },
  {
    code: '13', name: 'Sumatera Barat', aliases: ['sumbar', 'west sumatra'], island: 'Sumatera',
    ethnic: { minang: 9, modern: 2, jawa: 1 },
    cities: [
      ['71', 'Kota Padang', {
        'Padang Barat': [['Belakang Tangsi', '25118'], ['Olo', '25117']],
        'Padang Utara': [['Air Tawar Barat', '25132'], ['Ulak Karang Utara', '25133']],
        Kuranji: [['Pasar Ambacang', '25152']],
      }],
      ['75', 'Kota Bukittinggi', {
        'Guguk Panjang': [['Benteng Pasar Atas', '26111'], ['Bukit Cangang Kayu Ramang', '26114']],
        'Mandiangin Koto Selayan': [['Puhun Tembok', '26122']],
      }],
    ],
  },
  {
    code: '14', name: 'Riau', aliases: [], island: 'Sumatera',
    ethnic: { minang: 3, batak: 2, jawa: 2, modern: 3 },
    cities: [
      ['71', 'Kota Pekanbaru', {
        Sukajadi: [['Kampung Melayu', '28124'], ['Jadirejo', '28121']],
        'Pekanbaru Kota': [['Simpang Empat', '28111'], ['Sumahilang', '28113']],
        'Marpoyan Damai': [['Tangkerang Tengah', '28282']],
      }],
      ['73', 'Kota Dumai', {
        'Dumai Kota': [['Rimba Sekampung', '28812']],
      }],
    ],
  },
  {
    code: '15', name: 'Jambi', aliases: [], island: 'Sumatera',
    ethnic: { modern: 4, jawa: 2, minang: 2 },
    cities: [
      ['71', 'Kota Jambi', {
        Telanaipura: [['Telanaipura', '36122'], ['Pematang Sulur', '36124']],
        'Pasar Jambi': [['Pasar Jambi', '36111'], ['Orang Kayo Hitam', '36112']],
      }],
    ],
  },
  {
    code: '16', name: 'Sumatera Selatan', aliases: ['sumsel', 'south sumatra'], island: 'Sumatera',
    ethnic: { modern: 5, jawa: 2 },
    cities: [
      ['71', 'Kota Palembang', {
        'Ilir Barat I': [['Bukit Lama', '30139'], ['Lorok Pakjo', '30137']],
        'Bukit Kecil': [['19 Ilir', '30113'], ['Talang Semut', '30135']],
        'Seberang Ulu I': [['7 Ulu', '30251']],
      }],
    ],
  },
  {
    code: '17', name: 'Bengkulu', aliases: [], island: 'Sumatera',
    ethnic: { modern: 4, jawa: 2, minang: 1 },
    cities: [
      ['71', 'Kota Bengkulu', {
        'Ratu Agung': [['Kebun Tebeng', '38223'], ['Sawah Lebar', '38222']],
        'Gading Cempaka': [['Padang Harapan', '38225']],
      }],
    ],
  },
  {
    code: '18', name: 'Lampung', aliases: [], island: 'Sumatera',
    ethnic: { jawa: 5, sunda: 1, modern: 3 },
    cities: [
      ['71', 'Kota Bandar Lampung', {
        'Tanjung Karang Pusat': [['Durian Payung', '35116'], ['Gotong Royong', '35119']],
        Kedaton: [['Kedaton', '35141'], ['Sidodadi', '35143']],
        'Teluk Betung Utara': [['Gulak Galik', '35214']],
      }],
      ['72', 'Kota Metro', {
        'Metro Pusat': [['Metro', '34111'], ['Imopuro', '34111']],
      }],
    ],
  },
  {
    code: '19', name: 'Kepulauan Bangka Belitung', aliases: ['babel', 'bangka belitung'], island: 'Sumatera',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Pangkal Pinang', {
        'Taman Sari': [['Rawa Bangun', '33121'], ['Gedung Nasional', '33128']],
        Gerunggang: [['Bukit Intan', '33123']],
      }],
    ],
  },
  {
    code: '21', name: 'Kepulauan Riau', aliases: ['kepri', 'riau islands'], island: 'Sumatera',
    ethnic: { modern: 4, batak: 2, jawa: 2, minang: 1 },
    cities: [
      ['71', 'Kota Batam', {
        'Batam Kota': [['Belian', '29464'], ['Teluk Tering', '29444'], ['Baloi Permai', '29463']],
        'Lubuk Baja': [['Batu Selicin', '29444'], ['Lubuk Baja Kota', '29432']],
        Nongsa: [['Batu Besar', '29466']],
      }],
      ['72', 'Kota Tanjung Pinang', {
        'Tanjungpinang Kota': [['Tanjungpinang Kota', '29111']],
      }],
    ],
  },
  // ── Jawa ───────────────────────────────────────────────────────────────
  {
    code: '31', name: 'DKI Jakarta', aliases: ['dki', 'jakarta', 'jkt'], island: 'Jawa',
    ethnic: { jawa: 4, sunda: 2, batak: 1, minang: 1, modern: 5 },
    cities: [
      ['71', 'Kota Jakarta Pusat', {
        Menteng: [['Menteng', '10310'], ['Gondangdia', '10350'], ['Cikini', '10330']],
        Gambir: [['Gambir', '10110'], ['Cideng', '10150']],
        'Tanah Abang': [['Bendungan Hilir', '10210'], ['Kebon Melati', '10230']],
      }],
      ['72', 'Kota Jakarta Utara', {
        'Kelapa Gading': [['Kelapa Gading Barat', '14240'], ['Kelapa Gading Timur', '14240']],
        Penjaringan: [['Pluit', '14450'], ['Penjaringan', '14440']],
        'Tanjung Priok': [['Sunter Agung', '14350']],
      }],
      ['73', 'Kota Jakarta Barat', {
        'Grogol Petamburan': [['Tomang', '11440'], ['Grogol', '11450']],
        'Kebon Jeruk': [['Kebon Jeruk', '11530'], ['Sukabumi Utara', '11540']],
        Palmerah: [['Palmerah', '11480'], ['Slipi', '11410']],
      }],
      ['74', 'Kota Jakarta Selatan', {
        'Kebayoran Baru': [['Senayan', '12190'], ['Gunung', '12120'], ['Kramat Pela', '12130'], ['Melawai', '12160']],
        Tebet: [['Tebet Barat', '12810'], ['Tebet Timur', '12820'], ['Manggarai', '12850']],
        Setiabudi: [['Kuningan Timur', '12950'], ['Karet Semanggi', '12930']],
        'Mampang Prapatan': [['Kuningan Barat', '12710'], ['Tegal Parang', '12790']],
      }],
      ['75', 'Kota Jakarta Timur', {
        Jatinegara: [['Bali Mester', '13310'], ['Rawa Bunga', '13350']],
        'Duren Sawit': [['Pondok Bambu', '13430'], ['Duren Sawit', '13440']],
        Cakung: [['Cakung Barat', '13910']],
      }],
    ],
  },
  {
    code: '32', name: 'Jawa Barat', aliases: ['jabar', 'west java'], island: 'Jawa',
    ethnic: { sunda: 8, jawa: 2, modern: 3 },
    cities: [
      ['73', 'Kota Bandung', {
        Coblong: [['Dago', '40135'], ['Lebak Siliwangi', '40132'], ['Sekeloa', '40134']],
        Sukajadi: [['Pasteur', '40161'], ['Sukagalih', '40163']],
        'Bandung Wetan': [['Citarum', '40115'], ['Cihapit', '40114']],
      }],
      ['71', 'Kota Bogor', {
        'Bogor Tengah': [['Paledang', '16122'], ['Pabaton', '16121']],
        'Bogor Utara': [['Tegal Gundil', '16152']],
      }],
      ['75', 'Kota Bekasi', {
        'Bekasi Selatan': [['Kayuringin Jaya', '17144'], ['Pekayon Jaya', '17148']],
        'Bekasi Barat': [['Kranji', '17135']],
      }],
      ['76', 'Kota Depok', {
        Beji: [['Beji', '16421'], ['Kukusan', '16425']],
        'Pancoran Mas': [['Depok', '16431']],
      }],
      ['77', 'Kota Cimahi', {
        'Cimahi Tengah': [['Baros', '40521'], ['Cigugur Tengah', '40522']],
      }],
    ],
  },
  {
    code: '33', name: 'Jawa Tengah', aliases: ['jateng', 'central java'], island: 'Jawa',
    ethnic: { jawa: 9, modern: 2 },
    cities: [
      ['74', 'Kota Semarang', {
        'Semarang Tengah': [['Sekayu', '50132'], ['Pekunden', '50134']],
        Tembalang: [['Tembalang', '50275'], ['Bulusan', '50277']],
        Banyumanik: [['Banyumanik', '50264']],
      }],
      ['72', 'Kota Surakarta', {
        Laweyan: [['Laweyan', '57148'], ['Sondakan', '57147']],
        Banjarsari: [['Manahan', '57139'], ['Kestalan', '57133']],
      }],
      ['02', 'Kabupaten Banyumas', {
        Purwokerto: [['Sokanegara', '53115'], ['Kranji', '53116']],
      }],
    ],
  },
  {
    code: '34', name: 'DI Yogyakarta', aliases: ['diy', 'jogja', 'yogyakarta', 'yogya', 'daerah istimewa yogyakarta'], island: 'Jawa',
    ethnic: { jawa: 9, modern: 3 },
    cities: [
      ['71', 'Kota Yogyakarta', {
        Gondokusuman: [['Terban', '55223'], ['Demangan', '55221']],
        Kraton: [['Panembahan', '55131'], ['Patehan', '55133']],
        Umbulharjo: [['Warungboto', '55164']],
      }],
      ['04', 'Kabupaten Sleman', {
        Depok: [['Caturtunggal', '55281'], ['Condongcatur', '55283']],
        Mlati: [['Sinduadi', '55284']],
      }],
    ],
  },
  {
    code: '35', name: 'Jawa Timur', aliases: ['jatim', 'east java'], island: 'Jawa',
    ethnic: { jawa: 9, modern: 3 },
    cities: [
      ['78', 'Kota Surabaya', {
        Gubeng: [['Airlangga', '60286'], ['Gubeng', '60281']],
        Wonokromo: [['Darmo', '60241'], ['Ngagel', '60246']],
        Tegalsari: [['Keputran', '60265'], ['Tegalsari', '60262']],
        Sukolilo: [['Keputih', '60111'], ['Klampis Ngasem', '60117']],
      }],
      ['73', 'Kota Malang', {
        Lowokwaru: [['Ketawanggede', '65145'], ['Dinoyo', '65144']],
        Klojen: [['Klojen', '65111'], ['Oro-oro Dowo', '65119']],
      }],
      ['15', 'Kabupaten Sidoarjo', {
        Sidoarjo: [['Lemah Putro', '61213'], ['Sidokare', '61214']],
      }],
    ],
  },
  {
    code: '36', name: 'Banten', aliases: [], island: 'Jawa',
    ethnic: { sunda: 5, jawa: 3, modern: 4 },
    cities: [
      ['74', 'Kota Tangerang Selatan', {
        Serpong: [['Lengkong Gudang', '15321'], ['Rawa Mekar Jaya', '15310']],
        'Pondok Aren': [['Pondok Aren', '15224'], ['Jurang Mangu Barat', '15222']],
        Ciputat: [['Ciputat', '15411']],
      }],
      ['71', 'Kota Tangerang', {
        Tangerang: [['Sukaasih', '15111'], ['Babakan', '15118']],
        Karawaci: [['Karawaci', '15115']],
      }],
      ['73', 'Kota Serang', {
        Serang: [['Cimuncang', '42111'], ['Lontarbaru', '42115']],
      }],
    ],
  },
  // ── Bali & Nusa Tenggara ───────────────────────────────────────────────
  {
    code: '51', name: 'Bali', aliases: [], island: 'Bali & Nusa Tenggara',
    ethnic: { bali: 10, jawa: 1, modern: 1 },
    cities: [
      ['71', 'Kota Denpasar', {
        'Denpasar Selatan': [['Sanur', '80227'], ['Sesetan', '80223'], ['Panjer', '80225']],
        'Denpasar Barat': [['Dauh Puri', '80113']],
        'Denpasar Utara': [['Peguyangan', '80115']],
      }],
      ['03', 'Kabupaten Badung', {
        Kuta: [['Kuta', '80361'], ['Legian', '80361'], ['Seminyak', '80361']],
        'Kuta Selatan': [['Jimbaran', '80364'], ['Benoa', '80363']],
      }],
      ['04', 'Kabupaten Gianyar', {
        Ubud: [['Ubud', '80571'], ['Peliatan', '80571']],
      }],
    ],
  },
  {
    code: '52', name: 'Nusa Tenggara Barat', aliases: ['ntb', 'west nusa tenggara'], island: 'Bali & Nusa Tenggara',
    ethnic: { modern: 5, bali: 2, jawa: 1 },
    cities: [
      ['71', 'Kota Mataram', {
        Ampenan: [['Ampenan Tengah', '83114'], ['Pejeruk', '83113']],
        Selaparang: [['Rembiga', '83124'], ['Gomong', '83127']],
      }],
    ],
  },
  {
    code: '53', name: 'Nusa Tenggara Timur', aliases: ['ntt', 'east nusa tenggara'], island: 'Bali & Nusa Tenggara',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Kupang', {
        Oebobo: [['Oebobo', '85111'], ['Oetete', '85112']],
        'Kelapa Lima': [['Oesapa', '85228']],
      }],
    ],
  },
  // ── Kalimantan ─────────────────────────────────────────────────────────
  {
    code: '61', name: 'Kalimantan Barat', aliases: ['kalbar', 'west kalimantan'], island: 'Kalimantan',
    ethnic: { modern: 5, jawa: 2 },
    cities: [
      ['71', 'Kota Pontianak', {
        'Pontianak Kota': [['Sungai Bangkong', '78113'], ['Darat Sekip', '78117']],
        'Pontianak Selatan': [['Benua Melayu Darat', '78122']],
      }],
      ['72', 'Kota Singkawang', {
        'Singkawang Barat': [['Pasiran', '79123']],
      }],
    ],
  },
  {
    code: '62', name: 'Kalimantan Tengah', aliases: ['kalteng', 'central kalimantan'], island: 'Kalimantan',
    ethnic: { modern: 4, jawa: 3 },
    cities: [
      ['71', 'Kota Palangka Raya', {
        'Jekan Raya': [['Palangka', '73112'], ['Menteng', '73111']],
        Pahandut: [['Langkai', '73111']],
      }],
    ],
  },
  {
    code: '63', name: 'Kalimantan Selatan', aliases: ['kalsel', 'south kalimantan'], island: 'Kalimantan',
    ethnic: { modern: 5, jawa: 2 },
    cities: [
      ['71', 'Kota Banjarmasin', {
        'Banjarmasin Tengah': [['Kertak Baru Ilir', '70111'], ['Teluk Dalam', '70117']],
        'Banjarmasin Utara': [['Sungai Miai', '70123']],
      }],
      ['72', 'Kota Banjarbaru', {
        'Banjarbaru Utara': [['Loktabat Utara', '70714']],
      }],
    ],
  },
  {
    code: '64', name: 'Kalimantan Timur', aliases: ['kaltim', 'east kalimantan'], island: 'Kalimantan',
    ethnic: { jawa: 3, modern: 4, batak: 1 },
    cities: [
      ['72', 'Kota Samarinda', {
        'Samarinda Ulu': [['Air Hitam', '75124'], ['Dadi Mulya', '75123']],
        'Samarinda Kota': [['Bugis', '75121']],
      }],
      ['71', 'Kota Balikpapan', {
        'Balikpapan Kota': [['Klandasan Ilir', '76113'], ['Damai', '76114']],
        'Balikpapan Selatan': [['Sepinggan', '76115']],
      }],
    ],
  },
  {
    code: '65', name: 'Kalimantan Utara', aliases: ['kaltara', 'north kalimantan'], island: 'Kalimantan',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Tarakan', {
        'Tarakan Barat': [['Karang Anyar', '77111']],
        'Tarakan Tengah': [['Pamusian', '77113']],
      }],
    ],
  },
  // ── Sulawesi ───────────────────────────────────────────────────────────
  {
    code: '71', name: 'Sulawesi Utara', aliases: ['sulut', 'north sulawesi'], island: 'Sulawesi',
    ethnic: { modern: 6, jawa: 1 },
    cities: [
      ['71', 'Kota Manado', {
        Wenang: [['Wenang Utara', '95111'], ['Tikala Kumaraka', '95124']],
        Malalayang: [['Malalayang Satu', '95115']],
        Sario: [['Sario', '95114']],
      }],
    ],
  },
  {
    code: '72', name: 'Sulawesi Tengah', aliases: ['sulteng', 'central sulawesi'], island: 'Sulawesi',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Palu', {
        'Palu Barat': [['Ujuna', '94111'], ['Kamonji', '94112']],
        'Palu Timur': [['Besusu Tengah', '94118']],
      }],
    ],
  },
  {
    code: '73', name: 'Sulawesi Selatan', aliases: ['sulsel', 'south sulawesi'], island: 'Sulawesi',
    ethnic: { modern: 6, jawa: 1 },
    cities: [
      ['71', 'Kota Makassar', {
        Panakkukang: [['Pandang', '90231'], ['Masale', '90231']],
        Tamalanrea: [['Tamalanrea', '90245'], ['Tamalanrea Indah', '90245']],
        'Ujung Pandang': [['Losari', '90111'], ['Baru', '90174']],
      }],
      ['73', 'Kota Parepare', {
        Bacukiki: [['Lemoe', '91125']],
      }],
    ],
  },
  {
    code: '74', name: 'Sulawesi Tenggara', aliases: ['sultra', 'southeast sulawesi'], island: 'Sulawesi',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Kendari', {
        Kadia: [['Kadia', '93117'], ['Pondambea', '93115']],
        Mandonga: [['Mandonga', '93111']],
      }],
    ],
  },
  {
    code: '75', name: 'Gorontalo', aliases: [], island: 'Sulawesi',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Gorontalo', {
        'Kota Selatan': [['Biawu', '96115'], ['Limba B', '96115']],
        Dungingi: [['Libuo', '96138']],
      }],
    ],
  },
  {
    code: '76', name: 'Sulawesi Barat', aliases: ['sulbar', 'west sulawesi'], island: 'Sulawesi',
    ethnic: DEFAULT,
    cities: [
      ['04', 'Kabupaten Mamuju', {
        Mamuju: [['Binanga', '91511'], ['Karema', '91511']],
        Simboro: [['Simboro', '91512']],
      }],
    ],
  },
  // ── Maluku & Papua ─────────────────────────────────────────────────────
  {
    code: '81', name: 'Maluku', aliases: [], island: 'Maluku',
    ethnic: { modern: 6, jawa: 1 },
    cities: [
      ['71', 'Kota Ambon', {
        Sirimau: [['Batu Merah', '97128'], ['Honipopu', '97121']],
        Nusaniwe: [['Benteng', '97117']],
      }],
    ],
  },
  {
    code: '82', name: 'Maluku Utara', aliases: ['malut', 'north maluku'], island: 'Maluku',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Ternate', {
        'Ternate Tengah': [['Gamalama', '97721'], ['Stadion', '97722']],
        'Ternate Selatan': [['Kalumata', '97719']],
      }],
    ],
  },
  {
    code: '91', name: 'Papua', aliases: [], island: 'Papua',
    ethnic: { modern: 6, jawa: 2 },
    cities: [
      ['71', 'Kota Jayapura', {
        'Jayapura Utara': [['Gurabesi', '99111'], ['Bayangkara', '99112']],
        Abepura: [['Kota Baru', '99351']],
        Heram: [['Waena', '99358']],
      }],
    ],
  },
  {
    code: '92', name: 'Papua Barat', aliases: ['west papua', 'pabar'], island: 'Papua',
    ethnic: DEFAULT,
    cities: [
      ['02', 'Kabupaten Manokwari', {
        'Manokwari Barat': [['Padarni', '98312'], ['Sanggeng', '98312']],
      }],
    ],
  },
  {
    code: '93', name: 'Papua Selatan', aliases: ['south papua'], island: 'Papua',
    ethnic: DEFAULT,
    cities: [
      ['01', 'Kabupaten Merauke', {
        Merauke: [['Kelapa Lima', '99614'], ['Seringgu Jaya', '99611']],
      }],
    ],
  },
  {
    code: '94', name: 'Papua Tengah', aliases: ['central papua'], island: 'Papua',
    ethnic: DEFAULT,
    cities: [
      ['01', 'Kabupaten Nabire', {
        Nabire: [['Oyehe', '98811'], ['Kalibobo', '98815']],
      }],
    ],
  },
  {
    code: '95', name: 'Papua Pegunungan', aliases: ['highland papua'], island: 'Papua',
    ethnic: DEFAULT,
    cities: [
      ['01', 'Kabupaten Jayawijaya', {
        Wamena: [['Wamena Kota', '99511'], ['Sinakma', '99511']],
      }],
    ],
  },
  {
    code: '96', name: 'Papua Barat Daya', aliases: ['southwest papua'], island: 'Papua',
    ethnic: DEFAULT,
    cities: [
      ['71', 'Kota Sorong', {
        'Sorong Manoi': [['Remu Utara', '98412'], ['Malabutor', '98415']],
      }],
    ],
  },
];

export const STREETS = [
  'Jl. Jenderal Sudirman', 'Jl. M.H. Thamrin', 'Jl. Gatot Subroto', 'Jl. Diponegoro', 'Jl. Ahmad Yani',
  'Jl. Pahlawan', 'Jl. Merdeka', 'Jl. Gajah Mada', 'Jl. Hayam Wuruk', 'Jl. Imam Bonjol', 'Jl. Pemuda',
  'Jl. Veteran', 'Jl. R.A. Kartini', 'Jl. Cut Nyak Dien', 'Jl. Teuku Umar', 'Jl. Pattimura',
  'Jl. Sisingamangaraja', 'Jl. Sultan Hasanuddin', 'Jl. Dr. Sutomo', 'Jl. Ki Hajar Dewantara',
  'Jl. Pangeran Diponegoro', 'Jl. Kapten Tendean', 'Jl. Raden Saleh', 'Jl. Dewi Sartika',
  'Jl. Melati', 'Jl. Mawar', 'Jl. Kenanga', 'Jl. Anggrek', 'Jl. Flamboyan', 'Jl. Cempaka', 'Jl. Kamboja',
  'Jl. Manggis', 'Jl. Rambutan', 'Jl. Durian', 'Jl. Nangka', 'Jl. Belimbing', 'Jl. Sawo',
  'Jl. Pelita', 'Jl. Damai', 'Jl. Sejahtera', 'Jl. Bhayangkara', 'Jl. Kenari', 'Jl. Cendrawasih',
  'Jl. Merpati', 'Jl. Rajawali', 'Jl. Garuda', 'Jl. Kutilang', 'Jl. Nusantara', 'Jl. Pramuka',
];

export const GANG_PREFIX = ['Gg.', 'Gang'];
export const PERUMAHAN = [
  'Perum Griya Asri', 'Perumahan Taman Sari Indah', 'Komplek Bumi Permai', 'Perum Villa Mutiara',
  'Cluster Green Residence', 'Perumahan Citra Garden', 'Komplek Pondok Indah Lestari', 'Perum Graha Harmoni',
];

/** Flattened lookup helpers ------------------------------------------------- */

export const CITY_INDEX = PROVINCES.flatMap((prov) =>
  prov.cities.map(([code, name, districts]) => ({
    province: prov,
    code,
    name,
    shortName: name.replace(/^(Kota|Kabupaten)\s+/, ''),
    districts: Object.entries(districts).map(([kecName, villages], i) => ({
      name: kecName,
      code: String(i + 1).padStart(2, '0'),
      villages: villages.map(([village, postal]) => ({ name: village, postal })),
    })),
  })),
);
