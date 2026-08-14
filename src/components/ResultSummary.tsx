import React from 'react';

export function ResultSummary({
  sgpa,
  resultStatus,
  declarationDate,
}: {
  sgpa: number;
  resultStatus: string;
  declarationDate?: string;
}) {
  const isPass = resultStatus.toUpperCase() === 'PASS';

  return (
    <div className="bg-gradient-to-br from-ssu-navy to-ssu-navy-dark text-white rounded-xl p-6 shadow-md border-2 border-ssu-gold mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-sans uppercase font-bold tracking-widest text-ssu-gold">
            SEMESTER PERFORMANCE SUMMARY
          </span>
          <div className="flex items-baseline gap-4 mt-2">
            <div>
              <span className="text-xs text-slate-300 block">SGPA</span>
              <span className="text-3xl sm:text-4xl font-mono font-bold text-white">
                {sgpa.toFixed(2)}
              </span>
            </div>

            <div className="h-8 w-px bg-white/20"></div>

            <div>
              <span className="text-xs text-slate-300 block">RESULT</span>
              <span
                className={`inline-block text-xl font-bold font-sans uppercase tracking-wider px-3 py-0.5 rounded ${
                  isPass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                }`}
              >
                {resultStatus}
              </span>
            </div>
          </div>
        </div>

        {declarationDate && (
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
            <span className="text-xs text-slate-300 block">Result Declaration Date</span>
            <span className="font-serif font-semibold text-ssu-gold-light text-sm">
              {declarationDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
