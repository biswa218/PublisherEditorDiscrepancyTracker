import React, { useEffect, useState } from 'react';
import { ExecutiveKPIs } from '../types';
import { api } from '../services/api';

interface ExecutiveDashboardProps {
  onNavigateToRegister: (filter?: { journalId?: number; categoryId?: number; status?: string }) => void;
  onOpenLogModal: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigateToRegister,
  onOpenLogModal
}) => {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [journalData, setJournalData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, jRes, cRes, tRes] = await Promise.all([
        api.getSummaryKPIs(),
        api.getReworkByJournal(),
        api.getReworkByCategory(),
        api.getTrends()
      ]);
      setKpis(kpiRes);
      setJournalData(jRes);
      setCategoryData(cRes);
      setTrends(tRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !kpis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span className="material-symbols-outlined animate-spin text-2xl text-secondary">
            progress_activity
          </span>
          <span>Loading Executive Discrepancy Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="executive-dashboard-view">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-container text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                Executive Discrepancy &amp; Rework Intelligence
              </h1>
              <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                FRD v5.6 · Sec 8
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scholarly publication pipeline triage, rework cost impact, and systemic defect mitigation audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="export-csv-btn"
            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-secondary">file_download</span>
            <span>Export CSV</span>
          </a>
          <button
            type="button"
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-primary-container px-3.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Log Defect</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Discrepancies */}
        <div 
          onClick={() => onNavigateToRegister()}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          data-testid="kpi-total-discrepancies"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Discrepancies</span>
              <span className="material-symbols-outlined text-primary text-lg">checklist_rtl</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary font-display">
                {kpis.totalDiscrepancies}
              </span>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                +{kpis.openDiscrepancies} Active
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <strong className="text-slate-700">{kpis.openDiscrepancies}</strong> Open
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <strong className="text-slate-700">{kpis.triagedDiscrepancies}</strong> Triaged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <strong className="text-slate-700">{kpis.resolvedDiscrepancies + kpis.closedDiscrepancies}</strong> Fixed
            </span>
          </div>
        </div>

        {/* Card 2: Total Rework Hours */}
        <div 
          onClick={() => onNavigateToRegister()}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          data-testid="kpi-total-rework-hours"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Rework Effort</span>
              <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary font-display">
                {kpis.totalReworkHours}
              </span>
              <span className="text-sm text-slate-500 font-normal">hrs</span>
              <span className="ml-2 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                -8.4% efficiency
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono text-slate-600 font-semibold">SUM(rework_entries)</span>
            <span>Across {kpis.discrepanciesWithRework} incidents</span>
          </div>
        </div>

        {/* Card 3: Active Incident Pipeline */}
        <div 
          onClick={() => onNavigateToRegister({ status: 'OPEN' })}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          data-testid="kpi-open-discrepancies"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">pending_actions</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-700 font-display">
                {kpis.openDiscrepancies}
              </span>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                {kpis.criticalDiscrepancies} Critical
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>SLA Compliance Rate:</span>
            <span className="font-semibold text-emerald-700">{kpis.slaComplianceRate}%</span>
          </div>
        </div>

        {/* Card 4: Quality Efficiency & Resolution Time */}
        <div 
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
          data-testid="kpi-resolution-days"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution Days</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary font-display">
                {kpis.avgResolutionDays}
              </span>
              <span className="text-sm text-slate-500 font-normal">days</span>
              <span className="ml-2 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Within Target
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Reopened Rate:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {kpis.totalDiscrepancies > 0 ? ((kpis.reopenedDiscrepancies / kpis.totalDiscrepancies) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Trend Visual & Defect Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Visual */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-primary font-display">
                Discrepancy Volume &amp; Rework Effort Trend
              </h2>
              <p className="text-xs text-slate-500">
                Monthly trajectory of reported editorial defects vs rework hours logged
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">FR-030</span>
          </div>

          <div className="space-y-4 pt-2">
            {trends.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No trend records found</div>
            ) : (
              trends.map((t, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-mono text-slate-700 font-semibold">{t.period}</span>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-primary font-semibold">
                        {t.discrepancy_count} Discrepancies
                      </span>
                      <span className="text-secondary font-semibold font-mono">
                        {t.total_rework_hours} hrs rework
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-primary h-full transition-all rounded-l-full"
                      style={{ width: `${Math.min(100, t.discrepancy_count * 10)}%` }}
                    />
                    <div 
                      className="bg-secondary h-full transition-all opacity-80"
                      style={{ width: `${Math.min(100, t.total_rework_hours * 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Defect Category Share */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-primary font-display">
                Defect Category Share
              </h2>
              <p className="text-xs text-slate-500">
                Pareto distribution of rework by category (FR-024)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {categoryData.slice(0, 5).map((cat) => (
              <div 
                key={cat.category_id} 
                onClick={() => onNavigateToRegister({ categoryId: cat.category_id })}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-primary transition-colors truncate max-w-[180px]">
                    {cat.category_name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-slate-500">{cat.total_rework_hours} hrs</span>
                    <span className="font-bold text-primary">{cat.rework_share_pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary h-full rounded-full transition-all group-hover:bg-primary"
                    style={{ width: `${Math.min(100, cat.rework_share_pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Journals by Rework Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-primary font-display">
              Journal Discrepancy &amp; Rework Ranking (FR-023, FR-031)
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated defect volume and correction effort across publications
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToRegister()}
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3">Journal Code</th>
                <th className="px-6 py-3">Journal Name</th>
                <th className="px-6 py-3 text-center">Discrepancies</th>
                <th className="px-6 py-3 text-center">Active Open</th>
                <th className="px-6 py-3 text-right">Total Rework Hours</th>
                <th className="px-6 py-3 text-right">Avg Rework / Defect</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {journalData.map((j) => (
                <tr key={j.journal_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-mono font-bold text-primary">
                    {j.journal_code}
                  </td>
                  <td className="px-6 py-3 font-medium">
                    {j.journal_name}
                  </td>
                  <td className="px-6 py-3 text-center font-semibold">
                    {j.discrepancy_count}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {j.open_count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {j.open_count} open
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        0 open
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">
                    {j.total_rework_hours} hrs
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-500">
                    {j.avg_rework_per_discrepancy} hrs
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      data-testid={`drilldown-journal-${j.journal_code}`}
                      onClick={() => onNavigateToRegister({ journalId: j.journal_id })}
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
    </div>
  );
};

