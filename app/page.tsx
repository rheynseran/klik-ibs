'use client';
import Image from 'next/image';
import { Lock, User, Heart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import LoginForm from '@/components/LoginForm'; 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const backgrounds = ['/bg1.jpg', '/bg2.jpg', '/bg3.jpg', '/bg4.jpg'];
  
  const router = useRouter();

  useEffect(() => { 
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleLoginSuccess = () => {
    router.push('/jadwal-operasi');
  };

  return (
    <main className="relative flex flex-col justify-between min-h-screen text-white p-4 sm:p-6 overflow-hidden bg-slate-950">
      
      {/* CSS untuk Animasi Berjalan */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>

      {/* Background Slideshow dengan Overlay Gradien Sinematik */}
      <div className="absolute inset-0 -z-10">
        {backgrounds.map((bg, index) => (
          <div key={bg} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={bg} alt="Background" fill className="object-cover scale-105" priority />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/70 to-slate-950/60 backdrop-blur-[2px]" /> 
      </div>

      {/* TOP BAR: Logo & Ticker Berjalan */}
      <header className="relative z-40 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Identitas RS */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shadow-lg w-full md:w-auto">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="text-left border-l border-white/20 pl-3">
            <p className="text-xs sm:text-sm font-bold leading-tight tracking-wide text-white">INSTALASI BEDAH SENTRAL</p>
            <p className="text-[10px] sm:text-xs font-medium text-emerald-300 tracking-tight">RSUD Prof. Dr. W. Z. Johannes Kupang</p>
          </div>
        </div>

        {/* Ticker Berjalan */}
        <div className="w-full md:w-72 overflow-hidden bg-black/30 backdrop-blur-md rounded-full py-2 px-4 border border-white/15 shadow-inner">
          <div className="animate-marquee whitespace-nowrap text-[11px] font-semibold tracking-wider uppercase text-emerald-200">
            <span className="flex items-center gap-2">
              <Heart size={12} className="fill-red-500 text-red-500 shrink-0" />
              Smart Operating Room Management System • Kami Melayani Anda Sepenuh Hati
            </span>
          </div>
        </div>
      </header>
      
      {/* HERO SECTION: Judul & Tombol Login di Tengah */}
      <div className="relative z-30 flex flex-col items-center justify-center text-center my-auto py-12">
        {!showLogin && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-widest uppercase">
                Portal Resmi Staf Medis
              </span>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase drop-shadow-2xl">
                klik <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">IBS</span>
              </h1>
            </div>

            <button 
              onClick={() => setShowLogin(true)} 
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-950/50 border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all tracking-wide cursor-pointer"
            >
              <User size={20} /> Silahkan Log In
            </button>
          </div>
        )}
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-2 shadow-2xl backdrop-blur-xl">
                <LoginForm 
                  onCancel={() => setShowLogin(false)} 
                  onLoginSuccess={handleLoginSuccess} 
                />
            </div>
        </div>
      )}

      {/* FOOTER SECTION: Status & Kontak WhatsApp (Fixed/Bottom Bar) */}
      <footer className="relative z-40 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        {/* Status Keterangan */}
        <div className="flex items-center gap-2 text-white/70 max-w-xs text-left">
          <Lock size={14} className="shrink-0 text-emerald-400" />
          <p className="text-[10px] uppercase tracking-[0.1em] leading-relaxed">
            Akses Terbatas • Internal RSUD Prof. Dr. W. Z. Johannes
          </p>
        </div>

        {/* Tombol Kontak WhatsApp */}
        <a 
          href="https://wa.me/6282264825919" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all border border-white/20 text-xs sm:text-sm"
        >
          <FaWhatsapp size={20} /> 
          <span className="tracking-wide">Kontak Kami</span>
        </a>
      </footer>

    </main>
  );
}