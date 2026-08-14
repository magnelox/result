'use client';

import React from 'react';
import Link from 'next/link';
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
      <div className="p-6 border-b border-ssu-navy-light flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white text-ssu-navy font-serif font-bold text-sm flex items-center justify-center border border-ssu-gold">
          SSU
        </div>
        <div>
          <h2 className="font-serif font-bold text-sm tracking-wide text-white">SSU ADMIN</h2>
          <p className="text-[10px] text-ssu-gold uppercase tracking-wider font-semibold">Result Control Panel</p>
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
        Sri Sri University Result Admin v1.0
      </div>
    </aside>
  );
}
