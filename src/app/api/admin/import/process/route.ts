import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CsvResultRow } from '@/lib/csv-parser';
import { generateGradeCardPdf } from '@/lib/pdf-generator';
import { logAudit } from '@/lib/audit';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, rows } = (await req.json()) as {
      filename: string;
      rows: CsvResultRow[];
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows to import' }, { status: 400 });
    }

    // Group rows by regNumber
    const studentMap = new Map<string, CsvResultRow[]>();
    rows.forEach((r) => {
      const list = studentMap.get(r.regNumber) || [];
      list.push(r);
      studentMap.set(r.regNumber, list);
    });

    const storageDir = path.join(process.cwd(), 'storage', 'grade-cards');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    let importedStudentsCount = 0;
    let generatedPdfsCount = 0;

    for (const [regNumber, studentRows] of studentMap.entries()) {
      const firstRow = studentRows[0];

      // 1. Ensure Programme exists
      let programme = await db.programme.findUnique({ where: { code: firstRow.programmeCode } });
      if (!programme) {
        programme = await db.programme.create({
          data: {
            code: firstRow.programmeCode,
            name: `${firstRow.programmeCode} Programme`,
            department: 'Academic Department',
          },
        });
      }

      // 2. Ensure Student exists
      const student = await db.student.upsert({
        where: { regNumber: regNumber },
        update: {
          name: firstRow.studentName,
          rollNumber: firstRow.rollNumber,
          dob: firstRow.dob,
          programmeId: programme.id,
          batch: firstRow.academicSession,
        },
        create: {
          regNumber: firstRow.regNumber,
          rollNumber: firstRow.rollNumber,
          name: firstRow.studentName,
          dob: firstRow.dob,
          programmeId: programme.id,
          batch: firstRow.academicSession,
        },
      });

      // 3. Ensure Courses exist & Calculate SGPA
      let totalCredits = 0;
      let totalWeightedGp = 0;
      const courseResultData: Array<{
        courseId: string;
        assignmentGrade: string;
        endTermGrade: string;
        finalGrade: string;
        gradePoint: number;
        status: string;
        code: string;
        title: string;
        credits: number;
      }> = [];

      for (const row of studentRows) {
        let course = await db.course.findUnique({ where: { code: row.courseCode } });
        if (!course) {
          course = await db.course.create({
            data: {
              code: row.courseCode,
              title: row.courseTitle,
              credits: row.credits,
              programmeId: programme.id,
              semester: row.semester,
            },
          });
        }

        totalCredits += row.credits;
        totalWeightedGp += row.credits * row.gradePoint;

        courseResultData.push({
          courseId: course.id,
          assignmentGrade: row.assignmentGrade,
          endTermGrade: row.endTermGrade,
          finalGrade: row.finalGrade,
          gradePoint: row.gradePoint,
          status: row.resultStatus,
          code: course.code,
          title: course.title,
          credits: course.credits,
        });
      }

      const calculatedSgpa = totalCredits > 0 ? totalWeightedGp / totalCredits : 0;
      const overallStatus = courseResultData.every((c) => c.status.toUpperCase() === 'PASS') ? 'PASS' : 'FAIL';

      // 4. Create SemesterResult in DRAFT status
      const semResult = await db.semesterResult.create({
        data: {
          studentId: student.id,
          semester: firstRow.semester,
          academicSession: firstRow.academicSession,
          examSession: firstRow.examSession,
          examType: 'REGULAR',
          sgpa: parseFloat(calculatedSgpa.toFixed(2)),
          resultStatus: overallStatus,
          declarationDate: firstRow.declarationDate,
          status: 'DRAFT', // Mandatory DRAFT state
          courseResults: {
            create: courseResultData.map((c) => ({
              courseId: c.courseId,
              assignmentGrade: c.assignmentGrade,
              endTermGrade: c.endTermGrade,
              finalGrade: c.finalGrade,
              gradePoint: c.gradePoint,
              status: c.status,
            })),
          },
        },
      });

      // 5. Pre-generate Grade Card PDF
      const pdfFileName = `${student.regNumber}_Sem_${firstRow.semester}.pdf`;
      const pdfPath = path.join(storageDir, pdfFileName);

      await generateGradeCardPdf(
        {
          studentName: student.name,
          regNumber: student.regNumber,
          rollNumber: student.rollNumber,
          programmeName: programme.name,
          academicSession: firstRow.academicSession,
          examSession: firstRow.examSession,
          examType: 'REGULAR',
          batch: student.batch,
          semester: firstRow.semester,
          sgpa: semResult.sgpa,
          resultStatus: semResult.resultStatus,
          declarationDate: semResult.declarationDate,
          courses: courseResultData.map((c) => ({
            code: c.code,
            title: c.title,
            credits: c.credits,
            assignmentGrade: c.assignmentGrade,
            endTermGrade: c.endTermGrade,
            finalGrade: c.finalGrade,
            gradePoint: c.gradePoint,
            status: c.status,
          })),
        },
        pdfPath
      );

      await db.gradeCard.create({
        data: {
          studentId: student.id,
          semesterResultId: semResult.id,
          pdfPath,
        },
      });

      importedStudentsCount++;
      generatedPdfsCount++;
    }

    // 6. Record ResultImport entry
    const importRecord = await db.resultImport.create({
      data: {
        filename,
        totalRows: rows.length,
        validRows: rows.length,
        errorCount: 0,
        status: 'DRAFT',
        importedBy: session.email,
      },
    });

    await logAudit({
      adminId: session.id,
      action: 'CSV_IMPORT_DRAFT',
      resource: 'RESULTS',
      details: `Imported ${rows.length} rows (${importedStudentsCount} students) in DRAFT state from ${filename}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        importId: importRecord.id,
        studentsCount: importedStudentsCount,
        rowsCount: rows.length,
        pdfsCount: generatedPdfsCount,
        status: 'DRAFT',
      },
    });
  } catch (error) {
    console.error('Import processing failed:', error);
    return NextResponse.json({ error: 'Failed to process CSV import' }, { status: 500 });
  }
}
