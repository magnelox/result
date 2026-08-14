import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`search:${ip}`, 30, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a moment before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { regNumber, dob, programmeId } = body || {};

    if (!regNumber || !dob || !programmeId) {
      return NextResponse.json(
        {
          error:
            "We couldn't find a result with those details. Please check your Registration Number, Date of Birth and Programme and try again.",
        },
        { status: 404 }
      );
    }

    // Normalize DOB format if DD/MM/YYYY input
    let cleanDob = dob.trim();
    if (cleanDob.includes('/')) {
      const parts = cleanDob.split('/');
      if (parts.length === 3) {
        cleanDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const cleanReg = regNumber.trim();

    // Query DB for student with matching Reg No, DOB, and Programme
    const student = await db.student.findFirst({
      where: {
        regNumber: { equals: cleanReg },
        dob: { equals: cleanDob },
        programmeId: { equals: programmeId },
      },
      include: {
        programme: true,
        semesterResults: {
          where: { status: 'PUBLISHED' }, // Strictly published results only
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            courseResults: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.semesterResults || student.semesterResults.length === 0) {
      // Generic Anti-Enumeration Error
      return NextResponse.json(
        {
          error:
            "We couldn't find a result with those details. Please check your Registration Number, Date of Birth and Programme and try again.",
        },
        { status: 404 }
      );
    }

    const result = student.semesterResults[0];

    return NextResponse.json({
      success: true,
      data: {
        semesterResultId: result.id,
        student: {
          name: student.name,
          regNumber: student.regNumber,
          rollNumber: student.rollNumber,
          programmeName: student.programme.name,
          batch: student.batch,
        },
        result: {
          semester: result.semester,
          academicSession: result.academicSession,
          examSession: result.examSession,
          examType: result.examType,
          sgpa: result.sgpa,
          resultStatus: result.resultStatus,
          declarationDate: result.declarationDate,
          courses: result.courseResults.map((cr) => ({
            id: cr.id,
            code: cr.course.code,
            title: cr.course.title,
            credits: cr.course.credits,
            assignmentGrade: cr.assignmentGrade,
            endTermGrade: cr.endTermGrade,
            finalGrade: cr.finalGrade,
            gradePoint: cr.gradePoint,
            status: cr.status,
          })),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'An unexpected system error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
