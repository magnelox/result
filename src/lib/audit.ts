import { db } from './db';

export async function logAudit(params: {
  adminId?: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        adminId: params.adminId || null,
        action: params.action,
        resource: params.resource,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
