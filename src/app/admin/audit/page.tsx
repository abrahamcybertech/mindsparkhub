'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Link as LinkIcon } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit?limit=100')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-navy-900">
          Immutable Audit Log Trail
        </h1>
        <p className="text-xs text-navy-600 mt-1">
          Cryptographically chained records using SHA 256 hash chaining. Database permissions prohibit UPDATE or DELETE operations on this table.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Actor Role</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Chained Hash Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    No audit records available.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-navy-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-navy-900">{log.action}</span>
                      {log.details && (
                        <p className="text-[10px] text-navy-500 line-clamp-1">{log.details}</p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-gold-700 uppercase text-[10px]">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-navy-700">
                      {log.target_entity}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.outcome === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-navy-400 max-w-xs truncate" title={log.entry_hash}>
                      {log.entry_hash}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
