/**
 * Indonesian naming traditions + demographic reference data.
 */

export const NAMES = {
  jawa: {
    male: ['Budi', 'Agus', 'Joko', 'Bambang', 'Slamet', 'Wahyu', 'Teguh', 'Hadi', 'Sutrisno', 'Bagus', 'Dwi',
      'Eko', 'Tri', 'Adi', 'Gilang', 'Danang', 'Yudi', 'Suryo', 'Bayu', 'Aji', 'Anang', 'Heru', 'Sigit', 'Rudi'],
    female: ['Sri', 'Siti', 'Dewi', 'Endang', 'Lestari', 'Rahayu', 'Wulan', 'Sekar', 'Ayu', 'Ratna', 'Kartika',
      'Tutik', 'Sulastri', 'Retno', 'Puji', 'Galuh', 'Wening', 'Indah', 'Yuni', 'Dian', 'Nur'],
    middle: { male: ['Setyo', 'Budi', 'Adi', 'Hadi', 'Tri', 'Dwi'], female: ['Ayu', 'Sri', 'Dwi', 'Tri', 'Puspita'] },
    last: {
      male: ['Santoso', 'Prasetyo', 'Nugroho', 'Saputro', 'Kurniawan', 'Setiawan', 'Susanto', 'Wibowo', 'Purnomo',
        'Handoko', 'Utomo', 'Hartono', 'Suryadi', 'Wicaksono', 'Raharjo', 'Sulistyo', 'Hermanto', 'Widodo'],
      female: ['Rahmawati', 'Lestari', 'Wulandari', 'Kusumawati', 'Puspitasari', 'Handayani', 'Pratiwi',
        'Anggraini', 'Susilowati', 'Rahayu', 'Mulyani', 'Setyaningsih', 'Wahyuningsih'],
    },
  },
  sunda: {
    male: ['Asep', 'Ujang', 'Dadang', 'Cecep', 'Deden', 'Jajang', 'Ade', 'Engkus', 'Iwan', 'Yayan', 'Dede',
      'Ridwan', 'Rizal', 'Ilham', 'Wawan', 'Endang', 'Aep', 'Ahmad'],
    female: ['Euis', 'Neneng', 'Imas', 'Lilis', 'Entin', 'Yeni', 'Nining', 'Siti', 'Cucu', 'Rina', 'Teti',
      'Nenden', 'Yuyun', 'Ai', 'Neng', 'Elis', 'Rini'],
    middle: { male: ['Saepul', 'Ahmad', 'Muhammad'], female: ['Siti', 'Nur', 'Dewi'] },
    last: {
      male: ['Sunarya', 'Permana', 'Hermawan', 'Gunawan', 'Kusnadi', 'Sopandi', 'Suherman', 'Ruhiyat', 'Hidayat',
        'Supriatna', 'Sukmana', 'Rustandi', 'Firmansyah', 'Nugraha', 'Kurnia', 'Ramdani'],
      female: ['Rahayu', 'Nurhayati', 'Komalasari', 'Maryani', 'Rosmiati', 'Sumiati', 'Kurniasih', 'Nurjanah',
        'Fitriani', 'Rohaeti'],
    },
  },
  batak: {
    male: ['Togar', 'Parlin', 'Horas', 'Benny', 'Jonatan', 'Roy', 'Ronald', 'Hotman', 'Martin', 'Daniel',
      'Sahat', 'Bonar', 'Tigor', 'Poltak', 'Juan', 'Samuel', 'Fernando', 'Erwin', 'Ucok'],
    female: ['Rosmawati', 'Lusiana', 'Tiurma', 'Debora', 'Ruth', 'Maria', 'Nova', 'Romauli', 'Sondang', 'Lamria',
      'Monika', 'Yohana', 'Rotua', 'Tiomina', 'Grace'],
    middle: { male: ['Parulian', 'Hamonangan', 'Partogi'], female: ['Br.', 'Rosa', 'Elisabeth'] },
    marga: ['Siregar', 'Nasution', 'Simanjuntak', 'Hutapea', 'Sitompul', 'Pardede', 'Situmorang', 'Sinaga',
      'Simatupang', 'Harahap', 'Lubis', 'Panjaitan', 'Hutagalung', 'Manurung', 'Sihombing', 'Tambunan',
      'Napitupulu', 'Silalahi', 'Ginting', 'Tarigan', 'Sembiring', 'Simbolon', 'Sitorus', 'Pasaribu', 'Marpaung'],
  },
  minang: {
    male: ['Rizki', 'Fadli', 'Ilham', 'Hendra', 'Yusuf', 'Fikri', 'Zulkifli', 'Arif', 'Andika', 'Taufik',
      'Rahmat', 'Irfan', 'Afrizal', 'Yulizar', 'Doni', 'Febri', 'Syafrizal', 'Ikhsan'],
    female: ['Fitri', 'Rahmi', 'Yulia', 'Mardiana', 'Nurul', 'Silvia', 'Dina', 'Rani', 'Weni', 'Zahra',
      'Yusnita', 'Elfira', 'Mutia', 'Rahmah', 'Desi', 'Fauziah'],
    middle: { male: ['Datuak', 'Rizal', 'Arief'], female: ['Nur', 'Siti', 'Rahmi'] },
    last: {
      male: ['Putra', 'Syahputra', 'Rahman', 'Hamzah', 'Chaniago', 'Koto', 'Piliang', 'Tanjung', 'Sikumbang',
        'Jambak', 'Guci', 'Effendi', 'Malin'],
      female: ['Putri', 'Rahmah', 'Yanti', 'Chaniago', 'Koto', 'Piliang', 'Tanjung', 'Sari', 'Wahyuni', 'Fitriani'],
    },
  },
  bali: {
    birthOrder: [['Wayan', 'Putu', 'Gede'], ['Made', 'Kadek', 'Nengah'], ['Nyoman', 'Komang'], ['Ketut']],
    male: ['Sudarma', 'Suarta', 'Artawan', 'Wirawan', 'Darmawan', 'Sukadana', 'Arimbawa', 'Budiarsa',
      'Mertayasa', 'Adnyana', 'Suardana', 'Yasa', 'Widiana', 'Sutama', 'Ariawan', 'Parwata'],
    female: ['Sri Wahyuni', 'Ayu Lestari', 'Ratna Dewi', 'Sukerti', 'Suartini', 'Wiryani', 'Puspawati',
      'Ayu Kartika', 'Sariasih', 'Mariani', 'Ayu Diah', 'Wulandari', 'Juliantari'],
    nobility: { male: ['I Gusti Ngurah', 'I Gusti Bagus', 'Anak Agung', 'Ida Bagus', 'Cokorda'], female: ['I Gusti Ayu', 'Anak Agung Ayu', 'Ida Ayu'] },
  },
  modern: {
    male: ['Rafael', 'Kenzo', 'Arkan', 'Bima', 'Rizky', 'Dimas', 'Kevin', 'Nathan', 'Alvaro', 'Rayhan', 'Fathan',
      'Daffa', 'Raka', 'Aldo', 'Farrel', 'Gibran', 'Haikal', 'Javier', 'Keanu', 'Arsenio', 'Bryan', 'Satria'],
    female: ['Aurelia', 'Nadia', 'Alya', 'Kirana', 'Shafira', 'Naura', 'Keisha', 'Zahra', 'Salsabila', 'Anindya',
      'Clarissa', 'Tiara', 'Aisyah', 'Nayla', 'Calista', 'Michelle', 'Valerie', 'Jessica', 'Kezia', 'Amanda'],
    middle: { male: ['Aditya', 'Putra', 'Rizky', 'Arya', 'Dwi'], female: ['Putri', 'Ayu', 'Nabila', 'Maharani', 'Dwi'] },
    last: {
      male: ['Pratama', 'Ramadhan', 'Firmansyah', 'Maulana', 'Hakim', 'Wijaya', 'Kusuma', 'Halim', 'Gunawan',
        'Santoso', 'Hartanto', 'Tanuwijaya', 'Salim', 'Saputra', 'Hidayat', 'Kurniawan', 'Wirawan', 'Nugraha'],
      female: ['Putri', 'Maharani', 'Anjani', 'Ramadhani', 'Wijaya', 'Kusuma', 'Halim', 'Permata', 'Safitri',
        'Azzahra', 'Larasati', 'Tanuwijaya', 'Gunawan', 'Lestari', 'Paramitha'],
    },
  },
};

export const ETHNICITY_LABEL = {
  jawa: 'Jawa',
  sunda: 'Sunda',
  batak: 'Batak',
  minang: 'Minangkabau',
  bali: 'Bali',
  modern: 'Modern / Urban',
};

/** Phone prefixes by operator (all are real allocated mobile prefixes). */
export const OPERATORS = [
  { name: 'Telkomsel', weight: 45, prefixes: ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'] },
  { name: 'Indosat', weight: 22, prefixes: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'] },
  { name: 'XL', weight: 20, prefixes: ['0817', '0818', '0819', '0859', '0877', '0878', '0831', '0832', '0833', '0838'] },
  { name: 'Tri', weight: 13, prefixes: ['0895', '0896', '0897', '0898', '0899'] },
];

/** National distribution (approx. BPS), overridden for Bali/Sumut/etc. */
export const RELIGION_WEIGHTS = {
  default: { Islam: 87, 'Kristen Protestan': 7, Katolik: 3, Hindu: 1.5, Buddha: 1, Konghucu: 0.5 },
  bali: { Hindu: 86, Islam: 10, 'Kristen Protestan': 2, Katolik: 1, Buddha: 1 },
  batak: { 'Kristen Protestan': 60, Islam: 30, Katolik: 10 },
  minang: { Islam: 99, 'Kristen Protestan': 1 },
  eastern: { 'Kristen Protestan': 55, Katolik: 20, Islam: 25 },
};
export const EASTERN_PROVINCES = new Set(['53', '71', '81', '91', '92', '93', '94', '95', '96']);

export const MARITAL = { 'Belum Kawin': 40, Kawin: 52, 'Cerai Hidup': 5, 'Cerai Mati': 3 };
export const BLOOD_TYPES = { O: 38, A: 26, B: 29, AB: 7 };

export const OCCUPATIONS = [
  'Karyawan Swasta', 'Wiraswasta', 'Pegawai Negeri Sipil (PNS)', 'Pelajar/Mahasiswa', 'Guru', 'Dosen',
  'Petani/Pekebun', 'Pedagang', 'Software Engineer', 'UI/UX Designer', 'Data Analyst', 'Driver Ojol',
  'Perawat', 'Dokter', 'Buruh Harian Lepas', 'Ibu Rumah Tangga', 'TNI', 'POLRI', 'Content Creator',
  'Barista', 'Akuntan', 'Pemilik UMKM', 'Nelayan', 'Arsitek', 'Apoteker',
];

export const EMAIL_DOMAINS = { 'gmail.com': 60, 'yahoo.co.id': 12, 'yahoo.com': 6, 'outlook.com': 8, 'hotmail.com': 4, 'ymail.com': 2, 'icloud.com': 3, 'proton.me': 2 };
