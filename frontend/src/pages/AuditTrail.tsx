import React, { useEffect, useState } from 'react';
import { AuditEvent } from '../types';
import { api } from '../services/api';

export const AuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getAuditTrail(entityFilter || undefined)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entityFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="audit-trail-view">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">history_toggle_off</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                System Audit Trail &amp; Governance Log
              </h1>
              <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                FR-050..053, RULE-008
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident chronological audit trail capturing actor, timestamp, action, and state deltas.
            </p>
          </div>
        </div>

        <div>
          <select
            data-testid="audit-entity-filter"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary font-medium text-slate-700"
          >
            <option value="">All Entity Audit Events</option>
            <option value="DISCREPANCY">Discrepancy Events</option>
            <option value="REWORK_ENTRY">Rework Effort Events</option>
            <option value="DEFECT_CATEGORY">Taxonomy Events</option>
            <option value="ROOT_CAUSE">Root Cause Events</option>
            <option value="EXPORT">Data Export Events</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" data-testid="audit-table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">Recorded Change / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-xl text-secondary mr-2">
                      progress_activity
                    </span>
                    Loading audit trail records...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {ev.actor_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {ev.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {ev.entity_type}
                    </td>
                    <td className="px-4 py-3 text-primary font-bold whitespace-nowrap">
                      #{ev.entity_id}
                    </td>
                    <td className="px-4 py-3 max-w-md font-sans text-xs text-slate-700 truncate">
                      {ev.new_values || ev.old_values || '—'}
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
};

