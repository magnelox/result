import React from 'react';
import { db } from '@/lib/db';
import { GraduationCap } from 'lucide-react';
import { AddProgrammeButton } from './AddProgrammeButton';

export default async function AdminProgrammesPage() {
  const programmes = await db.programme.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { students: true, courses: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">ACADEMIC SETUP</span>
          <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">Programmes Management</h1>
          <p className="text-xs text-slate-500 font-sans">Active university academic programmes feeding student lookup dropdowns</p>
        </div>

        <AddProgrammeButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ssu-navy text-white text-xs font-semibold uppercase">
            <tr>
              <th className="p-4 border-b border-ssu-gold">Code</th>
              <th className="p-4 border-b border-ssu-gold">Programme Name</th>
              <th className="p-4 border-b border-ssu-gold">Department</th>
              <th className="p-4 border-b border-ssu-gold text-center">Courses</th>
              <th className="p-4 border-b border-ssu-gold text-center">Students</th>
              <th className="p-4 border-b border-ssu-gold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {programmes.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-ssu-navy">{p.code}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-xs text-slate-600">{p.department}</td>
                <td className="p-4 text-center font-mono">{p._count.courses}</td>
                <td className="p-4 text-center font-mono">{p._count.students}</td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
