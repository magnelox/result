import React from 'react';
import { db } from '@/lib/db';
import { Layers, FileSpreadsheet, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BatchActions } from './BatchActions';

export default async function ResultBatchesPage() {
  const batches = await db.resultBatch.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      programme: true,
      _count: { select: { semesterResults: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
            RESULT CONTROL
          </span>
          <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
            Result Batches Management
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Manage imported result batches, view rendering modes, publish, unpublish, or delete datasets
          </p>
        </div>

        <Link
          href="/admin/results/upload"
          className="inline-flex items-center gap-2 bg-ssu-navy hover:bg-ssu-navy-light text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-ssu-gold" />
          Upload New Batch
        </Link>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ssu-navy text-white text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b border-ssu-gold">Batch Info</th>
              <th className="p-4 border-b border-ssu-gold">Programme / Sem</th>
              <th className="p-4 border-b border-ssu-gold">Source File</th>
              <th className="p-4 border-b border-ssu-gold text-center">View Mode</th>
              <th className="p-4 border-b border-ssu-gold text-center">Students</th>
              <th className="p-4 border-b border-ssu-gold text-center">Status</th>
              <th className="p-4 border-b border-ssu-gold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <span className="font-bold text-slate-900 block">{b.batch}</span>
                  <span className="text-xs text-slate-500 font-mono">ID: {b.id.slice(0, 8)}...</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-ssu-navy block">{b.programme.code}</span>
                  <span className="text-xs text-slate-600">Sem {b.semester} ({b.academicSession})</span>
                </td>
                <td className="p-4 text-xs font-mono text-slate-700 truncate max-w-xs">{b.sourceFile}</td>
                <td className="p-4 text-center">
                  <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {b.viewType}
                  </span>
                </td>
                <td className="p-4 text-center font-mono font-bold text-slate-900">
                  {b._count.semesterResults}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                      b.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <BatchActions batchId={b.id} currentStatus={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
