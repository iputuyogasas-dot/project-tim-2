# PRD (Product Requirement Document)
## Sistem Pemesanan Menu Makanan Berbasis Barcode Meja

---

## 1. Latar Belakang

Restoran/cafe membutuhkan sistem pemesanan digital yang memungkinkan pelanggan memesan makanan langsung dari meja masing-masing tanpa perlu memanggil pelayan. Setiap meja memiliki barcode/QR code unik. Ketika pelanggan memindai barcode tersebut, sistem akan mengidentifikasi meja tempat pelanggan duduk, sehingga pesanan yang dibuat otomatis tertaut ke meja tersebut dan masuk ke dashboard admin untuk diproses.

Pembayaran dilakukan secara manual (bukan payment gateway) — pelanggan mentransfer ke rekening yang ditampilkan di website, lalu mengunggah bukti transfer. Admin akan memverifikasi pesanan dan bukti pembayaran sebelum pesanan disetujui (ACC) dan diproses ke dapur.

---

## 2. Tujuan Produk

- Mempermudah pelanggan memesan makanan langsung dari meja via scan barcode.
- Mengurangi beban kerja pelayan dalam pencatatan pesanan manual.
- Memberikan kontrol penuh kepada admin/kasir untuk verifikasi pesanan & pembayaran sebelum diproses.
- Menyediakan pencatatan transaksi yang lebih rapi dan terpusat di database.

---

## 3. Target Pengguna (User Roles)

| Role | Deskripsi |
|---|---|
| **Customer (Pelanggan)** | Memindai barcode meja, melihat menu, melakukan pemesanan, upload bukti pembayaran, memantau status pesanan |
| **Admin/Kasir** | Melihat pesanan masuk per meja, meng-ACC atau menolak pesanan, memverifikasi bukti pembayaran, mengelola menu, mengelola meja & barcode |

*(Opsional untuk pengembangan lanjutan: Role Dapur/Kitchen untuk melihat pesanan yang sudah di-ACC)*

---

## 4. Alur Penggunaan (User Flow)

### 4.1 Alur Pelanggan
1. Pelanggan duduk di meja, misal **Meja 1**.
2. Pelanggan scan barcode/QR di meja tersebut menggunakan HP.
3. Website terbuka otomatis dengan konteks **meja = 1** (melalui parameter unik/token di URL).
4. Pelanggan melihat daftar menu (kategori: makanan, minuman, snack, dll).
5. Pelanggan menambahkan item ke keranjang, atur jumlah (qty), catatan tambahan (misal: "tidak pedas").
6. Pelanggan checkout → sistem menampilkan ringkasan pesanan & total harga.
7. Sistem menampilkan informasi rekening bank untuk transfer (nama bank, no. rekening, atas nama, nominal yang harus dibayar).
8. Pelanggan melakukan transfer manual via m-banking/ATM.
9. Pelanggan upload bukti transfer (foto/screenshot) ke sistem.
10. Status pesanan menjadi **"Menunggu Verifikasi"**.
11. Pelanggan dapat memantau status pesanan secara real-time (Menunggu Verifikasi → Dikonfirmasi/ACC → Diproses → Selesai) atau (Ditolak, jika bukti pembayaran tidak valid).

### 4.2 Alur Admin
1. Admin login ke dashboard admin.
2. Admin melihat daftar pesanan masuk, dikelompokkan per meja & status.
3. Admin membuka detail pesanan → melihat item pesanan, total harga, dan bukti pembayaran yang diupload.
4. Admin memverifikasi kesesuaian nominal transfer dengan bukti pembayaran.
5. Admin melakukan aksi:
   - **ACC / Konfirmasi** → status pesanan berubah menjadi "Dikonfirmasi", pesanan diteruskan ke dapur.
   - **Tolak** → status berubah menjadi "Ditolak", pelanggan bisa upload ulang bukti pembayaran atau membatalkan pesanan.
6. Admin dapat mengubah status lanjutan: "Diproses" → "Selesai" / "Diantar".
7. Admin dapat mengelola data menu (tambah/edit/hapus/atur ketersediaan/stok).
8. Admin dapat mengelola data meja (generate barcode/QR baru per meja).

---

## 5. Ruang Lingkup Fitur (Functional Requirements)

### 5.1 Modul Customer (Web App - tanpa login/dengan sesi per meja)
- [ ] Landing page otomatis terisi info meja dari hasil scan barcode.
- [ ] Menampilkan daftar menu dengan kategori, gambar, deskripsi, dan harga.
- [ ] Fitur pencarian & filter menu.
- [ ] Keranjang pemesanan (tambah, kurang, hapus item, catatan per item).
- [ ] Halaman checkout dengan ringkasan pesanan & total pembayaran.
- [ ] Halaman pembayaran manual: menampilkan info rekening tujuan transfer.
- [ ] Fitur upload bukti pembayaran (gambar).
- [ ] Halaman status/tracking pesanan real-time per meja.
- [ ] Notifikasi status pesanan (via polling atau websocket — opsional).

### 5.2 Modul Admin (Dashboard - dengan login)
- [ ] Autentikasi login admin.
- [ ] Dashboard ringkasan pesanan (jumlah pesanan masuk, menunggu verifikasi, dikonfirmasi, dll).
- [ ] Daftar pesanan real-time per meja dengan status.
- [ ] Detail pesanan: item, jumlah, catatan, total harga, bukti pembayaran (preview gambar).
- [ ] Aksi ACC/Tolak pesanan.
- [ ] Update status pesanan lanjutan (Diproses, Selesai).
- [ ] CRUD data menu (nama, harga, kategori, gambar, status tersedia/habis).
- [ ] CRUD data meja + generate barcode/QR code unik per meja.
- [ ] CRUD data kategori menu.
- [ ] Riwayat transaksi/laporan penjualan (opsional, untuk pengembangan lanjutan).
- [ ] Pengaturan rekening tujuan pembayaran (nomor rekening, nama bank, atas nama).

### 5.3 Modul Barcode/QR Meja
- [ ] Setiap meja memiliki identifier unik (ID meja + token unik agar tidak mudah ditebak/dipalsukan).
- [ ] QR code di-generate mengarah ke URL, contoh: `https://domain.com/order?table=1&token=xxxxx`.
- [ ] Sistem mengenali sesi pemesanan berdasarkan token meja tersebut selama proses order berlangsung.

---

## 6. Alur Status Pesanan (Order Status Flow)

```
[Pending / Menunggu Pembayaran]
        ↓ (customer upload bukti bayar)
[Menunggu Verifikasi Admin]
        ↓ (admin ACC)              ↓ (admin tolak)
[Dikonfirmasi]                [Ditolak]
        ↓
[Diproses / Dimasak]
        ↓
[Selesai / Diantar]
```

---

## 7. Kebutuhan Non-Fungsional

- **Responsif:** Website harus mobile-friendly karena diakses via HP setelah scan barcode.
- **Keamanan:** 
  - Token unik per meja agar link tidak bisa disalahgunakan sembarangan.
  - Validasi upload file (hanya gambar, batas ukuran file).
  - Autentikasi & otorisasi khusus untuk admin (JWT/session).
- **Performa:** Update status pesanan idealnya real-time atau near real-time (polling interval singkat atau websocket).
- **Skalabilitas:** Struktur database mendukung multi-meja dan banyak pesanan bersamaan.
- **Kemudahan Maintenance:** Kode terstruktur (component-based di React, RESTful API di backend).

---

## 8. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React JS |
| Backend | Node.js (Express) — *direkomendasikan agar konsisten dengan JS di frontend* |
| Database | MySQL |
| Local Dev Environment | Laragon |
| Barcode/QR Generator | Library QR Code (misal `qrcode` di Node.js atau `qrcode.react` di frontend) |
| File Upload (bukti bayar) | Multer (Node.js) untuk penyimpanan file lokal, atau folder `/uploads` |
| Autentikasi Admin | JWT (JSON Web Token) |

> **Catatan:** PRD ini belum menentukan detail arsitektur backend. Disarankan dibuatkan dokumen terpisah (Technical Design Document) untuk desain API & skema database secara rinci.

---

## 9. Gambaran Awal Skema Database (High Level)

Tabel-tabel utama yang dibutuhkan (akan didetailkan lebih lanjut di tahap technical design):

- `users_admin` — data admin/kasir
- `tables` — data meja (id, nomor meja, token/kode unik, status aktif)
- `categories` — kategori menu
- `menus` — data menu (nama, harga, kategori, gambar, status tersedia)
- `orders` — data pesanan (id meja, status, total harga, waktu order)
- `order_items` — detail item dalam satu pesanan (menu, qty, catatan, subtotal)
- `payments` — data pembayaran (order_id, bukti transfer/gambar, nominal, status verifikasi, waktu upload)
- `bank_accounts` — data rekening tujuan pembayaran (opsional bisa disimpan di tabel settings)

---

## 10. Halaman/Screen yang Dibutuhkan

### Customer
1. Halaman Menu (per meja)
2. Halaman Keranjang
3. Halaman Checkout & Info Pembayaran
4. Halaman Upload Bukti Pembayaran
5. Halaman Status Pesanan

### Admin
1. Halaman Login
2. Dashboard Ringkasan
3. Halaman Daftar Pesanan (per status)
4. Halaman Detail Pesanan & Verifikasi Pembayaran
5. Halaman Kelola Menu
6. Halaman Kelola Kategori
7. Halaman Kelola Meja & Generate Barcode
8. Halaman Pengaturan Rekening Pembayaran

---

## 11. Di Luar Ruang Lingkup (Out of Scope) — untuk versi awal

- Integrasi payment gateway otomatis (Midtrans, Xendit, dll).
- Sistem loyalti/poin pelanggan.
- Multi-cabang/multi-outlet.
- Aplikasi mobile native (Android/iOS) — hanya web responsif.
- Sistem reservasi meja.

---

## 12. Metrik Keberhasilan (Success Metrics)

- Rata-rata waktu dari pesanan masuk hingga di-ACC admin berkurang dibanding sistem manual.
- Berkurangnya kesalahan pencatatan pesanan (salah meja, salah menu).
- Peningkatan efisiensi operasional pelayan (tidak perlu mencatat manual).

---

## 13. Pertanyaan Terbuka / Perlu Diklarifikasi

- Apakah pelanggan perlu memasukkan nama saat memesan (untuk memanggil saat pesanan siap)?
- Apakah satu meja bisa memiliki lebih dari satu pesanan aktif sekaligus (misal tambah pesanan di tengah jalan)?
- Berapa lama batas waktu upload bukti pembayaran sebelum pesanan otomatis dibatalkan?
- Apakah dibutuhkan fitur cetak struk/nota untuk dapur atau pelanggan?
- Apakah admin bisa memiliki lebih dari satu akun (misal kasir & owner dengan hak akses berbeda)?

---

*Dokumen ini adalah PRD versi awal dan dapat berkembang seiring diskusi lebih lanjut mengenai detail teknis dan kebutuhan bisnis.*
