'use client';

import Image from "next/image";
import { Lock, User, Heart, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import LoginForm from "@/components/LoginForm";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const BACKGROUNDS = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg"];
const SLIDESHOW_INTERVAL = 6000;
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6282264825919";

const MARQUEE_TEXT =
  "🏥 Silakan Log In untuk mendaftarkan Pasien CITO & ELEKTIF\u00A0\u00A0•\u00A0\u00A0Batas Waktu Pendaftaran Pasien Elektif Pukul 12:00 WITA ‼️";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      if (isMounted) setCurrentBg((p) => (p + 1) % BACKGROUNDS.length);
    }, SLIDESHOW_INTERVAL);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLogin(false);
    };
    if (showLogin) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [showLogin]);

  const handleLoginSuccess = useCallback(() => {
    router.push("/jadwal-operasi");
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden text-white">

      <style>{`
        @keyframes marquee-final {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hero-come-in {
          0%   { opacity:0; transform:translateY(40px) scale(0.92); filter:blur(8px); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        .hero-wrapper { opacity:0; transform:translateY(40px) scale(0.92); }
        .hero-wrapper.show { animation: hero-come-in 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-wrapper.show .stagger-1 { opacity:0; animation: hero-come-in .8s cubic-bezier(0.16,1,0.3,1) .15s forwards; }
        .hero-wrapper.show .stagger-2 { opacity:0; animation: hero-come-in .8s cubic-bezier(0.16,1,0.3,1) .35s forwards; }
        .hero-wrapper.show .stagger-3 { opacity:0; animation: hero-come-in .8s cubic-bezier(0.16,1,0.3,1) .55s forwards; }
        .hero-wrapper.show .stagger-4 { opacity:0; animation: hero-come-in .8s cubic-bezier(0.16,1,0.3,1) .75s forwards; }
        @keyframes ibs-glow {
          0%,100% { text-shadow:0 0 20px rgba(52,211,153,.3),0 0 40px rgba(52,211,153,.1); }
          50%     { text-shadow:0 0 30px rgba(52,211,153,.6),0 0 60px rgba(52,211,153,.3); }
        }
        .ibs-glow { animation: ibs-glow 3s ease-in-out infinite; }
        @keyframes slide-down {
          0%   { opacity:0; transform:translateY(-24px); }
          100% { opacity:1; transform:translateY(0); }
        }
        .header-slide { animation: slide-down .7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .header-slide-delay { opacity:0; animation: slide-down .7s cubic-bezier(0.16,1,0.3,1) .25s forwards; }
        @keyframes modal-pop {
          0%   { opacity:0; transform:scale(.9) translateY(16px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        .modal-pop { animation: modal-pop .35s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      {/* ============ BACKGROUND ============ */}
      <div className="absolute inset-0 -z-10 bg-slate-950">
        {BACKGROUNDS.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
              index === currentBg ? "scale-105 opacity-100" : "scale-100 opacity-0"
            }`}
          >
            <Image
              src={bg}
              alt={`Hospital background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={75}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-teal-950/30" />
        <div className="absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(2,6,23,0.9)]" />
      </div>

      <div className="pointer-events-none absolute -left-32 top-1/4 -z-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />

      {/* ============ HEADER ============ */}
      <header className="relative z-40 mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 pt-5 sm:pt-7">

        <div className="header-slide flex w-full max-w-lg items-center justify-center gap-3.5 rounded-2xl border border-white/10 bg-slate-900/50 px-5 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/90 p-1 shadow-inner">
            <Image
              src="/logo.png"
              alt="Logo IBS RSUD Johannes Kupang"
              fill
              className="object-contain"
              priority
            />
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

        {/* =============================================
            ✅ MARQUEE — INLINE STYLE, PASTI BERFUNGSI
            ============================================= */}
        <div className="header-slide-delay w-full max-w-md rounded-full border border-white/10 bg-slate-900/50 py-1.5 px-1.5 shadow-inner backdrop-blur-xl">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Heart icon — diam di kiri */}
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20">
              <Heart size={11} className="fill-emerald-400 text-emerald-400 animate-pulse" />
            </span>

            {/* ✅ TICKER BOX */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                position: "relative",
                height: "16px",
              }}
            >
              {/* ✅ TRACK — position absolute agar lebar tidak terbatas */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  display: "flex",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  animation: "marquee-final 25s linear infinite",
                }}
              >
                {/* Duplikat 2x — wajib agar seamless */}
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      paddingRight: "5rem",
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "rgba(236, 253, 245, 0.9)",
                      lineHeight: "16px",
                    }}
                  >
                    {MARQUEE_TEXT}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </header>

      {/* ============ HERO ============ */}
      <section className="relative z-30 flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        {!showLogin && (
          <div className={`hero-wrapper ${heroReady ? "show" : ""} flex w-full max-w-2xl flex-col items-center gap-7`}>
            <div className="space-y-3">
              <h1 className="stagger-1 text-6xl font-black uppercase leading-none tracking-tighter drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] sm:text-8xl">
                klik{" "}
                <span className="ibs-glow bg-gradient-to-br from-emerald-300 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                  IBS
                </span>
              </h1>
              <p className="stagger-2 mx-auto max-w-md text-sm font-light leading-relaxed text-slate-300 sm:text-base">
                Sistem Manajemen Kamar Operasi untuk Pelayanan Bedah yang{" "}
                <span className="font-medium text-white">Cepat, Aman,</span>{" "}
                dan{" "}
                <span className="font-medium text-white">Profesional.</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-1">
              <button
                onClick={() => setShowLogin(true)}
                aria-label="Buka halaman login"
                className="stagger-3 group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-9 py-4 text-sm font-bold tracking-wide text-white shadow-2xl shadow-emerald-900/60 ring-1 ring-emerald-300/40 transition-all hover:scale-[1.03] hover:shadow-emerald-700/70 active:scale-95 sm:text-base"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <User size={20} className="shrink-0" aria-hidden="true" />
                <span>Silakan Log In</span>
              </button>

              <div className="stagger-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-400" aria-hidden="true" />
                Akses Terenkripsi &amp; Aman
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============ LOGIN MODAL ============ */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogin(false);
          }}
        >
          <div className="modal-pop w-full max-w-sm">
            <LoginForm
              onCancel={() => setShowLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}

      {/* ============ WHATSAPP ============ */}
      <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        <a
          href={`https://wa.me/${WA_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi via WhatsApp"
          className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-[#25D366] py-2.5 pl-2.5 pr-5 font-bold text-white shadow-2xl shadow-black/40 transition-all hover:scale-105 hover:bg-[#20ba5a]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
            <FaWhatsapp size={22} aria-hidden="true" />
          </span>
          <span className="text-xs tracking-wide sm:text-sm">Kontak Kami</span>
        </a>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-40 mx-auto flex w-full max-w-7xl flex-col items-center justify-center border-t border-white/10 px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-white/80">
          <Lock size={13} className="shrink-0" aria-hidden="true" />
          <p className="text-[10px] font-normal leading-relaxed tracking-[0.05em] sm:text-xs">
            Versi 1.1 • rheynseran • {new Date().getFullYear()}
          </p>
        </div>
      </footer>

    </main>
  );
}