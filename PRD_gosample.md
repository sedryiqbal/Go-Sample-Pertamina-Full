# PRD Go Sample

**Product Requirements Document - GO SAMPLE**  
by DPPU Pertamina Aviation Soekarno Hatta (SHAFTI)  

**Nama Produk:** Go Sample  
**Tanggal:** 13-07-2025  
**Penulis:** Sedry Muhammad Iqbal, M. Zafier Faza  
**Versi:** 1.0  

---

## Latar Belakang & Tujuan

### Permasalahan
Sistem pengambilan sampel dari kapal impor di Pertamina Aviation Soekarno-Hatta masih menggunakan komunikasi terpisah antar bagian (pemesanan sampel, laboratorium, dan proses komparasi) sehingga sulit memantau status dan lokasi sampel secara real-time.

### Solusi
Dikembangkan aplikasi **Go Sample** untuk mengintegrasikan komunikasi antar pihak (pemesanan, laboratorium, dan komparasi), memudahkan pemantauan, pengelolaan, dan pelacakan posisi sampel.

### Tujuan
Monitoring sampel dari:
- Pemesanan
- Pengantaran
- Pengujian & Hasil Lab
- Komparasi Sampel

Instansi terlibat:
- Pertamina
- Laboratorium

Hasil sampel **Release** → lanjut ke pembongkaran muatan kapal impor.  
Jika belum memenuhi nilai komparasi → dilakukan pengujian ulang (**repeat**).

### Success Criteria / Impact
- **Monitoring:** Pengguna dari Pertamina & Laboratorium dapat memantau proses.
- **Fitur:** Aplikasi web memfasilitasi seluruh proses.

---

## Tim
- **Project Manager:** Sedry Muhammad Iqbal
- **Backend Developer:** M. Zafier Faza
- **Frontend Developer:** Andi Syahruddin

---

## Target Pengguna
- Karyawan Pertamina
- Sample Officer
- Supervisor
- Head
- Karyawan Lab

---

## Solution Design

### Functional Requirements
1. **Pemesanan Sampel** – Sample Officer memesan sampel dari kapal impor.
2. **Pengantaran Sampel** – Sampel diambil & diantar ke laboratorium.
3. **Pengujian di Laboratorium** – Lab menguji & mencatat hasil.
4. **Product Quality Check Compartement Tanker** – Input & generate PDF.
5. **Komparasi Hasil** – Bandingkan hasil uji dengan standar.
6. **Pemantauan Real-Time** – Tracking status + countdown pengantaran.
7. **Estimasi Stock Sample** – Catat & lacak inventaris sampel.
8. **Pelaporan & Notifikasi** – Laporan hasil + notifikasi.
9. **Authorization** – Multi-tenant per instansi (Pertamina & Lab).
10. **Mobile Friendly** – UI responsif untuk officer di mobile.

---

## Implementation

### Technical Design
- **Arsitektur:** Client-Server
- **Frontend:** React (responsive design)
- **Backend:** Microsoft .NET (REST API)
- **Database:** Microsoft SQL Server
- **Autentikasi:** JWT
- **Server:** Microsoft Azure

---

## Fitur Utama
- **Login** – Autentikasi & otorisasi role.
- **Dashboard**
  - Kalender estimasi stok
  - Total pengujian lab
  - Total selesai diuji
  - Line chart (7 hari terakhir: berhasil vs gagal)
  - Pie chart (berhasil vs repeat)
- **Management User** – Tambah & atur role.
- **Management Sample** – CRUD stok + estimasi stok.
- **Management Kapal** – CRUD data kapal.
- **Monitoring Sample** – Timeline 5 status: Pemesanan → Pengantaran → Pengujian → Komparasi → Release.
- **Pemesanan Sample**
  - Pemesanan Stock
  - Pemesanan Request
  - Estimasi waktu per lokasi lab.
- **Pengantaran Sampel**
  - List order open
  - History order
- **Pengujian & Analisa Hasil Lab**
- **Komparasi Dokumen Sample** – Generate PDF Product Quality Check.

---

## Flow Level (Sub-Proses Modul)

### Modul 1 – Pemesanan Sampel
- Form input: tanggal, estimasi kedatangan, nomor NPC, jenis pemesanan, jumlah, nama, kategori, kapal, lab, jenis pengujian, memo, foto, catatan.
- Notifikasi ke Sample Officer & Lab.
- List order sample + filter/search.
- Detail popup, tracking, cancel.

### Modul 2 – Pengambilan & Pengantaran Sampel
- Officer melihat daftar pemesanan.
- Konfirmasi pengambilan.
- Sistem menetapkan countdown.
- Update status perjalanan.
- Konfirmasi penerimaan oleh Lab.

### Modul 3 – Pengujian Laboratorium
- Scan kode sampel.
- Input hasil uji (kadar air, viskositas).
- Update status.
- Perbarui stok opname.

### Modul 4 – Komparasi
- Bandingkan hasil uji dengan standar.
- Status: Release atau Repeat.
- Release → notifikasi pembongkaran.
- Repeat → pemesanan ulang.

### Modul 5 – Estimasi Stock Sample
- Catat stok masuk/keluar.
- Perbarui status stok.
- Laporan stok.
- Notifikasi stok menipis.

### Modul 6 – Monitoring Sample
- List order + filter/search.
- Timeline status.
- History status.
- Countdown per status.
- Notifikasi otomatis.