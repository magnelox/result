import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { admin: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ success: true, logs });
}
