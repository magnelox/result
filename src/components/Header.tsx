import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-ssu-navy text-white border-b-4 border-ssu-gold shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-12 h-12 rounded-full bg-white text-ssu-navy font-serif font-bold text-xl flex items-center justify-center border-2 border-ssu-gold shadow-sm group-hover:scale-105 transition-transform">
            SSU
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-white group-hover:text-ssu-gold-light transition-colors">
              SRI SRI UNIVERSITY
            </h1>
            <p className="text-xs text-ssu-gold font-sans font-medium uppercase tracking-wider">
              LEARN • LEAD • SERVE | EXAMINATION PORTAL
            </p>
          </div>
        </Link>

        <div className="text-center sm:text-right font-sans">
          <span className="inline-block bg-ssu-navy-light text-ssu-gold-light text-xs font-semibold px-3 py-1 rounded-full border border-ssu-gold/30">
            OFFICIAL RESULT PORTAL
          </span>
        </div>
      </div>
    </header>
  );
}
