# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **IndoMock**! Project ini dibangun untuk mempermudah developer mobile, frontend, dan backend di Indonesia dalam mendapatkan data mock realistis.

## 🛠️ Persyaratan Lingkungan (Prerequisites)

- **Node.js**: v20.19.0 atau lebih baru
- **npm**: v10 atau lebih baru
- **Git**

## 🚀 Alur Pengembangan Lokal (Local Workflow)

1. **Fork & Clone Repository:**
   ```bash
   git clone https://github.com/hokacristian/indomock.git
   cd indomock
   ```

2. **Pasang Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Mode Development (Hot-Reload):**
   ```bash
   npm run dev
   ```
   * Express API berjalan di: `http://localhost:3006`
   * Vite UI berjalan di: `http://localhost:5173` (otomatis mem-proxy `/api` ke Express)

4. **Menjalankan Selftest / Integrity Check:**
   ```bash
   npm run test:api
   ```

## 📂 Struktur Kode Utama

- `server/generators/`: Seluruh engine generator data sintetik khas Indonesia.
  - `data/people.js`: Pool nama Indonesia (Jawa, Sunda, Batak, Minang, Bali, modern).
  - `data/regions.js`: Data 38 provinsi, kota/kabupaten, dan kodepos.
  - `data/catalog.js`: Katalog 116+ produk UMKM/ritel harian.
  - `users.js`: Algoritma perhitungan NIK KTP 16 digit & validasi gender.
- `src/`: Aplikasi web interaktif (React + Tailwind CSS).
  - `src/tabs/`: Tab Generator, Playground API, dan Network Simulator.

## 🤝 Standar Pull Request (PR)

- Gunakan format commit konvensional: `feat:`, `fix:`, `docs:`, atau `refactor:`.
- Pastikan build tidak error sebelum membuat PR: `npm run build`.
- Jangan menyertakan data pribadi asli (*no real PII*). Seluruh data dalam project ini harus berupa data sintetik tiruan.
- Buka PR ke branch `main`.

Selamat berkontribusi! 🇮🇩
