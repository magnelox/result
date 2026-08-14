'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

export function GradeSheetButton({ semesterResultId }: { semesterResultId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/result/grade-card/${semesterResultId}`);
      if (!response.ok) {
        throw new Error('Failed to download grade card');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SSU_Grade_Card_${semesterResultId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Could not download Grade Sheet at this time. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3 text-slate-700">
        <FileText className="w-6 h-6 text-ssu-navy shrink-0" />
        <div>
          <h4 className="font-semibold text-sm text-slate-900">Official Semester Grade Card</h4>
          <p className="text-xs text-slate-500">Download printable official PDF Grade Sheet</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ssu-navy hover:bg-ssu-navy-light text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-ssu-gold focus:ring-offset-2 disabled:opacity-50"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-ssu-gold" />
            Preparing PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-ssu-gold" />
            DOWNLOAD GRADE SHEET
          </>
        )}
      </button>
    </div>
  );
}
