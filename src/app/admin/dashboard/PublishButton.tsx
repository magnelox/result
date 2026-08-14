'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

export function PublishButton({
  publishedCount,
  draftCount,
}: {
  publishedCount: number;
  draftCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetAction, setTargetAction] = useState<'PUBLISH' | 'UNPUBLISH'>('PUBLISH');

  const handleToggle = (action: 'PUBLISH' | 'UNPUBLISH') => {
    setTargetAction(action);
    setShowConfirm(true);
  };

  const executePublishAction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: targetAction }),
      });

      if (!res.ok) throw new Error('Failed to update publication status');

      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      alert('Error updating publication status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {draftCount > 0 || publishedCount === 0 ? (
        <button
          onClick={() => handleToggle('PUBLISH')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          PUBLISH RESULTS ({draftCount})
        </button>
      ) : (
        <button
          onClick={() => handleToggle('UNPUBLISH')}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
        >
          <ShieldAlert className="w-4 h-4 text-white" />
          UNPUBLISH RESULTS
        </button>
      )}

      {/* Modal Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-serif font-bold text-lg text-ssu-navy flex items-center gap-2">
              {targetAction === 'PUBLISH' ? '🚀 Confirm Result Publication' : '⚠️ Confirm Unpublish Action'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {targetAction === 'PUBLISH'
                ? `Publishing will make ${draftCount > 0 ? draftCount : 'all'} draft semester results immediately visible to students on the public lookup portal.`
                : `Unpublishing will temporarily hide all active student results from the public portal.`}
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
              <div>Target Status: <strong className="text-ssu-navy">{targetAction}ED</strong></div>
              <div>Action By: Admin User</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                CANCEL
              </button>

              <button
                disabled={loading}
                onClick={executePublishAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow flex items-center gap-2 ${
                  targetAction === 'PUBLISH' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {targetAction === 'PUBLISH' ? 'CONFIRM & PUBLISH' : 'CONFIRM UNPUBLISH'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
