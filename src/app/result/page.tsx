'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { StudentInfo } from '@/components/StudentInfo';
import { ResultTable, CourseResultItem } from '@/components/ResultTable';
import { ResultSummary } from '@/components/ResultSummary';
import { GradeSheetButton } from '@/components/GradeSheetButton';

interface StudentResultData {
  semesterResultId: string;
  student: {
    name: string;
    regNumber: string;
    rollNumber: string;
    programmeName: string;
    batch: string;
  };
  result: {
    semester: string;
    academicSession: string;
    examSession: string;
    examType: string;
    sgpa: number;
    resultStatus: string;
    declarationDate: string;
    courses: CourseResultItem[];
  };
}

export default function StudentResultPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('ssu_student_result');
    if (!cached) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(cached);
      setData(parsed);
    } catch (err) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !data) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading result details...
      </div>
    );
  }

  const { student, result, semesterResultId } = data;

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ssu-navy hover:text-ssu-navy-light bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-ssu-gold" />
          Back to Search
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Official Published Result
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
            SRI SRI UNIVERSITY
          </span>
          <h2 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
            Semester Examination Result
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Official Academic Record for Session {result.academicSession}
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-right text-xs">
          <span className="text-slate-500 block">Exam Session</span>
          <span className="font-semibold text-slate-900">{result.examSession}</span>
        </div>
      </div>

      {/* Student Meta Details */}
      <StudentInfo
        studentName={student.name}
        regNumber={student.regNumber}
        rollNumber={student.rollNumber}
        programmeName={student.programmeName}
        academicSession={result.academicSession}
        examSession={result.examSession}
        examType={result.examType}
        batch={student.batch}
        semester={result.semester}
      />

      {/* Course Performance Table */}
      <ResultTable courses={result.courses} />

      {/* Result Performance Summary Box */}
      <ResultSummary
        sgpa={result.sgpa}
        resultStatus={result.resultStatus}
        declarationDate={result.declarationDate}
      />

      {/* Pre-generated PDF Grade Sheet Download Button */}
      <GradeSheetButton semesterResultId={semesterResultId} />
    </div>
  );
}
