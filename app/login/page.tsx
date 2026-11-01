"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useRouter } from "next/navigation";
import { Flame, Mail, ArrowRight, FlaskConical, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setErrorMsg(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    // Set demo cookie or state and route to /app
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-ink text-stone-100 relative flex flex-col justify-center items-center px-4 selection:bg-ember selection:text-white">
      <div className="absolute top-3 right-3">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <Logo height={40} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-stone-50">Masuk Posko Operasi</h1>
          <p className="text-xs text-stone-400">
            Sistem Komando Deteksi Dini Karhutla Gambut Berbasis LoRa & IoT
          </p>
        </div>

        {/* Demo Quick Bypass Card */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
              <FlaskConical className="w-4 h-4" />
              AKSES CEPAT DEWAN JURI
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
              INSTAN
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Dewan juri dapat langsung menjelajahi seluruh modul peta komando, grafik, dan laporan tanpa harus
            menunggu tautan email Magic Link.
          </p>
          <button
            onClick={handleDemoBypass}
            className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all  flex items-center justify-center gap-2"
          >
            <span>Masuk Sebagai Peninjau Juri</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Supabase Magic Link Form */}
        <div className="p-6 rounded-2xl bg-surface border border-line space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
            <Mail className="w-4 h-4 text-accent" />
            <span>Login Email Petugas (Magic Link)</span>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="font-bold">Tautan Masuk Telah Dikirim!</div>
              <p className="text-xs text-stone-400">
                Periksa kotak masuk email Anda ({email}). Klik tautan di dalam email untuk langsung masuk ke posko.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs text-stone-400 block mb-1">
                  Alamat Email Satgas / Korporasi
                </label>
                <input
                  type="email"
                  required
                  placeholder="operator@daops-siak.menlhk.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ink border border-line rounded-lg px-3.5 py-2.5 text-xs text-stone-50 focus:outline-none focus:border-ember font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white font-bold text-xs transition-all  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Mengirim Tautan...</span>
                ) : (
                  <>
                    <span>Kirim Tautan Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-300 transition-colors">
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

