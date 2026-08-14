import React from 'react';

export interface StudentInfoProps {
  studentName: string;
  regNumber: string;
  rollNumber: string;
  programmeName: string;
  academicSession: string;
  examSession: string;
  examType: string;
  batch: string;
  semester: string;
}

export function StudentInfo({
  studentName,
  regNumber,
  rollNumber,
  programmeName,
  academicSession,
  examSession,
  examType,
  batch,
  semester,
}: StudentInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-ssu-navy text-white px-6 py-3 border-b border-ssu-gold flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg text-white">Student Details</h3>
        <span className="bg-ssu-gold text-ssu-navy font-sans font-bold text-xs px-2.5 py-1 rounded">
          SEMESTER – {semester}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</span>
          <span className="font-semibold text-slate-900 text-base">{studentName}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Number</span>
          <span className="font-mono font-medium text-slate-800">{regNumber}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll Number</span>
          <span className="font-mono font-medium text-slate-800">{rollNumber}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Programme</span>
          <span className="font-medium text-slate-800">{programmeName}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Session</span>
          <span className="font-medium text-slate-800">{academicSession}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Examination Session</span>
          <span className="font-medium text-slate-800">{examSession}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Examination Type</span>
          <span className="font-medium text-slate-800">{examType}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</span>
          <span className="font-medium text-slate-800">{batch}</span>
        </div>
      </div>
    </div>
  );
}
