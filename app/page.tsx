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
    <main className="relative flex flex-col items-center justify-center min-h-screen text-white p-5 overflow-hidden">
      
      {/* CSS untuk Animasi Berjalan */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>

      {/* Ticker Berjalan di Kanan Atas */}
      <div className="absolute top-6 right-6 z-50 w-64 md:w-80 overflow-hidden bg-black/20 backdrop-blur-md rounded-full py-2 px-4 border border-white/20">
        <div className="animate-marquee whitespace-nowrap text-xs font-semibold tracking-wider uppercase text-white/90">
          <span className="flex items-center gap-2">
            <Heart size={12} className="fill-red-500 text-red-500" />
            Kami Melayani dengan Hati • Instalasi Bedah Sentral
          </span>
        </div>
      </div>

      {/* Background Slideshow */}
      <div className="absolute inset-0 -z-10">
        {backgrounds.map((bg, index) => (
          <div key={bg} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={bg} alt="Background" fill className="object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-blue-950/60" /> 
      </div>

      {/* HEADER: Logo & Identitas RS */}
      <header className="absolute top-8 left-0 w-full flex flex-col items-center justify-center z-40 px-4">
        <div className="flex flex-row items-center gap-3 mb-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-contain" />
            <div className="text-left border-l border-white/30 pl-3">
                <p className="text-sm md:text-base font-bold leading-tight tracking-wide">INSTALASI BEDAH SENTRAL</p>
                <p className="text-xs md:text-sm font-medium opacity-90 tracking-tight">RSUD Prof. Dr. W. Z. Johannes Kupang</p>
            </div>
        </div>
      </header>
      
      {/* BAGIAN LOGIN: Judul & Tombol di tengah layar */}
      {!showLogin && (
        <div className="z-30 flex flex-col items-center gap-6 mt-10">
          <div className="text-center mb-2">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase drop-shadow-2xl">klik IBS</h1>
          </div>

          <button 
            onClick={() => setShowLogin(true)} 
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-2xl shadow-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all tracking-wide"
          >
            <User size={20} /> Silahkan Log In
          </button>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm">
                <LoginForm 
                  onCancel={() => setShowLogin(false)} 
                  onLoginSuccess={handleLoginSuccess} 
                />
            </div>
        </div>
      )}

      {/* Kontak Kami */}
      <div className="absolute bottom-6 right-20 z-40">
       <a 
          href="https://wa.me/6282264825919" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all border border-white/20"
        >
          <FaWhatsapp size={22} /> 
          <span className="hidden md:inline text-sm tracking-wide">Kontak Kami</span>
        </a>
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-6 left-20 z-30 max-w-[200px] pointer-events-none opacity-60">
        <div className="flex flex-col items-start">
          <Lock size={14} className="mb-1" />
          <p className="text-[9px] uppercase tracking-[0.15em] leading-relaxed text-white/80">
            Akses Aplikasi Terbatas! Internal RSUD Prof. DR. W. Z. Johannes
          </p>
        </div>
      </div>
      
    </main>
  );
}