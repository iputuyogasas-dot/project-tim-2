# Panduan Kolaborasi Tim (GitHub Workflow)

Selamat datang di tim pengembang **Sistem Pemesanan Menu Makanan Berbasis Barcode Meja**!  
Dokumen ini berisi panduan alur kerja (*workflow*) agar kolaborasi tim berjalan rapi, terstruktur, dan bebas dari konflik kode (*merge conflict*).

---

## 📌 1. Aturan Dasar (Golden Rules)

1. **Jangan Pernah Push Langsung ke Branch `main`!**  
   Branch `main` selalu berisi kode yang stabil (*production-ready*). Seluruh perubahan harus melalui **Pull Request (PR)**.
2. **Selalu Update Branch Sebelum Mulai Koding:**  
   Pastikan branch `main` lokal Anda selalu versi paling baru sebelum membuat branch fitur baru.
3. **Satu Branch untuk Satu Fitur / Task:**  
   Jangan mencampur pekerjaan frontend, backend, atau fitur yang berbeda dalam satu branch.

---

## 🌿 2. Penamaan Branch (Branch Naming Convention)

Gunakan format penamaan branch berikut:

- `feature/<nama-fitur>` — Untuk pembuatan fitur baru (contoh: `feature/login-admin`, `feature/cart-customer`, `feature/qr-generator`)
- `fix/<nama-bug>` — Untuk perbaikan bug (contoh: `fix/upload-bukti-error`, `fix/order-status-flow`)
- `docs/<nama-dokumen>` — Untuk update dokumentasi (contoh: `docs/update-erd`)
- `refactor/<nama-komponen>` — Untuk perapihan kode tanpa mengubah fungsi (contoh: `refactor/express-router`)

---

## 🔄 3. Alur Kerja Harian (Workflow Langkah demi Langkah)

### Langkah 1: Tarik Perubahan Terbaru dari `main`
Sebelum membuat branch baru, pastikan `main` lokal Anda up-to-date:
```bash
git checkout main
git pull origin main
```

### Langkah 2: Buat Branch Baru untuk Task Anda
```bash
git checkout -b feature/nama-fitur-anda
```

### Langkah 3: Kerjakan Kode & Commit Secara Berkala
Gunakan pesan commit yang jelas (Commit Convention):
- `feat: tambah halaman menu customer`
- `fix: perbaiki validasi upload gambar bukti bayar`
- `docs: perbarui panduan instalasi di README`
- `style: perbaiki tampilan responsive card menu`

Commit perubahan Anda:
```bash
git add .
git commit -m "feat: deskripsi singkat perubahan"
```

### Langkah 4: Push Branch ke GitHub
```bash
git push -u origin feature/nama-fitur-anda
```

### Langkah 5: Buat Pull Request (PR) di GitHub
1. Buka repository di GitHub.
2. Klik tombol **"Compare & pull request"**.
3. Isi judul PR dan deskripsi singkat mengenai apa yang diubah/ditambahkan.
4. Tag/Assign teman tim sebagai **Reviewer**.
5. Tunggu setidaknya 1 orang anggota tim menyetujui (Approve) PR Anda sebelum di-Merge ke `main`.

---

## 🤝 4. Pembagian Peran & Fitur Tim (Rekomendasi)

Untuk menghindari bentrokan file, tim disarankan membagi tugas secara jelas:

| Anggota Tim | Area Fokus | Komponen / Task Utama |
|---|---|---|
| **Member A** | Backend (API & DB) | Setup Express, Koneksi MySQL, Auth JWT Admin, API Menu & Order |
| **Member B** | Frontend Customer | Layout Customer, Scan QR Parser, Halaman Menu, Keranjang & Checkout |
| **Member C** | Frontend Admin | Dashboard Admin, Verifikasi Pembayaran, CRUD Menu, Generator QR Meja |

---

## 🛠️ 5. Menangani Merge Conflict
Jika terjadi bentrokan kode (*merge conflict*) saat PR:
1. Switch ke branch fitur Anda: `git checkout feature/nama-fitur`
2. Update dari main: `git fetch origin` lalu `git merge origin/main`
3. Selesaikan konflik di VS Code (pilih *Accept Current* / *Incoming Change*).
4. Commit dan push kembali: `git commit -am "fix: resolve merge conflict"`
