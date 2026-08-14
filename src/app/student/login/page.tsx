'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle, Calendar, GraduationCap, Hash } from 'lucide-react';

interface ProgrammeItem {
  id: string;
  code: string;
  name: string;
}

export default function StudentLoginPage() {
  const router = useRouter();

  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);

  const [regNumber, setRegNumber] = useState('');
  const [dob, setDob] = useState('');
  const [programmeId, setProgrammeId] = useState('');

  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const res = await fetch('/api/programmes');
        const data = await res.json();
        if (data.success && Array.isArray(data.programmes)) {
          setProgrammes(data.programmes);
        }
      } catch (err) {
        console.error('Failed to load programmes:', err);
      } finally {
        setLoadingProgrammes(false);
      }
    }
    fetchProgrammes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regNumber.trim()) {
      setErrorMessage('Please enter your Registration Number.');
      return;
    }

    if (!dob) {
      setErrorMessage('Please enter or select your Date of Birth.');
      return;
    }

    if (!programmeId) {
      setErrorMessage('Please select your Programme.');
      return;
    }

    setSearching(true);

    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: regNumber.trim(),
          dob,
          programmeId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ||
            "Invalid registration number, date of birth, or programme."
        );
        setSearching(false);
        return;
      }

      router.push('/student/result');
      router.refresh();
    } catch (err) {
      setErrorMessage(
        "Invalid registration number, date of birth, or programme."
      );
      setSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-ssu-navy via-ssu-navy-light to-ssu-navy p-8 text-white text-center border-b-4 border-ssu-gold relative">
          <span className="inline-block bg-ssu-gold/20 text-ssu-gold-light text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3 border border-ssu-gold/30">
            OFFICIAL ODL SEMESTER RESULT PORTAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Sri Sri University
          </h2>
          <p className="text-slate-200 text-sm font-sans mt-1">
            Directorate of Open & Distance Learning (ODL)
          </p>
          <p className="text-xs text-slate-300 mt-2 font-light">
            Enter your official credentials below to view your published semester result
          </p>
        </div>

        {searching ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ssu-navy/10 text-ssu-navy mb-2">
              <Loader2 className="w-8 h-8 animate-spin text-ssu-navy" />
            </div>
            <h3 className="text-lg font-serif font-bold text-ssu-navy">Authenticating student session...</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Please wait while we securely verify your credentials and locate your result.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm text-rose-800 font-medium">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Field 1: Registration Number */}
            <div className="space-y-2">
              <label htmlFor="regNumber" className="block text-sm font-semibold text-slate-800">
                Registration Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="regNumber"
                  type="text"
                  required
                  autoComplete="off"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="Enter Registration Number (e.g. 2026MBA001)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ssu-navy text-sm transition-all"
                />
              </div>
            </div>

            {/* Field 2: Date of Birth */}
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-sm font-semibold text-slate-800">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ssu-navy text-sm transition-all"
                />
              </div>
              <p className="text-xs text-slate-500">Format: DD / MM / YYYY</p>
            </div>

            {/* Field 3: Programme */}
            <div className="space-y-2">
              <label htmlFor="programmeId" className="block text-sm font-semibold text-slate-800">
                Programme <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <select
                  id="programmeId"
                  required
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  disabled={loadingProgrammes}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-ssu-navy text-sm transition-all appearance-none"
                >
                  <option value="">
                    {loadingProgrammes ? 'Loading programmes...' : 'Select Programme'}
                  </option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  ▼
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={searching}
              className="w-full bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-base py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ssu-gold focus:ring-offset-2 border border-ssu-gold/40"
            >
              <Search className="w-5 h-5 text-ssu-gold" />
              VIEW RESULT
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
