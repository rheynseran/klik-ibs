'use client';

import Image from "next/image";
import { Lock, User, Heart, Activity, ShieldCheck, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import LoginForm from "@/components/LoginForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKGROUNDS = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg"];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = () => {
    router.push("/jadwal-operasi");
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden text-white">
      {/* CSS untuk Animasi Marquee Teks Berjalan */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 18s linear infinite;
        }
      `}</style>

      {/* ============ BACKGROUND SLIDESHOW ============ */}
      <div className="absolute inset-0 -z-10 bg-slate-950">
        {BACKGROUNDS.map((bg, index) => (
          <div
            key={bg}
            style={{ backgroundImage: `url(${bg})` }}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
              index === currentBg ? "scale-105 opacity-100" : "scale-100 opacity-0"
            }`}
          />
        ))}
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-teal-950/30" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(2,6,23,0.9)]" />
      </div>

      {/* Ambient floating orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />

      {/* ============ HEADER ============ */}
      <header className="relative z-40 mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 pt-5 sm:pt-7">
        {/* Institution card */}
        <div className="flex w-full max-w-lg items-center justify-center gap-3.5 rounded-2xl border border-white/10 bg-slate-900/50 px-5 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/90 p-1 shadow-inner">
            <Image src="/logo.png" alt="Logo IBS" fill className="object-contain" />
          </div>
          <div className="border-l border-white/15 pl-3.5 text-left">
            <p className="text-xs font-bold leading-tight tracking-wide text-white sm:text-sm">
              INSTALASI BEDAH SENTRAL
            </p>
            <p className="text-[10px] font-medium tracking-tight text-white sm:text-xs">
              RSUD Prof. Dr. W. Z. Johannes Kupang
            </p>
          </div>
        </div>

        {/* Marquee ticker with smooth animated heart icon & running text */}
        <div className="w-full max-w-md overflow-hidden rounded-full border border-white/10 bg-slate-900/50 py-1.5 pl-1.5 pr-3 shadow-inner backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20">
              <Heart size={11} className="fill-emerald-400 text-emerald-400 animate-pulse transition-transform duration-500 hover:scale-125" />
            </span>
            <div className="overflow-hidden w-full">
              <div className="animate-marquee whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/90 sm:text-[11px]">
                 Silahkan Log in untuk mendaftarkan Pasien CITO & ELEKTIF • Batas Waktu Pendaftaran Pasien Elektif Pukul 12:00 WITA !!!! 
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative z-30 flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        {!showLogin && (
          <div className="flex w-full max-w-2xl flex-col items-center gap-7 duration-700 animate-in fade-in zoom-in-95">
            {/* Title with smooth animated 'klik IBS' text effect */}
            <div className="space-y-3">
              <h1 className="text-6xl font-black uppercase leading-none tracking-tighter drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] sm:text-8xl transition-all duration-500 hover:scale-[1.02]">
                klik{" "}
                <span className="bg-gradient-to-br from-emerald-300 via-teal-300 to-emerald-500 bg-clip-text text-transparent animate-pulse">
                  IBS
                </span>
              </h1>
              <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-slate-300 sm:text-base">
                Sistem Manajemen Kamar Operasi untuk Pelayanan Bedah yang{" "}
                <span className="font-medium text-white">Cepat, Aman,</span> dan{" "}
                <span className="font-medium text-white">Profesional.</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4 pt-1">
              <button
                onClick={() => setShowLogin(true)}
                className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-9 py-4 text-sm font-bold tracking-wide text-white shadow-2xl shadow-emerald-900/60 ring-1 ring-emerald-300/40 transition-all hover:scale-[1.03] hover:shadow-emerald-700/70 active:scale-95 sm:text-base"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <User size={20} className="shrink-0" />
                <span>Silahkan Log In </span>
              </button>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-400" />
                Akses Terenkripsi & Aman
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============ LOGIN MODAL ============ */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md duration-300 animate-in fade-in">
          <div className="w-full max-w-sm duration-300 animate-in fade-in zoom-in-95">
            <LoginForm
              onCancel={() => setShowLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}

      {/* ============ WHATSAPP FLOATING (Centered at bottom) ============ */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4">
        <a
          href="https://wa.me/6282264825919"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-[#25D366] py-2.5 pl-2.5 pr-5 font-bold text-white shadow-2xl shadow-black/40 transition-all hover:scale-105 hover:bg-[#20ba5a]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
            <FaWhatsapp size={22} className="shrink-0" />
          </span>
          <span className="text-xs tracking-wide sm:text-sm">Kontak Kami</span>
        </a>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-40 mx-auto flex w-full max-w-7xl flex-col items-center justify-center border-t border-white/10 px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-white/80">
          <Lock size={13} className="shrink-0" />
          <p className="text-[10px] font-normal leading-relaxed tracking-[0.05em] sm:text-xs">
            Versi 1.1 • rheyn9550@gmail.com • 2026
          </p>
        </div>
      </footer>
    </main>
  );
}