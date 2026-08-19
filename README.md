# Sistem Pemesanan Menu Makanan Berbasis Barcode Meja

Sistem pemesanan makanan & minuman berbasis web yang memungkinkan pelanggan memesan langsung dari meja restoran/cafe dengan memindai Barcode/QR Code unik.

## 🚀 Fitur Utama

- **Customer / Pelanggan:**
  - Scan QR Meja → Otomatis mengenali ID Meja & Token.
  - Lihat daftar menu interaktif berdasarkan kategori.
  - Tambah pesanan ke keranjang & kustomisasi catatan item.
  - Checkout & instruksi pembayaran transfer manual.
  - Upload bukti pembayaran.
  - Tracking status pesanan secara real-time.

- **Admin / Kasir:**
  - Authentikasi Admin (Login).
  - Dashboard ringkasan & manajemen pesanan per meja.
  - Verifikasi bukti transfer (ACC / Tolak).
  - Manajemen status pesanan (Diproses → Selesai).
  - CRUD Menu & Kategori.
  - CRUD Meja & Generator QR Code unik.
  - Pengaturan rekening bank tujuan.

## 🛠️ Tech Stack

- **Frontend:** React JS
- **Backend:** Node.js (Express JS)
- **Database:** MySQL
- **Environment:** Laragon / XAMPP

## 📁 Struktur Repositori

```
.
├── docs/
│   ├── PRD.md        # Product Requirement Document
│   └── ERD.md        # Entity Relationship Diagram & Database Schema
├── .gitignore
├── CONTRIBUTING.md   # Panduan Alur Kolaborasi Tim GitHub
└── README.md
```

## 👥 Kolaborasi Tim

Proyek ini dikerjakan secara tim menggunakan alur **GitHub Flow**. Silakan baca [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan pembuatan branch, aturan commit, dan Pull Request.
