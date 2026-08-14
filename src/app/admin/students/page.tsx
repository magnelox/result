import React from 'react';
import { db } from '@/lib/db';
import { Download } from 'lucide-react';
import Link from 'next/link';

export default async function AdminStudentsPage() {
  const students = await db.student.findMany({
    orderBy: { regNumber: 'asc' },
    include: {
      programme: true,
      semesterResults: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">STUDENT RECORDS</span>
        <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">Students & Examination Results</h1>
        <p className="text-xs text-slate-500 font-sans">Inspect student profiles, SGPA ratings, publication status, and pre-generated Grade Card PDFs</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ssu-navy text-white text-xs font-semibold uppercase">
            <tr>
              <th className="p-4 border-b border-ssu-gold">Reg Number</th>
              <th className="p-4 border-b border-ssu-gold">Student Name</th>
              <th className="p-4 border-b border-ssu-gold">Programme</th>
              <th className="p-4 border-b border-ssu-gold">Date of Birth</th>
              <th className="p-4 border-b border-ssu-gold text-center">SGPA</th>
              <th className="p-4 border-b border-ssu-gold text-center">Status</th>
              <th className="p-4 border-b border-ssu-gold text-center">Grade Sheet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {students.map((s) => {
              const res = s.semesterResults[0];
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-ssu-navy">{s.regNumber}</td>
                  <td className="p-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="p-4 text-xs font-semibold text-slate-700">{s.programme.code}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">{s.dob}</td>
                  <td className="p-4 text-center font-mono font-bold">{res ? res.sgpa.toFixed(2) : 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        res && res.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {res ? res.status : 'NO RESULT'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {res ? (
                      <a
                        href={`/api/result/grade-card/${res.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-ssu-navy hover:underline bg-slate-100 px-3 py-1.5 rounded border border-slate-300"
                      >
                        <Download className="w-3.5 h-3.5 text-ssu-gold" /> PDF
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
