import * as XLSX from 'xlsx';

export interface FieldMapping {
  regNumber: string;
  rollNumber?: string;
  studentName: string;
  dob?: string;
  programmeCode?: string;
  courseCode: string;
  courseTitle?: string;
  credits?: string;
  
  // Marks fields
  internalMarks?: string;
  externalMarks?: string;
  totalMarks?: string;
  remarks?: string;

  // Grade card fields
  assignmentGrade?: string;
  endTermGrade?: string;
  finalGrade?: string;
  gradePoint?: string;
  status?: string;
}

export interface ParsedSpreadsheet {
  filename: string;
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  totalRows: number;
  rawRows: Record<string, any>[];
  suggestedMapping: FieldMapping;
}

export interface ExcelValidationIssue {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ExcelValidationResult {
  totalRows: number;
  validRowsCount: number;
  studentCount: number;
  issues: ExcelValidationIssue[];
  isValid: boolean;
  viewType: 'MARKS' | 'GRADE_CARD';
  processedRows: Array<{
    rowNumber: number;
    regNumber: string;
    rollNumber: string;
    studentName: string;
    dob: string; // YYYY-MM-DD
    programmeCode: string;
    courseCode: string;
    courseTitle: string;
    credits: number;
    internalMarks?: number;
    externalMarks?: number;
    totalMarks?: number;
    remarks?: string;
    assignmentGrade?: string;
    endTermGrade?: string;
    finalGrade?: string;
    gradePoint?: number;
    status: string;
  }>;
}

/**
 * Reads an Excel workbook (.xlsx, .xls) or CSV buffer and extracts sheet information & raw headers
 */
export function parseSpreadsheet(
  buffer: Buffer,
  filename: string,
  sheetName?: string
): ParsedSpreadsheet {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  const targetSheet = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];

  const worksheet = workbook.Sheets[targetSheet];
  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const headers: string[] = [];
  if (rawJson.length > 0) {
    Object.keys(rawJson[0]).forEach((k) => {
      const cleanHeader = String(k).trim();
      if (cleanHeader && !headers.includes(cleanHeader)) {
        headers.push(cleanHeader);
      }
    });
  }

  const suggestedMapping = autoDetectColumnMapping(headers);

  return {
    filename,
    sheetNames,
    selectedSheet: targetSheet,
    headers,
    totalRows: rawJson.length,
    rawRows: rawJson,
    suggestedMapping,
  };
}

/**
 * Auto-detects standard system fields from raw spreadsheet header names
 */
export function autoDetectColumnMapping(headers: string[]): FieldMapping {
  const findMatch = (candidates: string[]): string => {
    for (const h of headers) {
      const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (candidates.some((c) => clean.includes(c.toLowerCase().replace(/[^a-z0-9]/g, '')))) {
        return h;
      }
    }
    return '';
  };

  return {
    regNumber: findMatch(['registration', 'regdno', 'regno', 'student id', 'enrollment', 'regd']),
    rollNumber: findMatch(['rollno', 'roll number', 'roll']),
    studentName: findMatch(['studentname', 'name', 'candidate name', 'student']),
    dob: findMatch(['dob', 'dateofbirth', 'birthdate']),
    programmeCode: findMatch(['programme', 'program', 'branch']),
    courseCode: findMatch(['coursecode', 'subjectcode', 'code']),
    courseTitle: findMatch(['coursetitle', 'subjecttitle', 'subject', 'course']),
    credits: findMatch(['credits', 'credit', 'cr']),
    internalMarks: findMatch(['internal', 'assignment marks', 'ia marks', 'internal marks']),
    externalMarks: findMatch(['external', 'endterm marks', 'theory marks', 'external marks']),
    totalMarks: findMatch(['totalmarks', 'total', 'marks', 'aggregate']),
    remarks: findMatch(['remarks', 'remark', 'result remark']),
    assignmentGrade: findMatch(['assignmentgrade', 'assg grade', 'assignment']),
    endTermGrade: findMatch(['endtermgrade', 'endterm', 'theory grade']),
    finalGrade: findMatch(['finalgrade', 'grade', 'overall grade']),
    gradePoint: findMatch(['gradepoint', 'gp', 'grade pts', 'point']),
    status: findMatch(['status', 'result status', 'result']),
  };
}

/**
 * Helper to check if row set represents a wide COE spreadsheet (multi-course across columns)
 */
export function isCoeWideSpreadsheet(rawRows: Record<string, any>[]): boolean {
  if (!rawRows || rawRows.length === 0) return false;
  const jsonStr = JSON.stringify(rawRows.slice(0, 5)).toLowerCase();
  return (
    (jsonStr.includes('enrollment') || jsonStr.includes('regd')) &&
    (jsonStr.includes('marks out of 70') || jsonStr.includes('marks out of 30') || jsonStr.includes('assignment submitted'))
  );
}

/**
 * Helper to derive Grade Letter & Grade Points from numerical marks or special status
 */
export function deriveGradeAndPoints(
  totalMarks: number,
  assgMarksStr?: string,
  endTermMarksStr?: string
): { finalGrade: string; gradePoint: number; status: string; assgGrade: string; endGrade: string } {
  const assgUpper = String(assgMarksStr || '').toUpperCase().trim();
  const endUpper = String(endTermMarksStr || '').toUpperCase().trim();

  let assgGrade = 'A';
  if (assgUpper === 'ABS' || assgUpper === 'NO' || assgUpper === 'NS') {
    assgGrade = 'NS';
  } else {
    const numAssg = parseFloat(assgMarksStr || '');
    if (!isNaN(numAssg)) {
      if (numAssg >= 90) assgGrade = 'O';
      else if (numAssg >= 80) assgGrade = 'A+';
      else if (numAssg >= 70) assgGrade = 'A';
      else if (numAssg >= 60) assgGrade = 'B+';
      else if (numAssg >= 55) assgGrade = 'B';
      else if (numAssg >= 50) assgGrade = 'C';
      else if (numAssg >= 40) assgGrade = 'D';
      else assgGrade = 'F';
    }
  }

  let endGrade = 'A';
  if (endUpper === 'ABS' || endUpper === 'AB') {
    endGrade = 'AB';
  } else {
    const numEnd = parseFloat(endTermMarksStr || '');
    if (!isNaN(numEnd)) {
      if (numEnd >= 90) endGrade = 'O';
      else if (numEnd >= 80) endGrade = 'A+';
      else if (numEnd >= 70) endGrade = 'A';
      else if (numEnd >= 60) endGrade = 'B+';
      else if (numEnd >= 55) endGrade = 'B';
      else if (numEnd >= 50) endGrade = 'C';
      else if (numEnd >= 40) endGrade = 'D';
      else endGrade = 'F';
    }
  }

  let finalGrade = 'F';
  let gradePoint = 0.0;

  if (totalMarks >= 90) { finalGrade = 'O'; gradePoint = 10.0; }
  else if (totalMarks >= 80) { finalGrade = 'A+'; gradePoint = 9.0; }
  else if (totalMarks >= 70) { finalGrade = 'A'; gradePoint = 8.0; }
  else if (totalMarks >= 60) { finalGrade = 'B+'; gradePoint = 7.0; }
  else if (totalMarks >= 55) { finalGrade = 'B'; gradePoint = 6.0; }
  else if (totalMarks >= 50) { finalGrade = 'C'; gradePoint = 5.0; }
  else if (totalMarks >= 40) { finalGrade = 'D'; gradePoint = 4.0; }
  else { finalGrade = 'F'; gradePoint = 0.0; }

  let status = totalMarks >= 40 ? 'PASS' : 'FAIL';
  if (endGrade === 'AB') status = 'AB';
  else if (assgGrade === 'NS') status = 'NS';
  if (status !== 'PASS' && (endGrade === 'AB' || assgGrade === 'NS')) {
    status = 'IA';
  }

  return { finalGrade, gradePoint, status, assgGrade, endGrade };
}

/**
 * Validates raw rows using the provided column mapping & metadata settings
 */
export function validateMappedRows(
  rawRows: Record<string, any>[],
  mapping: FieldMapping,
  metadata: {
    programmeCode: string;
    semester: string;
    academicSession: string;
    examSession: string;
    defaultDob?: string;
  }
): ExcelValidationResult {
  const issues: ExcelValidationIssue[] = [];
  const processedRows: ExcelValidationResult['processedRows'] = [];
  const studentSet = new Set<string>();

  // Check if wide COE format
  if (isCoeWideSpreadsheet(rawRows)) {
    // COE Wide format unrolling logic
    const firstRowKeys = Object.keys(rawRows[0] || {});
    
    // Identify course columns
    const courseMaps: Array<{
      code: string;
      title: string;
      assgColKey?: string;
      endColKey?: string;
      totalColKey?: string;
    }> = [];

    let currentCourse: { code: string; title: string; assgColKey?: string; endColKey?: string; totalColKey?: string } | null = null;

    firstRowKeys.forEach((key) => {
      const headerVal = String(rawRows[0][key] || key || '').trim();
      if (headerVal.includes(':') || headerVal.includes('EXAM')) {
        const line = headerVal.split('\n').pop()?.trim() || '';
        if (line.includes(':')) {
          const [cCode, ...cTitle] = line.split(':');
          currentCourse = {
            code: cCode.trim(),
            title: cTitle.join(':').trim(),
          };
          courseMaps.push(currentCourse);
        }
      }

      if (currentCourse) {
        const subHeaderVal = String(rawRows[1] ? rawRows[1][key] : '').trim();
        if (subHeaderVal.includes('Marks Out of 100') && !currentCourse.assgColKey) {
          currentCourse.assgColKey = key;
        } else if (subHeaderVal.includes('Marks Out of 70') && !currentCourse.endColKey) {
          currentCourse.endColKey = key;
        } else if ((subHeaderVal.includes('Total Out of 100') || subHeaderVal.includes('Internal Marks')) && !currentCourse.totalColKey) {
          currentCourse.totalColKey = key;
        }
      }
    });

    // Fallback if course headers were in keys directly
    if (courseMaps.length === 0) {
      firstRowKeys.forEach((key) => {
        if (key.includes(':')) {
          const [cCode, ...cTitle] = key.split(':');
          courseMaps.push({
            code: cCode.trim(),
            title: cTitle.join(':').trim(),
            totalColKey: key,
          });
        }
      });
    }

    // Process data rows starting from row 3 (idx 2) or row 2 (idx 1)
    const startIdx = rawRows.length > 2 && String(rawRows[1][firstRowKeys[1]] || '').toLowerCase().includes('roll') ? 2 : 1;

    for (let r = startIdx; r < rawRows.length; r++) {
      const row = rawRows[r];
      const keys = Object.keys(row);
      const regNumber = String(row[keys[1]] || row[mapping.regNumber] || '').trim();
      const rollNumber = String(row[keys[2]] || row[mapping.rollNumber] || regNumber).trim();
      const studentName = String(row[keys[3]] || row[mapping.studentName] || '').trim();
      const dob = metadata.defaultDob || '2000-01-01';

      if (!regNumber || !studentName) continue;
      studentSet.add(regNumber);

      courseMaps.forEach((c) => {
        const assgVal = c.assgColKey ? String(row[c.assgColKey] || '').trim() : '';
        const endVal = c.endColKey ? String(row[c.endColKey] || '').trim() : '';
        let totalVal = c.totalColKey ? parseFloat(String(row[c.totalColKey] || '0')) : 0;

        if (isNaN(totalVal) || totalVal === 0) {
          const aNum = parseFloat(assgVal) || 0;
          const eNum = parseFloat(endVal) || 0;
          totalVal = (aNum * 0.3) + eNum;
        }

        const gradeInfo = deriveGradeAndPoints(totalVal, assgVal, endVal);

        processedRows.push({
          rowNumber: r + 1,
          regNumber,
          rollNumber,
          studentName,
          dob,
          programmeCode: metadata.programmeCode,
          courseCode: c.code,
          courseTitle: c.title,
          credits: 4.0,
          internalMarks: parseFloat(assgVal) || undefined,
          externalMarks: parseFloat(endVal) || undefined,
          totalMarks: totalVal,
          assignmentGrade: gradeInfo.assgGrade,
          endTermGrade: gradeInfo.endGrade,
          finalGrade: gradeInfo.finalGrade,
          gradePoint: gradeInfo.gradePoint,
          status: gradeInfo.status,
        });
      });
    }

    return {
      totalRows: rawRows.length,
      validRowsCount: processedRows.length,
      studentCount: studentSet.size,
      issues: [],
      isValid: true,
      viewType: 'GRADE_CARD',
      processedRows,
    };
  }

  // Determine viewType (MARKS if internal/external/total present, else GRADE_CARD)
  const isMarksView = Boolean(mapping.internalMarks || mapping.externalMarks || mapping.totalMarks);
  const viewType = isMarksView ? 'MARKS' : 'GRADE_CARD';

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Row 1 is header

    const getVal = (field?: string) => {
      if (!field) return '';
      return String(row[field] || '').trim();
    };

    const regNumber = getVal(mapping.regNumber);
    const rollNumber = getVal(mapping.rollNumber) || regNumber;
    const studentName = getVal(mapping.studentName);
    let dob = getVal(mapping.dob) || metadata.defaultDob || '';
    const programmeCode = getVal(mapping.programmeCode) || metadata.programmeCode;
    const courseCode = getVal(mapping.courseCode);
    const courseTitle = getVal(mapping.courseTitle) || courseCode;
    const creditsStr = getVal(mapping.credits) || '4.0';

    // Normalize DOB
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        dob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    let hasError = false;

    if (!regNumber) {
      issues.push({ row: rowNum, field: 'regNumber', message: 'Registration Number is required', severity: 'error' });
      hasError = true;
    }

    if (!studentName) {
      issues.push({ row: rowNum, field: 'studentName', message: 'Student Name is required', severity: 'error' });
      hasError = true;
    }

    if (!courseCode) {
      issues.push({ row: rowNum, field: 'courseCode', message: 'Course Code is required', severity: 'error' });
      hasError = true;
    }

    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      issues.push({
        row: rowNum,
        field: 'dob',
        message: `Date of Birth missing or invalid ('${dob}'). Default DOB required for student authentication.`,
        severity: 'warning',
      });
    }

    const credits = parseFloat(creditsStr);
    if (isNaN(credits) || credits <= 0) {
      issues.push({ row: rowNum, field: 'credits', message: `Invalid course credits '${creditsStr}'`, severity: 'warning' });
    }

    if (!hasError) {
      studentSet.add(regNumber);

      if (isMarksView) {
        const internal = parseFloat(getVal(mapping.internalMarks)) || 0;
        const external = parseFloat(getVal(mapping.externalMarks)) || 0;
        const total = parseFloat(getVal(mapping.totalMarks)) || internal + external;
        const remarks = getVal(mapping.remarks) || 'PASS';

        // Auto derive grade & gradePoint from total marks out of 100
        const gradeInfo = deriveGradeAndPoints(total, String(internal), String(external));

        processedRows.push({
          rowNumber: rowNum,
          regNumber,
          rollNumber,
          studentName,
          dob: dob || '2000-01-01',
          programmeCode,
          courseCode,
          courseTitle,
          credits: isNaN(credits) ? 4.0 : credits,
          internalMarks: internal,
          externalMarks: external,
          totalMarks: total,
          remarks,
          finalGrade: gradeInfo.finalGrade,
          gradePoint: gradeInfo.gradePoint,
          status: total >= 40 ? 'PASS' : 'FAIL',
        });
      } else {
        const assg = getVal(mapping.assignmentGrade) || 'A';
        const endTerm = getVal(mapping.endTermGrade) || 'A';
        const finalG = getVal(mapping.finalGrade) || 'A';
        const gpStr = getVal(mapping.gradePoint);
        const status = getVal(mapping.status) || 'PASS';

        const gp = parseFloat(gpStr) || (finalG === 'O' ? 10 : finalG === 'A+' ? 9 : finalG === 'A' ? 8 : 7);

        processedRows.push({
          rowNumber: rowNum,
          regNumber,
          rollNumber,
          studentName,
          dob: dob || '2000-01-01',
          programmeCode,
          courseCode,
          courseTitle,
          credits: isNaN(credits) ? 4.0 : credits,
          assignmentGrade: assg,
          endTermGrade: endTerm,
          finalGrade: finalG,
          gradePoint: gp,
          status: status.toUpperCase(),
        });
      }
    }
  });

  const errorCount = issues.filter((i) => i.severity === 'error').length;

  return {
    totalRows: rawRows.length,
    validRowsCount: processedRows.length,
    studentCount: studentSet.size,
    issues,
    isValid: errorCount === 0,
    viewType,
    processedRows,
  };
}
