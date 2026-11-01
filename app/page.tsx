import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";

const STEPS = [
  {
    title: "Paku di dalam tanah",
    body: "Paku stainless 1 meter membawa tiga sensor DS18B20 di kedalaman 20, 50, dan 100 cm. Tiang gas CO berdiri di antara paku.",
    detail: "ESP32, baterai 18650",
    image: { src: "/images/langkah-1-paku.webp", alt: "Paku sensor tertancap di tanah gambut dengan tiga titik ukur pada kedalaman berbeda" },
  },
  {
    title: "LoRa ke posko",
    body: "Tiap 5 menit, 1 menit saat suhu naik, paku mengirim paket biner 18 byte lewat LoRa 433 MHz. Gateway di posko meneruskannya ke laptop.",
    detail: "Kirim ulang otomatis jika internet putus",
    image: { src: "/images/langkah-2-lora.webp", alt: "Tiang antena LoRa di lahan gambut mengirim sinyal ke posko di kejauhan" },
  },
  {
    title: "Cek 2 dari 3 sinyal",
    body: "Server menyimpan bacaan, menghitung tren, lalu mengirim alert hanya jika dua dari tiga sinyal terpenuhi: tren suhu di titik itu, paku tetangga yang ikut naik, dan gas CO. Satu sinyal belum mengirim WhatsApp.",
    detail: "Supabase Realtime ke peta",
    image: { src: "/images/langkah-3-server.webp", alt: "Layar posko menampilkan peta titik sensor dengan satu titik menyala oranye" },
  },
  {
    title: "WhatsApp ke regu",
    body: "Regu menerima tautan satu titik berisi suhu tiga kedalaman, arah rambat, dan tombol Google Maps. Tautan tidak butuh login dan berlaku 24 jam.",
    detail: "Target kirim 60 detik setelah ambang terlewati",
    image: { src: "/images/langkah-4-whatsapp.webp", alt: "Ponsel di tangan petugas lapangan menampilkan pesan peringatan dan peta lokasi" },
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-stone-100 selection:bg-ember selection:text-white">
      <header className="border-b border-line">
        <nav
          className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
          aria-label="Utama"
        >
          <Link href="/" className="font-bold text-xl tracking-tight text-stone-50">
            PakuBara
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/demo"
              className="px-3 min-h-[44px] flex items-center text-sm text-stone-200 hover:text-stone-50"
            >
              Simulator Juri
            </Link>
            <Link
              href="/app"
              className="px-4 min-h-[44px] flex items-center rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white text-sm font-semibold"
            >
              Masuk Posko
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero: masalah dan produk yang sedang bekerja */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-50 leading-[1.05]">
              Api padam bukan berarti aman.
            </h1>
            <p className="mt-6 text-lg text-stone-300 max-w-xl leading-relaxed">
              Bara gambut bertahan di bawah tanah dan bisa menyala lagi berminggu-minggu kemudian,
              tanpa asap yang terlihat. PakuBara mengukur suhu di 20, 50, dan 100 cm, lalu memberi
              tahu regu lewat WhatsApp titik, kedalaman, dan arah rambat baranya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="px-6 min-h-[48px] flex items-center rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold"
              >
                Coba demo tanpa hardware
              </Link>
              <Link
                href="/app"
                className="px-6 min-h-[48px] flex items-center rounded-md border border-line-strong text-stone-100 hover:bg-raised font-medium"
              >
                Buka Peta Komando
              </Link>
            </div>
          </div>

          <div>
            <PeatCrossSectionSvg
              t20={36.4}
              t50={87.3}
              t100={42.0}
              waterTableCm={-55}
              highlightDepth={50}
              interactive={true}
            />
            <p className="mt-3 text-xs text-stone-400">
              Contoh pembacaan satu paku, bukan data langsung. Geser kedalaman untuk melihat sensor mana
              yang menyala.
            </p>
          </div>
        </section>

        {/* Angka masalah, bersumber dari Concept Proposal */}
        <section className="border-y border-line bg-surface" aria-labelledby="angka-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20">
            <div>
              <h2 id="angka-heading" className="text-sm text-stone-300">
                Karhutla Januari sampai Juli 2026
              </h2>
              <p className="mt-3 font-mono tabular text-5xl lg:text-6xl font-bold text-accent leading-none whitespace-nowrap">
                202.004 ha
              </p>
              <p className="mt-4 text-stone-300 max-w-sm">
                lahan terbakar, naik 69% dibanding periode yang sama 2025.
              </p>
              <p className="mt-2 text-xs text-stone-400">Sumber: SiPongi, dikutip Kompas.</p>
            </div>

            <dl className="divide-y divide-line">
              <div className="pb-6">
                <dt className="font-mono tabular text-3xl font-bold text-stone-50">
                  Rp39,29 sampai 123,1 T
                </dt>
                <dd className="mt-1 text-stone-300">
                  perkiraan kerugian ekonomi dan kesehatan, Januari sampai Agustus 2026.
                </dd>
                <dd className="mt-1 text-xs text-stone-400">Sumber: CELIOS.</dd>
              </div>
              <div className="py-6">
                <dt className="font-mono tabular text-3xl font-bold text-stone-50">500 sampai 700 °C</dt>
                <dd className="mt-1 text-stone-300">
                  suhu bara yang terperangkap di bawah serasah yang terasa dingin.
                </dd>
                <dd className="mt-1 text-xs text-stone-400">
                  Sumber: Burke dkk., 2019; Palamba dkk., 2023.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="font-mono tabular text-3xl font-bold text-stone-50">1 sampai 10 cm/jam</dt>
                <dd className="mt-1 text-stone-300">
                  laju rambat bara. Cukup lambat untuk dicegat, asalkan posisinya diketahui.
                </dd>
                <dd className="mt-1 text-xs text-stone-400">Sumber: Concept Proposal PakuBara, bagian 1.2.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Alur kerja: daftar bertahap, satu aksen di langkah terakhir */}
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-[0.8fr_1.4fr] gap-10 lg:gap-20"
          aria-labelledby="alur-heading"
        >
          <div className="lg:sticky lg:top-8 self-start">
            <h2 id="alur-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-50">
              Dari paku ke ponsel regu
            </h2>
            <p className="mt-4 text-stone-300 max-w-sm">
              Web tidak bicara langsung ke paku. Semua data lewat gateway di posko, lalu API, lalu peta.
            </p>
          </div>

          <ol className="divide-y divide-line border-y border-line">
            {STEPS.map((step, i) => (
              <li key={step.title} className="py-8 grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] md:grid-cols-[4rem_1fr_15rem] gap-x-4 gap-y-4">
                <span
                  className={`font-mono tabular text-2xl sm:text-3xl font-bold ${
                    i === STEPS.length - 1 ? "text-accent" : "text-stone-500"
                  }`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-stone-50">{step.title}</h3>
                  <p className="mt-2 text-stone-300 leading-relaxed">{step.body}</p>
                  <p className="mt-2 font-mono text-xs text-stone-400">{step.detail}</p>
                </div>
                <div className="col-span-2 sm:col-span-2 md:col-span-1 md:col-start-3 md:row-start-1">
                  <ImageSlot
                    src={step.image.src}
                    alt={step.image.alt}
                    width={1200}
                    height={800}
                    label={`langkah ${i + 1}`}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ajakan ke demo: juri tidak perlu hardware */}
        <section className="bg-raised border-t border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-stone-50">Simulator jalan penuh tanpa perangkat</h2>
              <p className="mt-2 text-stone-300">
                Pilih skenario, naikkan suhu di satu titik, lalu lihat peta, alert, dan pesan WhatsApp
                bereaksi dengan data sintetis.
              </p>
            </div>
            <Link
              href="/demo"
              className="shrink-0 px-6 min-h-[48px] flex items-center justify-center rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold"
            >
              Buka Simulator Juri
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-stone-400">
          <p>PakuBara oleh Tim Tiga Trio, INCEPTION 2026.</p>
          <nav className="flex gap-1" aria-label="Tautan kaki">
            <Link href="/status/blok-b-pulau-padang" className="px-3 min-h-[44px] flex items-center hover:text-stone-50">
              Status Publik
            </Link>
            <Link href="/app" className="px-3 min-h-[44px] flex items-center hover:text-stone-50">
              Posko Operasi
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
