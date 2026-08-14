'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldAlert, Trash2, Loader2 } from 'lucide-react';

export function BatchActions({
  batchId,
  currentStatus,
}: {
  batchId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE') => {
    if (action === 'DELETE' && !confirm('Are you sure you want to delete this result batch? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/results/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, action }),
      });

      if (!res.ok) throw new Error('Failed to perform batch action');
      router.refresh();
    } catch (err) {
      alert('Error updating batch status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-ssu-navy mx-auto" />;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentStatus !== 'PUBLISHED' ? (
        <button
          onClick={() => handleAction('PUBLISH')}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200"
          title="Publish Batch"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Publish
        </button>
      ) : (
        <button
          onClick={() => handleAction('UNPUBLISH')}
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200"
          title="Unpublish Batch"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Unpublish
        </button>
      )}

      <button
        onClick={() => handleAction('DELETE')}
        className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 p-1 rounded border border-rose-200"
        title="Delete Batch"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
