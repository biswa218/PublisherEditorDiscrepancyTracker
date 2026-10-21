import React, { useEffect, useState } from 'react';
import { Discrepancy, Journal, DefectCategory } from '../types';
import { api } from '../services/api';

interface DiscrepancyRegisterProps {
  onSelectDiscrepancy: (id: number) => void;
  onOpenLogModal: () => void;
  initialFilters?: { journalId?: number; categoryId?: number; status?: string };
}

export const DiscrepancyRegister: React.FC<DiscrepancyRegisterProps> = ({
  onSelectDiscrepancy,
  onOpenLogModal,
  initialFilters
}) => {
  const [items, setItems] = useState<Discrepancy[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<DefectCategory[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [journalId, setJournalId] = useState<number | ''>(initialFilters?.journalId || '');
  const [categoryId, setCategoryId] = useState<number | ''>(initialFilters?.categoryId || '');
  const [status, setStatus] = useState<string>(initialFilters?.status || 'ALL');
  const [severity, setSeverity] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [loading, setLoading] = useState(true);

  // Load Metadata
  useEffect(() => {
    Promise.all([api.getJournals(), api.getCategories()])
      .then(([jRes, cRes]) => {
        setJournals(jRes);
        setCategories(cRes);
      })
      .catch(console.error);
  }, []);

  // Sync initial filters if changed
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.journalId !== undefined) setJournalId(initialFilters.journalId);
      if (initialFilters.categoryId !== undefined) setCategoryId(initialFilters.categoryId);
      if (initialFilters.status !== undefined) setStatus(initialFilters.status);
      setPage(1);
    }
  }, [initialFilters]);

  // Load Discrepancies
  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      const res = await api.getDiscrepancies({
        search,
        journalId: journalId || undefined,
        categoryId: categoryId || undefined,
        status: status !== 'ALL' ? status : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        sortBy,
        sortOrder,
        page,
        limit
      });
      setItems(res.items);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch discrepancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, [search, journalId, categoryId, status, severity, priority, page, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearch('');
    setJournalId('');
    setCategoryId('');
    setStatus('ALL');
    setSeverity('ALL');
    setPriority('ALL');
    setPage(1);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TRIAGED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ASSIGNED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'IN PROGRESS':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'VERIFIED':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'CLOSED':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'REOPENED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="discrepancy-register-view">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary font-display tracking-tight">
              Discrepancy Ledger &amp; Filter Register
            </h1>
            <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              FR-035..039
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete searchable repository of publisher-editor defects, rework calculations, and workflow states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportUrl({ search, journalId, categoryId, status, severity, priority })}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="export-csv-ledger-btn"
            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-secondary">file_download</span>
            <span>Export Filtered CSV (FR-041)</span>
          </a>
          <button
            type="button"
            data-testid="register-new-btn"
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-primary-container px-3.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Log Defect</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                data-testid="filter-search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ID, Title, Manuscript ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Journal Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Journal
            </label>
            <select
              data-testid="filter-journal-select"
              value={journalId}
              onChange={(e) => {
                setJournalId(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-secondary"
            >
              <option value="">All Journals</option>
              {journals.map(j => (
                <option key={j.id} value={j.id}>[{j.journal_code}] {j.journal_name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lifecycle Status
            </label>
            <select
              data-testid="filter-status-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-secondary"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="TRIAGED">TRIAGED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Severity
            </label>
            <select
              data-testid="filter-severity-select"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-secondary"
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              data-testid="filter-category-select"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-secondary"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-primary">{items.length}</strong> of <strong className="text-primary">{total}</strong> total discrepancies
          </div>
          <button
            type="button"
            data-testid="reset-filters-btn"
            onClick={resetFilters}
            className="text-secondary hover:text-primary font-semibold inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" data-testid="discrepancy-table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Discrepancy Title &amp; Manuscript</th>
                <th className="px-4 py-3">Journal</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Severity</th>
                <th className="px-4 py-3 text-right">Rework</th>
                <th className="px-4 py-3">Related Editor</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-xl text-secondary mr-2">
                      progress_activity
                    </span>
                    Loading ledger records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No discrepancies match the active filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectDiscrepancy(item.id)}
                    data-testid={`discrepancy-row-${item.reference_number}`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {item.reference_number}
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        {item.manuscript_reference ? (
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded">MS: {item.manuscript_reference}</span>
                        ) : (
                          <span className="italic text-slate-400">No MS Ref</span>
                        )}
                        <span>· {item.identified_date}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800">
                        {item.journal_code}
                      </span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {item.journal_name}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {item.category_name}
                      {item.sub_category_name && (
                        <div className="text-[10px] text-slate-400 italic">
                          {item.sub_category_name}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.total_rework_hours > 0 ? (
                        <span>{item.total_rework_hours} hrs</span>
                      ) : (
                        <span className="text-slate-400 font-normal">0.0</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {item.related_editor_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        data-testid={`view-discrepancy-${item.reference_number}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDiscrepancy(item.id);
                        }}
                        className="text-secondary hover:text-primary font-semibold inline-flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        <span>Details</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

