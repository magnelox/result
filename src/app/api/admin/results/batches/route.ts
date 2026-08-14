import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const batches = await db.resultBatch.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      programme: true,
      _count: { select: { semesterResults: true } },
    },
  });

  return NextResponse.json({ success: true, batches });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { batchId, action } = (await req.json()) as {
      batchId: string;
      action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE';
    };

    if (!batchId || !action) {
      return NextResponse.json({ error: 'Batch ID and Action required' }, { status: 400 });
    }

    const batch = await db.resultBatch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: 'Result batch not found' }, { status: 404 });
    }

    if (action === 'PUBLISH' || action === 'UNPUBLISH') {
      const targetStatus = action === 'PUBLISH' ? 'PUBLISHED' : 'UNPUBLISHED';

      await db.resultBatch.update({
        where: { id: batchId },
        data: {
          status: targetStatus,
          publishedAt: action === 'PUBLISH' ? new Date() : null,
        },
      });

      const updatedResults = await db.semesterResult.updateMany({
        where: { resultBatchId: batchId },
        data: { status: targetStatus },
      });

      await logAudit({
        adminId: session.id,
        action: `BATCH_${action}`,
        resource: 'RESULT_BATCH',
        details: `Batch ${batchId} ${targetStatus} (${updatedResults.count} student results updated)`,
      });

      return NextResponse.json({ success: true, status: targetStatus, updatedCount: updatedResults.count });
    }

    if (action === 'DELETE') {
      // Delete semester results in batch
      await db.semesterResult.deleteMany({
        where: { resultBatchId: batchId },
      });

      await db.resultBatch.delete({
        where: { id: batchId },
      });

      await logAudit({
        adminId: session.id,
        action: 'BATCH_DELETE',
        resource: 'RESULT_BATCH',
        details: `Deleted result batch ${batchId}`,
      });

      return NextResponse.json({ success: true, deleted: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update result batch' }, { status: 500 });
  }
}
