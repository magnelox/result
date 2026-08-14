import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { parseAndValidateCsv } from '@/lib/csv-parser';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    const csvContent = await file.text();
    const result = parseAndValidateCsv(csvContent, file.name);

    // Cross-reference DB for active programmes and courses
    const existingProgrammes = await db.programme.findMany({ select: { code: true } });
    const existingCourses = await db.course.findMany({ select: { code: true } });

    const progCodes = new Set(existingProgrammes.map((p) => p.code.toUpperCase()));
    const courseCodes = new Set(existingCourses.map((c) => c.code.toUpperCase()));

    result.rows.forEach((r) => {
      if (!progCodes.has(r.programmeCode.toUpperCase())) {
        result.issues.push({
          row: r.rowNumber,
          field: 'programmeCode',
          message: `Unknown Programme Code '${r.programmeCode}' (not in database)`,
          severity: 'warning',
        });
      }

      if (!courseCodes.has(r.courseCode.toUpperCase())) {
        result.issues.push({
          row: r.rowNumber,
          field: 'courseCode',
          message: `Unknown Course Code '${r.courseCode}' (not in database)`,
          severity: 'warning',
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        filename: result.filename,
        totalRows: result.totalRows,
        validRowsCount: result.validRowsCount,
        studentCount: result.studentCount,
        previewRows: result.rows.slice(0, 10), // return top 10 preview rows
        issues: result.issues,
        isValid: result.isValid,
        fullRowsData: result.rows,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'CSV validation failed' }, { status: 500 });
  }
}
