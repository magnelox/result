import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-ssu-navy text-white border-b-4 border-ssu-gold shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/student/login" className="flex items-center gap-4 group focus:outline-none">
          <div className="relative w-44 sm:w-52 h-12 flex items-center">
            <Image
              src="/assets/ssu-logo.png"
              alt="Sri Sri University Logo"
              width={208}
              height={72}
              className="object-contain w-auto h-full brightness-0 invert"
              priority
            />
          </div>
        </Link>

        <div className="text-center sm:text-right font-sans">
          <span className="inline-block bg-ssu-navy-light text-ssu-gold text-xs font-semibold px-3 py-1 rounded-full border border-ssu-gold/30 uppercase tracking-wider">
            ODL RESULT PORTAL
          </span>
        </div>
      </div>
    </header>
  );
}
