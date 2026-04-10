# STT Bandung - CMS Admin Panel

Selamat datang di sistem manajemen konten (CMS) STT Bandung. Aplikasi ini dibangun menggunakan **Next.js 14** dan berfungsi untuk mengelola seluruh ekosistem data publik STTB, termasuk Berita, Kegiatan, Akademik, dan Manajemen Pengguna.

---

## 🛠️ Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan CMS di komputer lokal Anda.

### 1. Prasyarat
- **Node.js v18.17+**
- **npm v9+**
- **Backend Running**: Pastikan API Backend (.NET) sudah aktif di `http://localhost:5066`.

### 2. Langkah Instalasi
1.  **Instal Dependensi**:
    ```bash
    npm install
    ```
2.  **Konfigurasi API & Network**:
    Buat file `.env.local` di folder utama (lihat `.env.local.example`):
    ```env
    NEXT_PUBLIC_API_URL=http://[IPv4-ADDRESS]:[PORT]/api/v1
    ```
    - Ganti `[IPv4-ADDRESS]` dengan IP komputer Anda.
    - Hal ini diperlukan agar CMS dapat diakses dari device lain (mobile) dalam satu network.
3.  **Menjalankan Mode Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3100](http://localhost:3100) di browser Anda.

---

## 🔐 Manajemen Akses (RBAC)

CMS ini memiliki sistem keamanan tingkat tinggi berbasis Role:
- **SuperAdmin**: Memiliki akses ke tab **Role & Permission** untuk mengatur hak akses fungsional sistem.
- **Admin**: Dapat mengelola konten berita, akademik, dan biaya, namun tidak dapat mengubah struktur akses sistem.
- **Data Guard**: Setiap halaman dilindungi oleh `AdminLayout` yang memvalidasi role secara dinamis dari JWT Token.

---

## 📂 Struktur Fitur Utama
- **/admin/dashboard**: Ringkasan statistik sistem.
- **/admin/role**: Manajemen Role & Hak Akses (Khusus SuperAdmin).
- **/admin/user**: Manajemen akun administrator & pengurus yayasan.
- **/admin/berita**: Editor konten berita dan pengumuman.
- **/admin/status**: Laporan ketersediaan API Backend.

---

## ⚠️ Catatan Penting
- **Kompatibilitas**: Project ini menggunakan React 18. Jangan melakukan upgrade ke React 19 secara manual karena akan menyebabkan konflik pada library UI.
- **Build Optimization**: Pengecekan tipe data (TypeScript) diabaikan saat build produksi untuk efisiensi, pastikan tetap memeriksa Error di VS Code.
- **Security Check**: Token JWT disimpan secara terenkripsi sederhana di `localStorage` dan divalidasi setiap kali navigasi dilakukan.

---
**STT Bandung Development &copy; 2026**
