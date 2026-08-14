import React from 'react';

export interface CourseResultItem {
  id: string;
  code: string;
  title: string;
  credits: number;
  assignmentGrade: string;
  endTermGrade: string;
  finalGrade: string;
  gradePoint: number;
  status: string;
}

export function ResultTable({ courses }: { courses: CourseResultItem[] }) {
  return (
    <div className="mb-6">
      <h3 className="font-serif font-bold text-xl text-ssu-navy mb-3">Course Performance</h3>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-ssu-navy text-white text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4 border-b border-ssu-gold">Course Code</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold">Course Title</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">Credits</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">Assignment</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">End-Term</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">Final Grade</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">Grade Point</th>
              <th className="py-3.5 px-4 border-b border-ssu-gold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
            {courses.map((c, idx) => (
              <tr key={c.id || idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-ssu-navy">{c.code}</td>
                <td className="py-3.5 px-4 font-medium">{c.title}</td>
                <td className="py-3.5 px-4 text-center font-mono">{c.credits.toFixed(1)}</td>
                <td className="py-3.5 px-4 text-center font-medium">{c.assignmentGrade}</td>
                <td className="py-3.5 px-4 text-center font-medium">{c.endTermGrade}</td>
                <td className="py-3.5 px-4 text-center font-bold text-ssu-navy">{c.finalGrade}</td>
                <td className="py-3.5 px-4 text-center font-mono">{c.gradePoint.toFixed(1)}</td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                      c.status.toUpperCase() === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Option B) */}
      <div className="md:hidden space-y-3">
        {courses.map((c, idx) => (
          <div
            key={c.id || idx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <span className="font-mono font-bold text-ssu-navy text-sm">{c.code}</span>
                <h4 className="font-medium text-slate-900 text-base leading-tight mt-0.5">
                  {c.title}
                </h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  c.status.toUpperCase() === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {c.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 block">Credits</span>
                <span className="font-mono font-bold text-slate-800">{c.credits.toFixed(1)}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 block">Assignment Grade</span>
                <span className="font-bold text-slate-800">{c.assignmentGrade}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 block">End-Term Grade</span>
                <span className="font-bold text-slate-800">{c.endTermGrade}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 block">Final Grade (GP)</span>
                <span className="font-bold text-ssu-navy">
                  {c.finalGrade} ({c.gradePoint.toFixed(1)})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
