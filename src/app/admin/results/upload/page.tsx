'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle,
  Eye,
  Send,
  Layers,
  Check,
} from 'lucide-react';
import { FieldMapping } from '@/lib/excel-parser';

interface ProgrammeItem {
  id: string;
  code: string;
  name: string;
}

export default function ResultUploadPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Programmes
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);

  // Metadata
  const [programmeCode, setProgrammeCode] = useState('BBA');
  const [semester, setSemester] = useState('I');
  const [batch, setBatch] = useState('August 2025');
  const [academicSession, setAcademicSession] = useState('2025-2026');
  const [examSession, setExamSession] = useState('January 2026');
  const [examType, setExamType] = useState('REGULAR');
  const [defaultDob, setDefaultDob] = useState('2001-01-01');

  // Inspection
  const [inspecting, setInspecting] = useState(false);
  const [inspectionData, setInspectionData] = useState<{
    filename: string;
    sheetNames: string[];
    selectedSheet: string;
    headers: string[];
    totalRows: number;
    suggestedMapping: FieldMapping;
  } | null>(null);

  // Mapping
  const [mapping, setMapping] = useState<FieldMapping>({
    regNumber: '',
    studentName: '',
    dob: '',
    courseCode: '',
    courseTitle: '',
    credits: '',
  });

  // Validation
  const [validating, setValidating] = useState(false);
  const [validationData, setValidationData] = useState<any | null>(null);

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgrammes() {
      try {
        const res = await fetch('/api/programmes');
        const d = await res.json();
        if (d.success) setProgrammes(d.programmes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProgrammes(false);
      }
    }
    loadProgrammes();
  }, []);

  const handleFileSelect = async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setInspecting(true);

    const formData = new FormData();
    formData.append('file', f);
    formData.append('action', 'INSPECT');

    try {
      const res = await fetch('/api/admin/results/upload', {
        method: 'POST',
        body: formData,
      });

      const d = await res.json();
      if (!res.ok || !d.success) {
        setErrorMsg(d.error || 'Failed to read spreadsheet file');
        setInspecting(false);
        return;
      }

      setInspectionData(d.data);
      setMapping(d.data.suggestedMapping);
      setStep(2);
    } catch (err) {
      setErrorMsg('Error inspecting spreadsheet file.');
    } finally {
      setInspecting(false);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'VALIDATE');
    formData.append('metadata', JSON.stringify({
      programmeCode,
      semester,
      batch,
      academicSession,
      examSession,
      examType,
      defaultDob,
    }));
    formData.append('mapping', JSON.stringify(mapping));
    if (inspectionData) {
      formData.append('sheetName', inspectionData.selectedSheet);
    }

    try {
      const res = await fetch('/api/admin/results/upload', {
        method: 'POST',
        body: formData,
      });

      const d = await res.json();
      if (!res.ok || !d.success) {
        setErrorMsg(d.error || 'Validation failed');
        setValidating(false);
        return;
      }

      setValidationData(d.data);
      setStep(3);
    } catch (err) {
      setErrorMsg('Error validating mapping.');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'IMPORT');
    formData.append('metadata', JSON.stringify({
      programmeCode,
      semester,
      batch,
      academicSession,
      examSession,
      examType,
      defaultDob,
    }));
    formData.append('mapping', JSON.stringify(mapping));
    if (inspectionData) {
      formData.append('sheetName', inspectionData.selectedSheet);
    }

    try {
      const res = await fetch('/api/admin/results/upload', {
        method: 'POST',
        body: formData,
      });

      const d = await res.json();
      if (!res.ok || !d.success) {
        setErrorMsg(d.error || 'Import failed');
        setImporting(false);
        return;
      }

      setImportResult(d.data);
      setStep(4);
    } catch (err) {
      setErrorMsg('Import processing failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
          RESULT MANAGEMENT PIPELINE
        </span>
        <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
          Upload Excel / CSV Results
        </h1>
        <p className="text-xs text-slate-500 font-sans">
          Upload spreadsheet workbooks (`.xlsx`, `.xls`, `.csv`), map headers, validate records, and publish
        </p>

        {/* Wizard Progress Steps */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-100 text-xs font-bold">
          <div className={`p-2.5 rounded-lg border text-center ${step >= 1 ? 'bg-ssu-navy text-white border-ssu-navy' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            1. Select File
          </div>
          <div className={`p-2.5 rounded-lg border text-center ${step >= 2 ? 'bg-ssu-navy text-white border-ssu-navy' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            2. Metadata & Mapping
          </div>
          <div className={`p-2.5 rounded-lg border text-center ${step >= 3 ? 'bg-ssu-navy text-white border-ssu-navy' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            3. Validate & Preview
          </div>
          <div className={`p-2.5 rounded-lg border text-center ${step >= 4 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            4. Import & Publish
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md text-xs text-rose-800 font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Upload File */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-ssu-gold" /> Step 1: Select Result File (.xlsx, .xls, .csv)
          </h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              dragOver ? 'border-ssu-navy bg-ssu-navy/5 scale-[0.99]' : 'border-slate-300 hover:border-ssu-navy hover:bg-slate-50'
            }`}
            onClick={() => document.getElementById('excelFileInput')?.click()}
          >
            <input
              id="excelFileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-full bg-slate-100 text-ssu-navy mx-auto flex items-center justify-center mb-3">
              {inspecting ? <Loader2 className="w-7 h-7 animate-spin text-ssu-navy" /> : <FileText className="w-7 h-7" />}
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {inspecting ? 'Inspecting workbook sheets & headers...' : 'Drop Excel or CSV file here, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports SSU Examination Spreadsheets (`.xlsx`, `.xls`, `.csv`)</p>
          </div>
        </div>
      )}

      {/* STEP 2: Metadata & Column Mapping */}
      {step === 2 && inspectionData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          <div>
            <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-ssu-gold" /> Step 2: Batch Metadata & Column Mapping
            </h3>
            <p className="text-xs text-slate-500 mt-1">File: <strong className="font-mono text-slate-800">{inspectionData.filename}</strong> ({inspectionData.totalRows} rows detected)</p>
          </div>

          {/* Batch Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Programme Code</label>
              <select
                value={programmeCode}
                onChange={(e) => setProgrammeCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.code}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="I">Semester I</option>
                <option value="II">Semester II</option>
                <option value="III">Semester III</option>
                <option value="IV">Semester IV</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Batch Name</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Academic Session</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Examination Session</label>
              <input
                type="text"
                value={examSession}
                onChange={(e) => setExamSession(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Default DOB (Fallback for Login)</label>
              <input
                type="date"
                value={defaultDob}
                onChange={(e) => setDefaultDob(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Column Mapping Section */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-ssu-navy border-b border-slate-100 pb-2">
              Spreadsheet Column Mapping
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Registration Number Column <span className="text-rose-500">*</span></label>
                <select
                  value={mapping.regNumber}
                  onChange={(e) => setMapping({ ...mapping, regNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Student Name Column <span className="text-rose-500">*</span></label>
                <select
                  value={mapping.studentName}
                  onChange={(e) => setMapping({ ...mapping, studentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Course Code Column <span className="text-rose-500">*</span></label>
                <select
                  value={mapping.courseCode}
                  onChange={(e) => setMapping({ ...mapping, courseCode: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Course Title Column</label>
                <select
                  value={mapping.courseTitle || ''}
                  onChange={(e) => setMapping({ ...mapping, courseTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- None / Use Course Code --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal / Assignment Marks Column</label>
                <select
                  value={mapping.internalMarks || ''}
                  onChange={(e) => setMapping({ ...mapping, internalMarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">External / End-Term Marks Column</label>
                <select
                  value={mapping.externalMarks || ''}
                  onChange={(e) => setMapping({ ...mapping, externalMarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Total Marks Column</label>
                <select
                  value={mapping.totalMarks || ''}
                  onChange={(e) => setMapping({ ...mapping, totalMarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Select Sheet Header --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Final Grade Column (Optional)</label>
                <select
                  value={mapping.finalGrade || ''}
                  onChange={(e) => setMapping({ ...mapping, finalGrade: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Auto Derived from Total Marks --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:underline"
            >
              ← Back to File Selection
            </button>

            <button
              onClick={handleValidate}
              disabled={validating || !mapping.regNumber || !mapping.studentName || !mapping.courseCode}
              className="bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-xs px-6 py-3 rounded-lg shadow flex items-center gap-2 disabled:opacity-50"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ssu-gold" />
                  Validating Mapping & Rows...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-ssu-gold" />
                  VALIDATE MAPPED ROWS
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Preview */}
      {step === 3 && validationData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" /> Step 3: Validation & Result Preview
            </h3>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              validationData.isValid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {validationData.isValid ? 'VALIDATION PASSED' : 'VALIDATION ISSUES'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Rows</span>
              <span className="text-2xl font-mono font-bold text-slate-900">{validationData.totalRows}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Students</span>
              <span className="text-2xl font-mono font-bold text-ssu-navy">{validationData.studentCount}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Rendered View Type</span>
              <span className="text-lg font-bold text-ssu-navy">{validationData.viewType}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Warnings / Issues</span>
              <span className="text-2xl font-mono font-bold text-amber-700">{validationData.issues.length}</span>
            </div>
          </div>

          {/* Validation Issues List */}
          {validationData.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Validation Issues Report
              </h4>
              <div className="max-h-40 overflow-y-auto border border-amber-200 bg-amber-50/50 rounded-lg p-3 space-y-1 text-xs font-mono">
                {validationData.issues.map((iss: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-800">[Row {iss.row}]</span>
                    <span>{iss.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Preview Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-ssu-navy" /> Sample Record Preview
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Reg Number</th>
                    <th className="p-2.5">Course Code</th>
                    <th className="p-2.5 text-center">Internal</th>
                    <th className="p-2.5 text-center">External</th>
                    <th className="p-2.5 text-center">Total</th>
                    <th className="p-2.5 text-center">Grade (GP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {validationData.previewRows.slice(0, 5).map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-medium text-slate-900">{r.studentName}</td>
                      <td className="p-2.5">{r.regNumber}</td>
                      <td className="p-2.5 font-bold text-ssu-navy">{r.courseCode}</td>
                      <td className="p-2.5 text-center">{r.internalMarks ?? '—'}</td>
                      <td className="p-2.5 text-center">{r.externalMarks ?? '—'}</td>
                      <td className="p-2.5 text-center font-bold">{r.totalMarks ?? '—'}</td>
                      <td className="p-2.5 text-center font-bold text-ssu-navy">
                        {r.finalGrade} ({r.gradePoint.toFixed(1)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-600 hover:underline"
            >
              ← Re-configure Mapping
            </button>

            <button
              onClick={handleImport}
              disabled={importing || !validationData.isValid}
              className="bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-xs px-6 py-3 rounded-lg shadow flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ssu-gold" />
                  Importing & Generating Grade Cards...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-ssu-gold" />
                  IMPORT BATCH AS DRAFT & GENERATE GRADE CARDS
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Import Complete */}
      {step === 4 && importResult && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-serif font-bold text-emerald-950">
            Result Batch Imported as DRAFT!
          </h3>

          <p className="text-xs text-emerald-900 max-w-md mx-auto">
            Batch ID <strong className="font-mono">{importResult.batchId}</strong> has been created with {importResult.studentsCount} students in <strong>DRAFT</strong> status. Pre-generated static Grade Card PDFs.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => router.push('/admin/results/batches')}
              className="bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-xs px-6 py-3 rounded-lg shadow"
            >
              MANAGE BATCHES & PUBLISH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
