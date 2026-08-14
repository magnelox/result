import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, getAdminSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await logAudit({ adminId: session.id, action: 'ADMIN_LOGOUT', resource: 'AUTH', details: 'Admin logged out' });
  }
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
