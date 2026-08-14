import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { createStudentToken, setStudentSessionCookie } from '@/lib/student-auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`student_login:${ip}`, 20, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const { regNumber, dob, programmeId } = await req.json();

    if (!regNumber || !dob || !programmeId) {
      return NextResponse.json(
        {
          error:
            "Invalid registration number, date of birth, or programme.",
        },
        { status: 400 }
      );
    }

    // Normalize DOB
    let cleanDob = dob.trim();
    if (cleanDob.includes('/')) {
      const parts = cleanDob.split('/');
      if (parts.length === 3) {
        cleanDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const cleanReg = regNumber.trim();

    const student = await db.student.findFirst({
      where: {
        regNumber: { equals: cleanReg },
        dob: { equals: cleanDob },
        programmeId: { equals: programmeId },
      },
      include: {
        programme: true,
        semesterResults: {
          where: { status: 'PUBLISHED' },
          take: 1,
        },
      },
    });

    if (!student || !student.semesterResults || student.semesterResults.length === 0) {
      // Anti-enumeration generic error response
      return NextResponse.json(
        {
          error:
            "Invalid registration number, date of birth, or programme.",
        },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createStudentToken({
      studentId: student.id,
      regNumber: student.regNumber,
      name: student.name,
      programmeId: student.programme.id,
      programmeName: student.programme.name,
    });

    await setStudentSessionCookie(token);

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        regNumber: student.regNumber,
        programmeName: student.programme.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected system error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
