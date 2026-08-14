import React from 'react';
import { db } from '@/lib/db';
import { BookOpen } from 'lucide-react';

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { code: 'asc' },
    include: { programme: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">ACADEMIC SETUP</span>
          <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">Courses Directory</h1>
          <p className="text-xs text-slate-500 font-sans">Registered course codes, credits, and associated programmes</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ssu-navy text-white text-xs font-semibold uppercase">
            <tr>
              <th className="p-4 border-b border-ssu-gold">Course Code</th>
              <th className="p-4 border-b border-ssu-gold">Course Title</th>
              <th className="p-4 border-b border-ssu-gold">Programme</th>
              <th className="p-4 border-b border-ssu-gold text-center">Semester</th>
              <th className="p-4 border-b border-ssu-gold text-center">Credits</th>
              <th className="p-4 border-b border-ssu-gold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-ssu-navy">{c.code}</td>
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4 text-xs font-semibold text-slate-700">{c.programme.code}</td>
                <td className="p-4 text-center font-mono">{c.semester}</td>
                <td className="p-4 text-center font-mono">{c.credits.toFixed(1)}</td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {c.status}
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
