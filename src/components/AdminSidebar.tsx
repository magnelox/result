'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Upload Excel / CSV', href: '/admin/results/upload', icon: FileSpreadsheet },
    { name: 'Result Batches', href: '/admin/results/batches', icon: Layers },
    { name: 'Programmes', href: '/admin/programmes', icon: GraduationCap },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students & Results', href: '/admin/students', icon: Users },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-ssu-navy text-white min-h-screen flex flex-col border-r border-ssu-gold/30 shrink-0">
      <div className="p-5 border-b border-ssu-navy-light space-y-2">
        <div className="relative w-36 h-10 flex items-center">
          <Image
            src="/assets/ssu-logo.png"
            alt="Sri Sri University Logo"
            width={144}
            height={50}
            className="object-contain w-auto h-full brightness-0 invert"
            priority
          />
        </div>
        <div>
          <h2 className="font-serif font-bold text-sm tracking-wide text-white">SSU ODL</h2>
          <p className="text-[10px] text-ssu-gold uppercase tracking-wider font-semibold">Result Administration</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 font-sans text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-ssu-gold text-ssu-navy font-bold shadow-md'
                  : 'text-slate-300 hover:bg-ssu-navy-light hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-ssu-navy' : 'text-ssu-gold'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ssu-navy-light text-xs text-slate-400 text-center">
        Sri Sri University ODL Portal v2.0
      </div>
    </aside>
  );
}
