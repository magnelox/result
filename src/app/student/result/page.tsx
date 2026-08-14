import React from 'react';
import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-auth';
import { db } from '@/lib/db';
import { StudentInfo } from '@/components/StudentInfo';
import { ResultSummary } from '@/components/ResultSummary';
import { GradeSheetButton } from '@/components/GradeSheetButton';
import { CheckCircle2, FileText, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function AuthenticatedStudentResultPage() {
  const session = await getStudentSession();

  if (!session) {
    redirect('/student/login');
  }

  const student = await db.student.findUnique({
    where: { id: session.studentId },
    include: {
      programme: true,
      semesterResults: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          courseResults: {
            include: { course: true },
          },
        },
      },
    },
  });

  if (!student || !student.semesterResults || student.semesterResults.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-ssu-navy">No Published Result Found</h2>
        <p className="text-sm text-slate-600">
          Your examination results have not been published yet. Please check back after official announcement.
        </p>
        <Link
          href="/student/login"
          className="inline-block bg-ssu-navy text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  const semResult = student.semesterResults[0];
  const isMarksView = semResult.viewType === 'MARKS';

  return (
    <div className="space-y-6">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-800">
            Authenticated Session: <strong className="text-ssu-navy">{student.name}</strong> ({student.regNumber})
          </span>
        </div>

        <form action="/api/student/logout" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </form>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
            SRI SRI UNIVERSITY — ODL PORTAL
          </span>
          <h2 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
            Semester Examination Grade Card
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Official Published Academic Record for Session {semResult.academicSession}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          PUBLISHED RESULT
        </div>
      </div>

      {/* Student Meta Details */}
      <StudentInfo
        studentName={student.name}
        regNumber={student.regNumber}
        rollNumber={student.rollNumber}
        programmeName={student.programme.name}
        academicSession={semResult.academicSession}
        examSession={semResult.examSession}
        examType={semResult.examType}
        batch={student.batch}
        semester={semResult.semester}
      />

      {/* Result Table (Marks View vs Grade Card View) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="font-serif font-bold text-xl text-ssu-navy">Course Performance</h3>

        {isMarksView ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-ssu-navy text-white text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 border-b border-ssu-gold">Course Code</th>
                  <th className="py-3 px-4 border-b border-ssu-gold">Course Title</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Credits</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Internal</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">External</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Total Marks</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Grade</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Grade Point</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
                {semResult.courseResults.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-ssu-navy">{c.course.code}</td>
                    <td className="py-3 px-4 font-medium">{c.course.title}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.course.credits.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.internalMarks ?? '—'}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.externalMarks ?? '—'}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{c.totalMarks ?? '—'}</td>
                    <td className="py-3 px-4 text-center font-bold text-ssu-navy">{c.finalGrade}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.gradePoint.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          c.status.toUpperCase() === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {c.remarks || c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-ssu-navy text-white text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 border-b border-ssu-gold">Course Code</th>
                  <th className="py-3 px-4 border-b border-ssu-gold">Course Title</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Credits</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Assignment</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">End-Term</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Final Grade</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Grade Point</th>
                  <th className="py-3 px-4 border-b border-ssu-gold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
                {semResult.courseResults.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-ssu-navy">{c.course.code}</td>
                    <td className="py-3 px-4 font-medium">{c.course.title}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.course.credits.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center font-medium">{c.assignmentGrade}</td>
                    <td className="py-3 px-4 text-center font-medium">{c.endTermGrade}</td>
                    <td className="py-3 px-4 text-center font-bold text-ssu-navy">{c.finalGrade}</td>
                    <td className="py-3 px-4 text-center font-mono">{c.gradePoint.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center">
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
        )}
      </div>

      {/* Result Performance Summary Box */}
      <ResultSummary
        sgpa={semResult.sgpa}
        resultStatus={semResult.resultStatus}
        declarationDate={semResult.declarationDate}
      />

      {/* Official SSU Grade Scale Reference Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h4 className="font-serif font-bold text-sm text-ssu-navy border-b border-slate-100 pb-2">
          GRADE SCALE REFERENCE & SPECIAL STATUSES
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-ssu-navy block">Grade Scale Points</span>
            <p className="font-mono">9.00 - 10.00: O (Outstanding)</p>
            <p className="font-mono">8.00 &lt; 9.00: A+ (Excellent)</p>
            <p className="font-mono">7.00 &lt; 8.00: A (Very Good)</p>
            <p className="font-mono">6.00 &lt; 7.00: B+ (Good)</p>
            <p className="font-mono">5.50 &lt; 6.00: B (Above Average)</p>
            <p className="font-mono">5.00 &lt; 5.50: C (Average)</p>
            <p className="font-mono">4.00 &lt; 5.00: D (Pass)</p>
            <p className="font-mono">0.00 &lt; 4.00: F (Fail)</p>
          </div>
          <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-ssu-navy block">Special Examination Statuses</span>
            <p><strong>AB:</strong> Absent in End-Term Examination</p>
            <p><strong>NS:</strong> Assignment Not Submitted</p>
            <p><strong>IA:</strong> Incomplete Assessment</p>
            <p><strong>RW:</strong> Result Withheld</p>
          </div>
        </div>
      </div>

      {/* Pre-generated PDF Grade Sheet Download Button */}
      <GradeSheetButton semesterResultId={semResult.id} />
    </div>
  );
}
