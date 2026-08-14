import React from 'react';
import { db } from '@/lib/db';
import { ShieldCheck } from 'lucide-react';

export default async function AdminAuditLogsPage() {
  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { admin: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-ssu-gold">SECURITY & COMPLIANCE</span>
        <h1 className="text-2xl font-serif font-bold text-ssu-navy mt-0.5">System Audit Trail</h1>
        <p className="text-xs text-slate-500 font-sans">Immutable audit logs recording all administrative result publication, import, and authentication actions</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ssu-navy text-white font-semibold uppercase">
            <tr>
              <th className="p-3.5 border-b border-ssu-gold">Timestamp</th>
              <th className="p-3.5 border-b border-ssu-gold">Admin User</th>
              <th className="p-3.5 border-b border-ssu-gold">Action</th>
              <th className="p-3.5 border-b border-ssu-gold">Resource</th>
              <th className="p-3.5 border-b border-ssu-gold">Details</th>
              <th className="p-3.5 border-b border-ssu-gold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3.5 text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-3.5 font-sans font-semibold text-slate-900">
                  {log.admin?.name || log.admin?.email || 'System'}
                </td>
                <td className="p-3.5">
                  <span className="font-bold text-ssu-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {log.action}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-slate-700">{log.resource}</td>
                <td className="p-3.5 font-sans text-slate-700 max-w-md truncate">{log.details}</td>
                <td className="p-3.5 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
