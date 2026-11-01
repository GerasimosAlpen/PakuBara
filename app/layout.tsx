import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PakuBara - Pusat Komando Pemantauan Bara Gambut & Logistik Air",
  description:
    "Pusat komando untuk memantau bara gambut setelah api permukaan padam: titik, kedalaman, arah rambat, dan alert WhatsApp ke regu.",
};

// Menentukan tema sebelum cetak pertama supaya halaman tidak berkedip. Bawaan terang; gelap hanya jika dipilih pengguna.
const THEME_INIT = `(function(){try{var t=localStorage.getItem("pakubara.theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col bg-ink text-stone-100">{children}</body>
    </html>
  );
}
