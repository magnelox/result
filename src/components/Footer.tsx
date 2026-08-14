import React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
        <p className="font-serif text-slate-300 font-semibold">
          Sri Sri University — Office of Controller of Examinations
        </p>
        <p>
          Bidyadharpur, Arilo, Cuttack, Odisha 754006, India
        </p>
        <p className="text-slate-500 pt-2 border-t border-slate-800/80 max-w-2xl mx-auto">
          This portal provides official published semester examination results. For discrepancies or official transcripts, contact the Examination Office.
        </p>
      </div>
    </footer>
  );
}
