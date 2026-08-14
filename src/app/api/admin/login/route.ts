import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, createAdminToken, setAdminSessionCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`admin_login:${ip}`, 5, 300); // 5 attempts per 5 minutes

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      await logAudit({ action: 'ADMIN_LOGIN_FAILED', resource: 'AUTH', details: `Failed login attempt for ${email}`, ipAddress: ip });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, admin.passwordHash);

    if (!isValid) {
      await logAudit({ adminId: admin.id, action: 'ADMIN_LOGIN_FAILED', resource: 'AUTH', details: 'Invalid password', ipAddress: ip });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    await setAdminSessionCookie(token);
    await logAudit({ adminId: admin.id, action: 'ADMIN_LOGIN_SUCCESS', resource: 'AUTH', details: 'Successful admin login', ipAddress: ip });

    return NextResponse.json({
      success: true,
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
