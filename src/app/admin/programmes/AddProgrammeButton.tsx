'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

export function AddProgrammeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, department }),
      });

      if (!res.ok) throw new Error('Failed to create programme');

      setOpen(false);
      setCode('');
      setName('');
      setDepartment('');
      router.refresh();
    } catch (err) {
      alert('Error creating programme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-ssu-navy hover:bg-ssu-navy-light text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
      >
        <Plus className="w-4 h-4 text-ssu-gold" />
        New Programme
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-serif font-bold text-lg text-ssu-navy">Create New Programme</h3>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Programme Code (e.g. MBA)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MBA"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Programme Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Master of Business Administration"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Faculty of Management Studies"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-ssu-navy text-white rounded-lg shadow"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'CREATE PROGRAMME'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
