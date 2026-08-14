import Papa from 'papaparse';

export interface CsvResultRow {
  rowNumber: number;
  regNumber: string;
  rollNumber: string;
  studentName: string;
  dob: string; // YYYY-MM-DD or DD/MM/YYYY
  programmeCode: string;
  academicSession: string;
  examSession: string;
  semester: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  assignmentGrade: string;
  endTermGrade: string;
  finalGrade: string;
  gradePoint: number;
  resultStatus: string; // PASS, FAIL
  declarationDate: string;
}

export interface CsvValidationIssue {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CsvValidationResult {
  filename: string;
  totalRows: number;
  validRowsCount: number;
  studentCount: number;
  rows: CsvResultRow[];
  issues: CsvValidationIssue[];
  isValid: boolean;
  fullRowsData?: CsvResultRow[];
  previewRows?: CsvResultRow[];
}

export function parseAndValidateCsv(
  csvContent: string,
  filename: string
): CsvValidationResult {
  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const issues: CsvValidationIssue[] = [];
  const rows: CsvResultRow[] = [];
  const studentSet = new Set<string>();

  const requiredHeaders = [
    'regNumber',
    'rollNumber',
    'studentName',
    'dob',
    'programmeCode',
    'academicSession',
    'examSession',
    'semester',
    'courseCode',
    'courseTitle',
    'credits',
    'assignmentGrade',
    'endTermGrade',
    'finalGrade',
    'gradePoint',
    'resultStatus',
  ];

  const headers = parseResult.meta.fields || [];
  const missingHeaders = requiredHeaders.filter(
    (req) => !headers.some((h) => h.toLowerCase() === req.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    issues.push({
      row: 0,
      field: 'header',
      message: `Missing required CSV column headers: ${missingHeaders.join(', ')}`,
      severity: 'error',
    });
    return {
      filename,
      totalRows: 0,
      validRowsCount: 0,
      studentCount: 0,
      rows: [],
      issues,
      isValid: false,
    };
  }

  parseResult.data.forEach((rawRow, index) => {
    const rowNum = index + 2; // header is row 1
    const getVal = (key: string) => {
      const actualKey = headers.find((h) => h.toLowerCase() === key.toLowerCase()) || key;
      return (rawRow[actualKey] || '').trim();
    };

    const regNumber = getVal('regNumber');
    const rollNumber = getVal('rollNumber');
    const studentName = getVal('studentName');
    let dob = getVal('dob');
    const programmeCode = getVal('programmeCode');
    const academicSession = getVal('academicSession');
    const examSession = getVal('examSession');
    const semester = getVal('semester');
    const courseCode = getVal('courseCode');
    const courseTitle = getVal('courseTitle');
    const creditsStr = getVal('credits');
    const assignmentGrade = getVal('assignmentGrade');
    const endTermGrade = getVal('endTermGrade');
    const finalGrade = getVal('finalGrade');
    const gradePointStr = getVal('gradePoint');
    const resultStatus = getVal('resultStatus');
    const declarationDate = getVal('declarationDate') || new Date().toISOString().split('T')[0];

    // Normalize DOB if in DD/MM/YYYY format to YYYY-MM-DD
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        dob = `${year}-${month}-${day}`;
      }
    }

    let hasRowError = false;

    if (!regNumber) {
      issues.push({ row: rowNum, field: 'regNumber', message: 'Registration number is required', severity: 'error' });
      hasRowError = true;
    }

    if (!rollNumber) {
      issues.push({ row: rowNum, field: 'rollNumber', message: 'Roll number is required', severity: 'error' });
      hasRowError = true;
    }

    if (!studentName) {
      issues.push({ row: rowNum, field: 'studentName', message: 'Student name is required', severity: 'error' });
      hasRowError = true;
    }

    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      issues.push({ row: rowNum, field: 'dob', message: `Invalid Date of Birth format '${dob}'. Expected YYYY-MM-DD or DD/MM/YYYY`, severity: 'error' });
      hasRowError = true;
    }

    if (!programmeCode) {
      issues.push({ row: rowNum, field: 'programmeCode', message: 'Programme code is required', severity: 'error' });
      hasRowError = true;
    }

    if (!courseCode) {
      issues.push({ row: rowNum, field: 'courseCode', message: 'Course code is required', severity: 'error' });
      hasRowError = true;
    }

    const credits = parseFloat(creditsStr);
    if (isNaN(credits) || credits <= 0) {
      issues.push({ row: rowNum, field: 'credits', message: `Invalid credits '${creditsStr}'`, severity: 'error' });
      hasRowError = true;
    }

    const gradePoint = parseFloat(gradePointStr);
    if (isNaN(gradePoint) || gradePoint < 0 || gradePoint > 10) {
      issues.push({ row: rowNum, field: 'gradePoint', message: `Invalid grade point '${gradePointStr}'. Must be between 0 and 10`, severity: 'error' });
      hasRowError = true;
    }

    if (!hasRowError) {
      studentSet.add(regNumber);
      rows.push({
        rowNumber: rowNum,
        regNumber,
        rollNumber,
        studentName,
        dob,
        programmeCode,
        academicSession,
        examSession,
        semester,
        courseCode,
        courseTitle,
        credits,
        assignmentGrade: assignmentGrade || 'A',
        endTermGrade: endTermGrade || 'A',
        finalGrade: finalGrade || 'A',
        gradePoint,
        resultStatus: resultStatus.toUpperCase() || 'PASS',
        declarationDate,
      });
    }
  });

  const validRowsCount = rows.length;
  const errorCount = issues.filter((i) => i.severity === 'error').length;

  return {
    filename,
    totalRows: parseResult.data.length,
    validRowsCount,
    studentCount: studentSet.size,
    rows,
    issues,
    isValid: errorCount === 0,
  };
}
