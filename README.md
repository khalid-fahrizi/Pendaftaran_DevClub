# Documentation: Portal Pendaftaran DevClub SMK Tunas Media

## 1. Deskripsi Proyek
Sistem Pendaftaran Anggota Klub Coding berbasis Web Interaktif (Client-Server Architecture) yang dibangun
menggunakan kombinasi HTML5, TailwindCSS, JavaScript Async Fetch, dan PHP REST API dengan database MySQL.

## 2. Struktur Direktori Proyek
```
devclub_portal/
├── index.html   # Antarmuka Form Utama (Frontend Statis & UI)
├── app.js       # Client-side Logic (DOM Event, Validation, Fetch API)
├── api.php      # Backend Handler (Server-side Processing & DB Connection)
└── README.md    # Dokumen Petunjuk & Arsitektur Sistem
```

## 3. Spesifikasi API Endpoint
- **URL**: `api.php?action=daftar`
- **Method**: `POST`
- **Header**: `Content-Type: application/json`
- **Payload Request (JSON)**:
```json
{
  "nis": "20261012",
  "nama": "Kirno Utomo",
  "divisi": "Web Development",
  "email": "kirno@example.com"
}
```
- **Response Success (JSON)**:
```json
{
  "status": "success",
  "message": "Selamat! Data pendaftaran berhasil disimpan."
}
```
- **Response Error (JSON)**:
```json
{
  "status": "error",
  "message": "Semua field formulir wajib diisi!"
}
```

## 4. Analisis Keamanan & Validasi (Dual-Layer Validation)
- **Client-Side (JavaScript RegEx)**: Memvalidasi format NIS (8 digit) dan format email sebelum request
  dikirim ke server, untuk efisiensi UX dan bandwidth.
- **Server-Side (PHP Prepared Statement)**: Memverifikasi ulang kelengkapan dan format parameter
  (NIS, email) di server — karena validasi client-side dapat dilewati (mis. via request langsung ke API) —
  serta mengamankan query database dari serangan SQL Injection menggunakan Prepared Statement.

## 5. Catatan Perbaikan Bug (Bugfix Log)
Selama pengerjaan jobsheet ini, ditemukan dan diperbaiki beberapa bug pada kode contoh:

| No | Lokasi | Bug | Perbaikan |
|----|--------|-----|-----------|
| 1 | `api.php` | Jika `action`/method tidak sesuai, tidak ada output JSON sama sekali → `response.json()` di frontend gagal parsing | Ditambahkan blok `else` yang selalu mengembalikan JSON dengan `http_response_code(400)` |
| 2 | `api.php` | Koneksi mysqli belum menggunakan charset `utf8mb4` → risiko encoding nama rusak | Ditambahkan `$conn->set_charset("utf8mb4")` |
| 3 | `api.php` | Tidak ada validasi format NIS & email di sisi server (hanya client-side) | Ditambahkan `preg_match()` untuk NIS dan `filter_var(..., FILTER_VALIDATE_EMAIL)` untuk email |
| 4 | `app.js` | Tidak mengecek `response.ok` sebelum `response.json()` → error tidak informatif saat server error 500 | Ditambahkan pengecekan `if (!response.ok) throw new Error(...)` |
| 5 | `app.js` | Tombol submit tidak dinonaktifkan saat proses kirim → berpotensi double-submit | Ditambahkan `btnSubmit.disabled = true` selama proses fetch, dikembalikan di blok `finally` |

## 6. Cara Menjalankan Proyek
1. Salin folder `devclub_portal` ke `C:\xampp\htdocs\`.
2. Jalankan Apache dan MySQL melalui XAMPP Control Panel.
3. Buka phpMyAdmin, buat database `db_devclub`, lalu jalankan skrip SQL pembuatan tabel `pendaftaran`.
4. Akses `http://localhost/devclub_portal/index.html` melalui browser.
5. Isi formulir dan uji coba pengiriman data.
