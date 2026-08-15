'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@srisriuniversity.edu.in');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid admin credentials');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-ssu-navy p-8 text-center border-b-4 border-ssu-gold space-y-3">
          <div className="flex justify-center my-2">
            <Image
              src="/assets/ssu-logo.png"
              alt="Sri Sri University Logo"
              width={200}
              height={70}
              className="object-contain w-[180px] h-auto brightness-0 invert"
              priority
            />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-white tracking-wide">
              SSU ODL
            </h1>
            <p className="text-xs text-ssu-gold font-sans font-semibold uppercase tracking-wider mt-0.5">
              Result Administration
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded-r-md flex items-center gap-2.5 text-xs text-rose-800 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srisriuniversity.edu.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ssu-navy"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ssu-navy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ssu-gold" />
                Authenticating...
              </>
            ) : (
              'LOGIN TO ADMIN PORTAL'
            )}
          </button>
        </form>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Authorized ODL Examination Personnel Only
        </div>
      </div>
    </div>
  );
}
