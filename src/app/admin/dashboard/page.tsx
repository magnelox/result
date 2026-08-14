import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, CheckCircle2, FileClock, UploadCloud, FileText } from 'lucide-react';
import { PublishButton } from './PublishButton';

export default async function AdminDashboardPage() {
  const totalStudents = await db.student.count();
  const totalResults = await db.semesterResult.count();
  const publishedResults = await db.semesterResult.count({ where: { status: 'PUBLISHED' } });
  const draftResults = await db.semesterResult.count({ where: { status: 'DRAFT' } });

  const latestImport = await db.resultImport.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
            OPERATIONAL CONTROL
          </span>
          <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
            Result Administration Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Manage semester result publication, CSV imports, and Grade Card generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 bg-ssu-navy hover:bg-ssu-navy-light text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
          >
            <UploadCloud className="w-4 h-4 text-ssu-gold" />
            Upload Result CSV
          </Link>

          <PublishButton publishedCount={publishedResults} draftCount={draftResults} />
        </div>
      </div>

      {/* Operational Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-ssu-navy" />
          </div>
          <p className="text-3xl font-mono font-bold text-slate-900 mt-2">{totalStudents.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Registered across active programmes</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Results Imported</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-mono font-bold text-slate-900 mt-2">{totalResults.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Semester examination records</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Results</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-mono font-bold text-emerald-700 mt-2">{publishedResults.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Visible on student lookup portal</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft Results</span>
            <FileClock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-mono font-bold text-amber-700 mt-2">{draftResults.toLocaleString()}</p>
          <span className="text-[11px] text-amber-600 font-medium">Pending admin publication review</span>
        </div>
      </div>

      {/* Latest Import Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-serif font-bold text-lg text-ssu-navy border-b border-slate-100 pb-3">
          Latest Result Import
        </h3>

        {latestImport ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Filename</span>
              <span className="font-mono font-bold text-slate-800 text-sm truncate block">{latestImport.filename}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Total Rows / Valid</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {latestImport.totalRows} / {latestImport.validRows}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Imported By</span>
              <span className="font-medium text-slate-800 text-sm truncate block">{latestImport.importedBy}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Publication Status</span>
              <span
                className={`inline-block font-bold text-xs px-2.5 py-0.5 rounded mt-1 ${
                  latestImport.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {latestImport.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No CSV imports have been executed yet.</p>
        )}
      </div>
    </div>
  );
}
