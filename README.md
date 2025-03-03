# Waktu Solat - Jadwal Sholat Indonesia

Aplikasi jadwal sholat untuk seluruh wilayah di Indonesia dengan data dari jadwalsholat.org.

## Fitur

- Jadwal sholat untuk seluruh wilayah di Indonesia
- Deteksi lokasi otomatis berdasarkan IP
- Tampilan waktu sholat berikutnya dengan countdown
- Tampilan tanggal Hijriah
- Mode gelap/terang
- Responsif untuk semua ukuran layar

## Teknologi

- Next.js 14
- TypeScript
- Tailwind CSS
- Axios

## Menjalankan dengan Docker

### Prasyarat

- Docker
- Docker Compose

### Langkah-langkah

1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/waktusolat.git
   cd waktusolat
   ```

2. Salin file `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

3. Jalankan aplikasi dengan Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Aplikasi akan berjalan di http://0.0.0.0:3030 atau http://localhost:3030

### Perintah Docker Lainnya

- Melihat log:
  ```bash
  docker-compose logs -f
  ```

- Menghentikan aplikasi:
  ```bash
  docker-compose down
  ```

- Membangun ulang aplikasi:
  ```bash
  docker-compose up -d --build
  ```

## Pengembangan Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```

2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

3. Buka http://localhost:3030 di browser Anda.

## Lisensi

MIT

