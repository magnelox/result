import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateGradeCardPdf } from '@/lib/pdf-generator';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const semesterResultId = params.id;

    if (!semesterResultId) {
      return NextResponse.json({ error: 'Grade Card ID required' }, { status: 400 });
    }

    const semesterResult = await db.semesterResult.findUnique({
      where: { id: semesterResultId },
      include: {
        student: {
          include: {
            programme: true,
          },
        },
        courseResults: {
          include: {
            course: true,
          },
        },
        gradeCards: true,
      },
    });

    if (!semesterResult || semesterResult.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Grade Card not found or result not published' }, { status: 404 });
    }

    const storageDir = path.join(process.cwd(), 'storage', 'grade-cards');
    const pdfFileName = `${semesterResult.student.regNumber}_Sem_${semesterResult.semester}.pdf`;
    const pdfPath = path.join(storageDir, pdfFileName);

    // If PDF doesn't exist yet, generate and save it
    if (!fs.existsSync(pdfPath)) {
      await generateGradeCardPdf(
        {
          studentName: semesterResult.student.name,
          regNumber: semesterResult.student.regNumber,
          rollNumber: semesterResult.student.rollNumber,
          programmeName: semesterResult.student.programme.name,
          academicSession: semesterResult.academicSession,
          examSession: semesterResult.examSession,
          examType: semesterResult.examType,
          batch: semesterResult.student.batch,
          semester: semesterResult.semester,
          sgpa: semesterResult.sgpa,
          resultStatus: semesterResult.resultStatus,
          declarationDate: semesterResult.declarationDate,
          courses: semesterResult.courseResults.map((c) => ({
            code: c.course.code,
            title: c.course.title,
            credits: c.course.credits,
            assignmentGrade: c.assignmentGrade,
            endTermGrade: c.endTermGrade,
            finalGrade: c.finalGrade,
            gradePoint: c.gradePoint,
            status: c.status,
          })),
        },
        pdfPath
      );
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFileName}"`,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download Grade Card' }, { status: 500 });
  }
}
