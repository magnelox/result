'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { CsvValidationResult, CsvResultRow } from '@/lib/csv-parser';

export default function AdminImportPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);

  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
      setImportSuccess(null);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setValidationResult(null);
      setImportSuccess(null);
      setErrorMsg(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import/validate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to validate CSV');
        setValidating(false);
        return;
      }

      setValidationResult(data.data);
    } catch (err) {
      setErrorMsg('Error validating file.');
    } finally {
      setValidating(false);
    }
  };

  const handleProcessImport = async () => {
    if (!validationResult || !validationResult.fullRowsData) return;
    setImporting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/import/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: validationResult.filename,
          rows: validationResult.fullRowsData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to import draft results');
        setImporting(false);
        return;
      }

      setImportSuccess(data.data);
    } catch (err) {
      setErrorMsg('Import processing failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">
          DATA MANAGEMENT
        </span>
        <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">
          Import Result CSV
        </h1>
        <p className="text-xs text-slate-500 font-sans">
          Upload bulk semester examination records (Up to 1,000+ students per batch)
        </p>
      </div>

      {/* Step 1: Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2 border-b border-slate-100 pb-3">
          <UploadCloud className="w-5 h-5 text-ssu-gold" /> Step 1: Select or Drop CSV File
        </h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-ssu-navy bg-ssu-navy/5 scale-[0.99]'
              : 'border-slate-300 hover:border-ssu-navy hover:bg-slate-50'
          }`}
          onClick={() => document.getElementById('csvFileInput')?.click()}
        >
          <input
            id="csvFileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-slate-100 text-ssu-navy mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>

          {file ? (
            <div className="space-y-1">
              <span className="font-mono font-bold text-slate-900 text-sm">{file.name}</span>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB — Ready for validation</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drop CSV file here, or <span className="text-ssu-navy underline">Browse</span>
              </p>
              <p className="text-xs text-slate-400">Supported format: Standard SSU Examination CSV</p>
            </div>
          )}
        </div>

        {file && !validationResult && !importSuccess && (
          <div className="flex justify-end">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-xs px-6 py-3 rounded-lg shadow flex items-center gap-2 disabled:opacity-50"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ssu-gold" />
                  Validating CSV Rows...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-ssu-gold" />
                  VALIDATE CSV
                </>
              )}
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md text-xs text-rose-800 font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Step 2: Validation Summary & Preview */}
      {validationResult && !importSuccess && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" /> Step 2: CSV Validation Summary
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                validationResult.isValid
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {validationResult.isValid ? 'PASSED VALIDATION' : 'VALIDATION ISSUES FOUND'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Rows</span>
              <span className="text-2xl font-mono font-bold text-slate-900">{validationResult.totalRows}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Students Count</span>
              <span className="text-2xl font-mono font-bold text-ssu-navy">{validationResult.studentCount}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Valid Rows</span>
              <span className="text-2xl font-mono font-bold text-emerald-700">{validationResult.validRowsCount}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Issues / Warnings</span>
              <span className="text-2xl font-mono font-bold text-amber-700">{validationResult.issues.length}</span>
            </div>
          </div>

          {/* Validation Issues Table */}
          {validationResult.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Validation Report
              </h4>
              <div className="max-h-48 overflow-y-auto border border-amber-200 bg-amber-50/50 rounded-lg p-3 space-y-1.5 text-xs">
                {validationResult.issues.map((iss, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-800 font-mono">
                    <span className="font-bold text-amber-800">[Row {iss.row}]</span>
                    <span>{iss.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-ssu-navy" /> Sample Result Preview (First 5 Rows)
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5">Reg Number</th>
                    <th className="p-2.5">Course</th>
                    <th className="p-2.5 text-center">Assg</th>
                    <th className="p-2.5 text-center">End-Term</th>
                    <th className="p-2.5 text-center">Final</th>
                    <th className="p-2.5 text-center">GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(validationResult.previewRows || validationResult.rows || []).slice(0, 5).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-medium text-slate-900">{r.studentName}</td>
                      <td className="p-2.5">{r.regNumber}</td>
                      <td className="p-2.5">{r.courseCode}</td>
                      <td className="p-2.5 text-center">{r.assignmentGrade}</td>
                      <td className="p-2.5 text-center">{r.endTermGrade}</td>
                      <td className="p-2.5 text-center font-bold">{r.finalGrade}</td>
                      <td className="p-2.5 text-center">{r.gradePoint.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleProcessImport}
              disabled={importing || !validationResult.isValid}
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
                  IMPORT AS DRAFT & PRE-GENERATE GRADE CARDS
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success State */}
      {importSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-serif font-bold text-emerald-950">
            Draft Results Imported & Grade Cards Generated!
          </h3>

          <p className="text-xs text-emerald-900 max-w-md mx-auto">
            Successfully imported {importSuccess.rowsCount} examination records across {importSuccess.studentsCount} students into <strong>DRAFT</strong> status. Pre-generated {importSuccess.pdfsCount} static Grade Card PDFs.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-ssu-navy hover:bg-ssu-navy-light text-white font-bold text-xs px-6 py-3 rounded-lg shadow"
            >
              GO TO DASHBOARD TO PUBLISH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
