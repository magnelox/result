import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const programmes = await db.programme.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { students: true, courses: true } } },
  });

  return NextResponse.json({ success: true, programmes });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, name, department, status } = await req.json();

  if (!code || !name) {
    return NextResponse.json({ error: 'Code and Name required' }, { status: 400 });
  }

  const prog = await db.programme.create({
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      department: (department || 'Academic Department').trim(),
      status: status || 'ACTIVE',
    },
  });

  await logAudit({
    adminId: session.id,
    action: 'CREATE_PROGRAMME',
    resource: 'PROGRAMMES',
    details: `Created programme ${prog.code} - ${prog.name}`,
  });

  return NextResponse.json({ success: true, programme: prog });
}
