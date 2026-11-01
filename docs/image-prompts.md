# Prompt gambar PakuBara

Gambar di bawah ini belum dibuat. Setiap prompt dipakai di generator gambar (Midjourney, DALL-E, Imagen, Flux, atau sejenisnya). Setelah jadi, simpan di `public/images/` dengan **nama file persis** seperti tertulis. Selama file belum ada, web menampilkan kotak berlabel "Gambar belum diunggah", jadi tidak ada yang rusak.

## Gaya yang sama untuk semua gambar

Pakai bagian ini di awal setiap prompt supaya satu set terlihat seperti satu seri:

```
Flat editorial illustration, matte paper texture with subtle grain, soft geometric shapes,
limited palette: warm stone greys (#F5F5F4 to #292524), peat brown (#4A3B32), and a single
ember orange accent (#EA580C) used only for the glowing smouldering spot. No text, no letters,
no numbers, no logos, no watermarks. No human faces (people shown from behind or as simple
silhouettes). Calm, technical, trustworthy mood, not cartoonish, not sci-fi neon.
```

Tambahkan ke semua prompt sebagai negative prompt (jika generatornya mendukung):

```
text, letters, watermark, logo, neon, purple, blue gradient, 3D render, stock photo, cartoon, glossy, lens flare, faces
```

Format: WebP, kualitas 80-85. Jika generatornya hanya menghasilkan PNG/JPG, ubah ke WebP (atau ubah ekstensi di `app/page.tsx` dan `app/app/page.tsx`).

## 1. Langkah 1: paku di dalam tanah

- File: `public/images/langkah-1-paku.webp`
- Ukuran: 1200 x 800 (3:2)
- Alt: Paku sensor tertancap di tanah gambut dengan tiga titik ukur pada kedalaman berbeda

```
[gaya bersama] Cross-section view of dark peat soil, a long slender metal stake driven
vertically into the ground. Three small round sensor markers on the stake at shallow, middle
and deep levels. Around the middle marker only, a soft ember-orange glow spreading into the
peat like a smouldering pocket. Thin layer of dry grass litter and a few charred stems on the
surface, flat grey sky. Side view, centered composition, generous empty space on both sides.
```

## 2. Langkah 2: LoRa ke posko

- File: `public/images/langkah-2-lora.webp`
- Ukuran: 1200 x 800 (3:2)
- Alt: Tiang antena LoRa di lahan gambut mengirim sinyal ke posko di kejauhan

```
[gaya bersama] Wide landscape of burnt peatland at dusk, a short post with a small antenna and
solar panel in the foreground, thin concentric arcs of radio signal travelling left to right
across the scene toward a small tent-roofed field command post on the far horizon with a lit
window. Dense forest line between them. Signal arcs drawn as fine dashed lines in stone grey,
only the lit window of the post in ember orange.
```

## 3. Langkah 3: server mengecek 2 dari 3 sinyal

- File: `public/images/langkah-3-server.webp`
- Ukuran: 1200 x 800 (3:2)
- Alt: Layar posko menampilkan peta titik sensor dengan satu titik menyala oranye

```
[gaya bersama] Close view of a laptop on a plain field desk in a command post, screen showing
an abstract dark map with a dozen small circular markers; all markers grey except one glowing
ember orange with a short arrow showing the direction it is spreading. Three small simple
indicator lights beside the screen, two lit and one unlit. A coffee mug and a paper map
nearby. No readable text on the screen.
```

## 4. Langkah 4: WhatsApp ke regu

- File: `public/images/langkah-4-whatsapp.webp`
- Ukuran: 1200 x 800 (3:2)
- Alt: Ponsel di tangan petugas lapangan menampilkan pesan peringatan dan peta lokasi

```
[gaya bersama] Over-the-shoulder view of a firefighter in a light-coloured field uniform and
helmet, seen from behind, standing on peatland holding a smartphone. The phone screen shows a
simple chat bubble and a small map pin in ember orange, no readable text. Water hose and a
backpack pump at their feet, hazy treeline in the background.
```

## 5. Keadaan kosong: belum ada titik pantau

- File: `public/images/kosong-titik-pantau.webp`
- Ukuran: 1200 x 600 (2:1)
- Alt: Lahan gambut bekas terbakar yang belum dipasangi paku sensor

```
[gaya bersama] Panoramic view of flat burnt peatland with scattered charred stumps and pale ash
patches, a single empty stake holder (a small marker flag, no sensor) planted in the ground,
low grey sky. Very quiet, lots of negative space. No ember-orange glow at all, this image
means "nothing is being monitored yet".
```

## Opsional

### Logo (butuh keputusan Anda dulu)

Saat ini logo hanya teks "PakuBara". Jika ingin tanda gambar, tulis dulu konsepnya (bentuk, warna) lalu pakai prompt ini sebagai awal:

```
Minimal vector logo mark for "PakuBara": a stylized nail or stake pointing downward into a
simple soil line, with a small circle of ember orange (#EA580C) at the tip. Single flat color
on transparent background, geometric, strong silhouette that works at 24 px. No text.
```

File: `public/images/logo-pakubara.svg` (atau PNG transparan 512 x 512).

### Gambar pratinjau tautan (Open Graph)

- File: `public/images/og-pakubara.webp`, 1200 x 630

```
[gaya bersama] Wide hero composition: dark peat cross-section on the lower half with a vertical
stake and one ember-orange glowing pocket at mid-depth, a flat pale sky above. Large empty area
on the left third reserved for a headline added later. No text.
```
