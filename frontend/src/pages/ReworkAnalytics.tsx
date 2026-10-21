import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface ReworkAnalyticsProps {
  onNavigateToRegister: (filter?: { journalId?: number; categoryId?: number; editorId?: number }) => void;
}

export const ReworkAnalytics: React.FC<ReworkAnalyticsProps> = ({
  onNavigateToRegister
}) => {
  const [editorData, setEditorData] = useState<any[]>([]);
  const [journalData, setJournalData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [rootCauseData, setRootCauseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getReworkByEditor(),
      api.getReworkByJournal(),
      api.getReworkByCategory(),
      api.getRootCauseDistribution()
    ])
      .then(([eRes, jRes, cRes, rcRes]) => {
        setEditorData(eRes);
        setJournalData(jRes);
        setCategoryData(cRes);
        setRootCauseData(rcRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span className="material-symbols-outlined animate-spin text-2xl text-secondary">
            progress_activity
          </span>
          <span>Loading attribution matrices &amp; rework analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="rework-analytics-view">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                Rework Analytics &amp; Editorial Attribution Matrices
              </h1>
              <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                FR-022, FR-023, FR-024
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive attribution breakdowns by editor handling, publication journals, defect classifications, and root causes.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Governance Notice per FR-022 & RULE-010 */}
      <div 
        data-testid="governance-disclaimer"
        className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-sm"
      >
        <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5 shrink-0">
          policy
        </span>
        <div className="text-xs space-y-1">
          <span className="font-bold uppercase tracking-wider text-[11px] block">
            Academic Governance &amp; Attribution Compliance (RULE-010, FR-022)
          </span>
          <p className="leading-relaxed">
            Association of an editor with a discrepancy signifies editorial routing, journal leadership oversight, and manuscript handling. 
            <strong> Association does not establish fault, personal culpability, or punitive performance scoring.</strong> 
            Attribution matrices are utilized strictly for editorial workload balancing, training curriculum enhancement, and root-cause process remediation.
          </p>
        </div>
      </div>

      {/* Matrix 1: Editor-Associated Rework Attribution */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-primary font-display">
              Editor-Associated Rework Matrix (FR-022, US-010)
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated rework effort associated with handling editor assignments
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {editorData.length} Editors Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" data-testid="editor-attribution-table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3">Editor Name</th>
                <th className="px-6 py-3">Department / Portfolio</th>
                <th className="px-6 py-3">Associated Journals</th>
                <th className="px-6 py-3 text-center">Incidents Handled</th>
                <th className="px-6 py-3 text-right">Total Rework Hours</th>
                <th className="px-6 py-3 text-right">Avg Hours / Defect</th>
                <th className="px-6 py-3">Attribution Role Tag</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {editorData.map((ed) => (
                <tr key={ed.editor_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-semibold text-primary">
                    {ed.editor_name}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {ed.department || 'Editorial Office'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {ed.associated_journals || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-bold">
                    {ed.discrepancy_count}
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">
                    {ed.total_rework_hours} hrs
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-500">
                    {ed.avg_rework_per_discrepancy} hrs
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-semibold">
                      Editorial Handling Only
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      data-testid={`drilldown-editor-${ed.editor_id}`}
                      onClick={() => onNavigateToRegister({ editorId: ed.editor_id })}
                      className="text-secondary hover:text-primary font-semibold inline-flex items-center gap-1"
                    >
                      <span>Drill-down</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Journal Breakdown & Root Cause Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journal Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-primary font-display">
              Journal Rework Aggregation (FR-023, US-008)
            </h2>
            <p className="text-xs text-slate-500">
              Total defect count and hours grouped by publication
            </p>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Journal</th>
                  <th className="px-4 py-2.5 text-center">Defects</th>
                  <th className="px-4 py-2.5 text-right">Rework Hours</th>
                  <th className="px-4 py-2.5 text-right">Avg/Defect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {journalData.map((j) => (
                  <tr key={j.journal_id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="font-mono font-bold text-primary">{j.journal_code}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{j.journal_name}</div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-semibold">
                      {j.discrepancy_count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {j.total_rework_hours} hrs
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                      {j.avg_rework_per_discrepancy} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Root Cause Pareto Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-primary font-display">
              Root Cause Distribution (FR-010, FR-033, US-014)
            </h2>
            <p className="text-xs text-slate-500">
              Breakdown of systematic error drivers and associated rework
            </p>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Root Cause</th>
                  <th className="px-4 py-2.5">Classification</th>
                  <th className="px-4 py-2.5 text-center">Incidents</th>
                  <th className="px-4 py-2.5 text-right">Rework Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rootCauseData.map((rc) => (
                  <tr key={rc.root_cause_id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      {rc.cause_name}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {rc.cause_category}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold">
                      {rc.discrepancy_count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {rc.total_rework_hours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

