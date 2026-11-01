# DESIGN.md

Sumber arah: PRD Website PakuBara bagian 7 (Tim Tiga Trio, 31 Okt 2026), diubah atas permintaan pemilik produk pada 1 Nov 2026: tampilan dasar **terang dan bersih**, dengan **mode gelap** sebagai pilihan. Mode gelap mempertahankan konsep PRD "ruang komando malam".

## Konsep

Bersih dan terbaca. Warna netral hangat sebagai dasar, bara oranye hanya untuk tindakan utama dan status bara. Angka besar yang terbaca dari jarak dua meter. Efek "wah" datang dari data yang benar-benar bergerak, bukan dari dekorasi.

## Tema

- Terang adalah dasar. Gelap tersedia lewat tombol di bilah atas (landing, aplikasi, login) dan mengikuti preferensi sistem pada kunjungan pertama. Pilihan disimpan di `localStorage` (`pakubara.theme`).
- Kelas `dark` pada `<html>` menentukan tema. Skrip kecil di `app/layout.tsx` menetapkannya sebelum cetak pertama supaya tidak berkedip.
- Skala `stone`, `red`, `amber`, `emerald`, `orange` dipetakan ulang per tema di `app/globals.css` (`--c-*`). Kelas seperti `text-stone-300` atau `bg-red-950/40` otomatis menjadi teks gelap dan latar terang di mode terang. Tulis warna dengan kelas biasa, jangan hex.
- Grafik ECharts membaca tema lewat `useIsDark()` dan `components/charts/chart-theme.ts`.
- Penampang tanah (SVG) dan peta tetap gelap di kedua tema: keduanya ilustrasi/panggung data, bukan permukaan antarmuka.

## Warna

| Token | Terang | Gelap | Dipakai untuk |
|---|---|---|---|
| `--bg` / `bg-ink` | `#FAFAF9` | `#121010` | Latar halaman |
| `--surface` | `#FFFFFF` | `#181414` | Kartu, bilah, sidebar |
| `--raised` | `#F5F5F4` | `#1C1616` | Permukaan di atas surface, hover |
| `--line` / `--line-strong` | `#E7E5E4` / `#D6D3D1` | `#2D2424` / `#3D3030` | Garis pemisah |
| `--panel` | putih 90% | `rgba(31,27,24,0.78)` | Panel melayang di atas peta (satu-satunya tempat blur) |
| `--ember` | `#EA580C` | sama | Penanda, fokus, bara aktif |
| `--ember-strong` | `#C2410C` | sama | Latar tombol terisi dengan teks putih (kontras 5,2:1) |
| `--accent` | `#C2410C` | `#FDBA74` | Teks aksen |
| `--ok` / `--watch` / `--warn` / `--crit` | `#16A34A` / `#CA8A04` / `#EA580C` / `#DC2626` | `#22C55E` / `#EAB308` / `#F97316` / `#DC2626` | Status normal / pantau / waspada / bara aktif |
| `--offline` | `#78716C` | sama | Perangkat offline |

Warna status selalu dipasangkan dengan bentuk atau ikon agar terbaca pengguna buta warna. Putih di atas `#EA580C` hanya 3,56:1, jadi tombol terisi memakai `--ember-strong`.

## Huruf

- Inter untuk semua teks.
- JetBrains Mono, angka tabular, hanya untuk suhu, ppm, koordinat, dan KPI.

## Gambar

Ilustrasi dibuat terpisah dari prompt di `docs/image-prompts.md` dan disimpan di `public/images/`. Komponen `ImageSlot` menampilkan placeholder berlabel selama file belum ada. Satu seri gaya: ilustrasi datar bertekstur kertas, palet batu hangat + satu aksen bara.

## Peta

MapLibre GL JS + deck.gl. Panel KPI melayang kiri, detail titik kanan (bottom sheet di ponsel), bilah waktu di bawah. Worker MapLibre disajikan dari `public/maplibre` agar jalan di mode webpack.

## Gerak

- Tidak ada animasi berulang untuk dekorasi. Denyut hanya untuk titik bara aktif di peta.
- Indikator Live hijau hanya saat polling alert berhasil, abu-abu dan "Terputus" saat gagal.
- Semua animasi mati jika pengguna memilih `prefers-reduced-motion`.

## Responsif

Desktop: sidebar yang bisa diciutkan + peta penuh dengan panel melayang. Ponsel: menu navigasi di bilah atas, KPI di atas peta, detail titik sebagai bottom sheet. Tautan alert dan Detail Titik mobile-first karena dibuka regu dari WhatsApp.

## Landing

Dalam 10 detik juri paham masalah dan bisa langsung mencoba demo. Hero menampilkan produk (penampang tanah interaktif). Angka hanya yang bersumber dari Concept Proposal, dengan sumber kecil di bawahnya.
