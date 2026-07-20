'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onCancel: () => void;
  onLoginSuccess: () => void;
}

export default function LoginForm({ onCancel, onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'klikibs' && password === 'ibs12345') {
      onLoginSuccess(); 
    } else {
      alert('Username atau Password salah!');
    }
  };

  return (
    // Container dengan efek Glassmorphism
    <div className="w-full max-w-sm p-8 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 mt-2 text-white font-bold transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg"
        >
          Masuk
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-gray-600 font-medium hover:text-gray-900 transition duration-200 text-sm"
        >
          Batal
        </button>
      </form>
    </div>
  );
}