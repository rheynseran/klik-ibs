'use client';
import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface LoginFormProps {
  onCancel: () => void;
  onLoginSuccess: () => void;
}

export default function LoginForm({ onCancel, onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Fungsi original TIDAK DIUBAH
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'klikibs' && password === 'klik123') {
      onLoginSuccess();
    } else {
      alert('Username atau Password salah!');
    }
  };

  return (
    // ✅ Container 1 kolom dengan background teal
    <div className="w-full max-w-sm mx-auto bg-teal-500/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Input Nama Pengguna */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white">
            Nama Pengguna
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder=""
            autoComplete="off"
            className="w-full px-4 py-2.5 bg-white/90 border-0 rounded-md text-gray-900 
              focus:outline-none focus:ring-2 focus:ring-white/60 shadow-inner"
            required
          />
        </div>

        {/* Input Kata Kunci dengan toggle password */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white">
            Kata Kunci
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-white/90 border-0 rounded-md text-gray-900 
                focus:outline-none focus:ring-2 focus:ring-white/60 shadow-inner pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Tombol Masuk & Batal - Side by Side */}
        <div className="flex gap-3 mt-2">

          {/* Tombol Masuk - Hijau */}
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 
              bg-green-500 hover:bg-green-600 active:bg-green-700
              text-white font-bold rounded-md 
              transition-all duration-200 shadow-md hover:shadow-lg
              hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 size={18} className="fill-white text-green-500" />
            <span>Masuk</span>
          </button>

          {/* Tombol Batal - Pink */}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 
              bg-pink-500 hover:bg-pink-600 active:bg-pink-700
              text-white font-bold rounded-md 
              transition-all duration-200 shadow-md hover:shadow-lg
              hover:scale-[1.02] active:scale-[0.98]"
          >
            <XCircle size={18} className="fill-white text-pink-500" />
            <span>Batal</span>
          </button>
        </div>
      </form>
    </div>
  );
}