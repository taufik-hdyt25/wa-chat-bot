'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, MessageSquareCode, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('taufikh2519@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Username atau password salah.');
      }
    } catch (err: any) {
      setError('Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-50 mb-1">
            <MessageSquareCode className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            WA Bot Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Masuk untuk memantau pesan WhatsApp dan konfigurasi AI
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Email / Akun Dashboard
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ketik kata sandi..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sesi Terenkripsi & Dilindungi SSL</span>
        </div>
      </div>
    </div>
  );
}
