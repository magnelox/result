import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { parseSpreadsheet, validateMappedRows, FieldMapping } from '@/lib/excel-parser';
import { db } from '@/lib/db';
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

    const formData = await req.formData();
    const action = (formData.get('action') as string) || 'VALIDATE';

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Spreadsheet file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name;

    const metadataStr = formData.get('metadata') as string || '{}';
    const metadata = JSON.parse(metadataStr);

    const mappingStr = formData.get('mapping') as string || '{}';
    const mapping: FieldMapping = JSON.parse(mappingStr);

    const sheetName = (formData.get('sheetName') as string) || undefined;

    // 1. Parse spreadsheet
    const parsed = parseSpreadsheet(buffer, filename, sheetName);

    // If just checking sheets and headers
    if (action === 'INSPECT') {
      return NextResponse.json({
        success: true,
        data: {
          filename: parsed.filename,
          sheetNames: parsed.sheetNames,
          selectedSheet: parsed.selectedSheet,
          headers: parsed.headers,
          totalRows: parsed.totalRows,
          suggestedMapping: parsed.suggestedMapping,
          sampleRows: parsed.rawRows.slice(0, 5),
        },
      });
    }

    // 2. Validate using mapping
    const validation = validateMappedRows(parsed.rawRows, mapping, metadata);

    if (action === 'VALIDATE') {
      return NextResponse.json({
        success: true,
        data: {
          filename: parsed.filename,
          totalRows: validation.totalRows,
          validRowsCount: validation.validRowsCount,
          studentCount: validation.studentCount,
          issues: validation.issues,
          isValid: validation.isValid,
          viewType: validation.viewType,
          previewRows: validation.processedRows.slice(0, 10),
        },
      });
    }

    // 3. Action: IMPORT (Import as DRAFT & Pre-generate Grade Cards)
    if (action === 'IMPORT') {
      if (!validation.isValid) {
        return NextResponse.json({ error: 'Cannot import dataset with validation errors.' }, { status: 400 });
      }

      // Ensure Programme
      let programme = await db.programme.findUnique({ where: { code: metadata.programmeCode } });
      if (!programme) {
        programme = await db.programme.create({
          data: {
            code: metadata.programmeCode,
            name: `${metadata.programmeCode} Programme`,
            department: 'Academic Department',
          },
        });
      }

      // Create ResultBatch in DRAFT status
      const batchRecord = await db.resultBatch.create({
        data: {
          programmeId: programme.id,
          semester: metadata.semester,
          batch: metadata.batch || metadata.academicSession,
          academicSession: metadata.academicSession,
          examinationSession: metadata.examSession,
          examinationType: metadata.examType || 'REGULAR',
          viewType: validation.viewType,
          sourceFile: filename,
          status: 'DRAFT',
          uploadedBy: session.email,
        },
      });

      // Group rows by student (regNumber)
      const studentMap = new Map<string, typeof validation.processedRows>();
      validation.processedRows.forEach((r) => {
        const list = studentMap.get(r.regNumber) || [];
        list.push(r);
        studentMap.set(r.regNumber, list);
      });

      const storageDir = path.join(process.cwd(), 'storage', 'grade-cards');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      let importedStudentsCount = 0;

      for (const [regNumber, studentRows] of studentMap.entries()) {
        const first = studentRows[0];

        // Ensure Student
        const student = await db.student.upsert({
          where: { regNumber },
          update: {
            name: first.studentName,
            rollNumber: first.rollNumber,
            dob: first.dob,
            programmeId: programme.id,
            batch: metadata.batch || metadata.academicSession,
          },
          create: {
            regNumber: first.regNumber,
            rollNumber: first.rollNumber,
            name: first.studentName,
            dob: first.dob,
            programmeId: programme.id,
            batch: metadata.batch || metadata.academicSession,
          },
        });

        // Ensure Courses & Calculate SGPA
        let totalCredits = 0;
        let totalWeightedGp = 0;

        const courseResultCreateList: any[] = [];

        for (const row of studentRows) {
          let course = await db.course.findUnique({ where: { code: row.courseCode } });
          if (!course) {
            course = await db.course.create({
              data: {
                code: row.courseCode,
                title: row.courseTitle,
                credits: row.credits,
                programmeId: programme.id,
                semester: metadata.semester,
              },
            });
          }

          totalCredits += row.credits;
          totalWeightedGp += row.credits * (row.gradePoint || 8.0);

          courseResultCreateList.push({
            courseId: course.id,
            internalMarks: row.internalMarks,
            externalMarks: row.externalMarks,
            totalMarks: row.totalMarks,
            remarks: row.remarks,
            assignmentGrade: row.assignmentGrade || 'A',
            endTermGrade: row.endTermGrade || 'A',
            finalGrade: row.finalGrade || 'A',
            gradePoint: row.gradePoint || 8.0,
            status: row.status,
            courseCode: course.code,
            courseTitle: course.title,
            credits: course.credits,
          });
        }

        const calculatedSgpa = totalCredits > 0 ? totalWeightedGp / totalCredits : 0;
        const overallStatus = courseResultCreateList.every((c) => c.status.toUpperCase() === 'PASS') ? 'PASS' : 'FAIL';

        // Create SemesterResult linked to ResultBatch
        const semResult = await db.semesterResult.create({
          data: {
            studentId: student.id,
            resultBatchId: batchRecord.id,
            semester: metadata.semester,
            academicSession: metadata.academicSession,
            examSession: metadata.examSession,
            examType: metadata.examType || 'REGULAR',
            viewType: validation.viewType,
            sgpa: parseFloat(calculatedSgpa.toFixed(2)),
            resultStatus: overallStatus,
            declarationDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            status: 'DRAFT',
            courseResults: {
              create: courseResultCreateList.map((c) => ({
                courseId: c.courseId,
                internalMarks: c.internalMarks,
                externalMarks: c.externalMarks,
                totalMarks: c.totalMarks,
                remarks: c.remarks,
                assignmentGrade: c.assignmentGrade,
                endTermGrade: c.endTermGrade,
                finalGrade: c.finalGrade,
                gradePoint: c.gradePoint,
                status: c.status,
              })),
            },
          },
        });

        // Pre-generate static Grade Card PDF
        const pdfFileName = `${student.regNumber}_Sem_${metadata.semester}.pdf`;
        const pdfPath = path.join(storageDir, pdfFileName);

        await generateGradeCardPdf(
          {
            studentName: student.name,
            regNumber: student.regNumber,
            rollNumber: student.rollNumber,
            programmeName: programme.name,
            academicSession: metadata.academicSession,
            examSession: metadata.examSession,
            examType: metadata.examType || 'REGULAR',
            viewType: validation.viewType,
            batch: student.batch,
            semester: metadata.semester,
            sgpa: semResult.sgpa,
            resultStatus: semResult.resultStatus,
            declarationDate: semResult.declarationDate,
            courses: courseResultCreateList.map((c) => ({
              code: c.courseCode,
              title: c.courseTitle,
              credits: c.credits,
              internalMarks: c.internalMarks,
              externalMarks: c.externalMarks,
              totalMarks: c.totalMarks,
              remarks: c.remarks,
              assignmentGrade: c.assignmentGrade,
              endTermGrade: c.endTermGrade,
              finalGrade: c.finalGrade,
              gradePoint: c.gradePoint,
              status: c.status,
            })),
          },
          pdfPath
        );

        await db.gradeCard.upsert({
          where: { semesterResultId: semResult.id },
          update: { pdfPath },
          create: {
            studentId: student.id,
            semesterResultId: semResult.id,
            pdfPath,
          },
        });

        importedStudentsCount++;
      }

      await logAudit({
        adminId: session.id,
        action: 'RESULT_BATCH_IMPORT',
        resource: 'RESULTS',
        details: `Imported batch ${batchRecord.id} (${importedStudentsCount} students) from ${filename} in DRAFT status`,
      });

      return NextResponse.json({
        success: true,
        data: {
          batchId: batchRecord.id,
          studentsCount: importedStudentsCount,
          rowsCount: validation.processedRows.length,
          status: 'DRAFT',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process spreadsheet upload' }, { status: 500 });
  }
}
