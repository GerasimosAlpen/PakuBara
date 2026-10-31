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
    "Sistem presisi pemantauan bara api gambut bawah permukaan dan navigasi logistik air pasca-pemadaman karhutla.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#121010] text-[#F5F5F4]">
        {children}
      </body>
    </html>
  );
}
