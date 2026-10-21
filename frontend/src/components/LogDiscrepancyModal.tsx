import React, { useState } from 'react';
import { Journal, DefectCategory, AppUser, RootCause } from '../types';
import { api } from '../services/api';

interface LogDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newId: number) => void;
  journals: Journal[];
  categories: DefectCategory[];
  rootCauses: RootCause[];
  editors: AppUser[];
  currentUser: AppUser;
}

export const LogDiscrepancyModal: React.FC<LogDiscrepancyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  journals,
  categories,
  rootCauses,
  editors,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [journalId, setJournalId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [relatedEditorId, setRelatedEditorId] = useState<number | ''>('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P2');
  const [manuscriptRef, setManuscriptRef] = useState('');
  const [identifiedDate, setIdentifiedDate] = useState(new Date().toISOString().split('T')[0]);
  const [impactDescription, setImpactDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [rootCauseId, setRootCauseId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCategory = categories.find(c => c.id === Number(categoryId));
  const availableSubcategories = selectedCategory?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation (FR-003)
    if (!title.trim()) {
      setErrorMessage('Please provide a title for the discrepancy.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a detailed defect description.');
      return;
    }
    if (!journalId) {
      setErrorMessage('Please select the affected academic journal.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select an approved defect category.');
      return;
    }
    if (!identifiedDate) {
      setErrorMessage('Identified date is mandatory.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        journal_id: Number(journalId),
        category_id: Number(categoryId),
        sub_category_id: subCategoryId ? Number(subCategoryId) : null,
        created_by: currentUser.id,
        related_editor_id: relatedEditorId ? Number(relatedEditorId) : null,
        severity,
        priority,
        manuscript_reference: manuscriptRef.trim() || null,
        identified_date: identifiedDate,
        impact_description: impactDescription.trim() || null,
        evidence_url: evidenceUrl.trim() || null,
        root_cause_id: rootCauseId ? Number(rootCauseId) : null
      };

      const created = await api.createDiscrepancy(payload);
      onSuccess(created.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create discrepancy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              add_alert
            </span>
            <div>
              <h2 className="text-base font-bold text-primary font-display">
                Log Defect Discrepancy
              </h2>
              <p className="text-xs text-slate-500">
                Taylor &amp; Francis Scholarly Discrepancy Ledger (Auto ID will be assigned: PED-XXXXXX)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div 
              data-testid="modal-error-banner"
              className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2 font-medium"
            >
              <span className="material-symbols-outlined text-red-600 text-sm">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Discrepancy Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              data-testid="discrepancy-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mismatch between galley proof equation and author manuscript"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Defect Description &amp; Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              data-testid="discrepancy-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the discrepancy clearly, including affected sections, equations, tables, or author queries."
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Row: Journal & Manuscript Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Affected Journal <span className="text-red-500">*</span>
              </label>
              <select
                data-testid="discrepancy-journal-select"
                value={journalId}
                onChange={(e) => setJournalId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="">-- Select Academic Journal --</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>
                    [{j.journal_code}] {j.journal_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Manuscript / Submission ID
              </label>
              <input
                type="text"
                data-testid="discrepancy-manuscript-input"
                value={manuscriptRef}
                onChange={(e) => setManuscriptRef(e.target.value)}
                placeholder="e.g. JAP-2026-08912"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Row: Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Defect Category <span className="text-red-500">*</span>
              </label>
              <select
                data-testid="discrepancy-category-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value ? Number(e.target.value) : '');
                  setSubCategoryId('');
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="">-- Select Defect Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subcategory
              </label>
              <select
                data-testid="discrepancy-subcategory-select"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value ? Number(e.target.value) : '')}
                disabled={availableSubcategories.length === 0}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- {availableSubcategories.length ? 'Select Subcategory' : 'No Subcategories'} --</option>
                {availableSubcategories.map(sc => (
                  <option key={sc.id} value={sc.id}>
                    {sc.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Severity, Priority, Identified Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                data-testid="discrepancy-severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical (Blocks Publication)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                data-testid="discrepancy-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="P1">P1 - Urgent</option>
                <option value="P2">P2 - Standard</option>
                <option value="P3">P3 - Minor</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Identified Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                data-testid="discrepancy-date-input"
                value={identifiedDate}
                onChange={(e) => setIdentifiedDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Row: Related Editor & Initial Root Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Related Editor (Handling Attribution)
              </label>
              <select
                data-testid="discrepancy-editor-select"
                value={relatedEditorId}
                onChange={(e) => setRelatedEditorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="">-- None / General Pipeline --</option>
                {editors.map(ed => (
                  <option key={ed.id} value={ed.id}>
                    {ed.display_name} ({ed.department || 'Editor'})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                Editor association does not establish personal fault (RULE-010).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Root Cause (Optional)
              </label>
              <select
                data-testid="discrepancy-root-cause-select"
                value={rootCauseId}
                onChange={(e) => setRootCauseId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-secondary"
              >
                <option value="">-- Triage Later / Undetermined --</option>
                {rootCauses.map(rc => (
                  <option key={rc.id} value={rc.id}>
                    {rc.cause_name} ({rc.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Impact & Evidence Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Impact Description
              </label>
              <input
                type="text"
                data-testid="discrepancy-impact-input"
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                placeholder="e.g. Delays Online First release by 3 days"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Evidence URL / Document Link
              </label>
              <input
                type="text"
                data-testid="discrepancy-evidence-input"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="e.g. https://portal.tandf.co.uk/proofs/124.pdf"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-discrepancy-btn"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-primary-container transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              <span>Register Discrepancy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

