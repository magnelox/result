import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = (await req.json()) as { action: 'PUBLISH' | 'UNPUBLISH' };

    if (!action || !['PUBLISH', 'UNPUBLISH'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (PUBLISH or UNPUBLISH) required' }, { status: 400 });
    }

    const newStatus = action === 'PUBLISH' ? 'PUBLISHED' : 'UNPUBLISHED';

    // Update all results
    const updated = await db.semesterResult.updateMany({
      data: { status: newStatus },
    });

    // Update ResultImport status
    await db.resultImport.updateMany({
      data: { status: newStatus },
    });

    await logAudit({
      adminId: session.id,
      action: `RESULTS_${action}`,
      resource: 'RESULTS',
      details: `Admin ${action}ED ${updated.count} semester results.`,
    });

    return NextResponse.json({
      success: true,
      action,
      updatedCount: updated.count,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update publication status' }, { status: 500 });
  }
}
