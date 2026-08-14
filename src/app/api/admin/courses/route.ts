import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const courses = await db.course.findMany({
    orderBy: { code: 'asc' },
    include: { programme: true },
  });

  return NextResponse.json({ success: true, courses });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, title, credits, programmeId, semester } = await req.json();

  if (!code || !title || !credits || !programmeId) {
    return NextResponse.json({ error: 'Missing required course fields' }, { status: 400 });
  }

  const course = await db.course.create({
    data: {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      credits: parseFloat(credits),
      programmeId,
      semester: semester || 'I',
    },
  });

  await logAudit({
    adminId: session.id,
    action: 'CREATE_COURSE',
    resource: 'COURSES',
    details: `Created course ${course.code} - ${course.title}`,
  });

  return NextResponse.json({ success: true, course });
}
