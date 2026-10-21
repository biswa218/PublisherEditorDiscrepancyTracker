import React, { useEffect, useState } from 'react';
import { Discrepancy, AppUser, RootCause, DiscrepancyStatus } from '../types';
import { api } from '../services/api';

interface DiscrepancyDetailProps {
  discrepancyId: number;
  onBack: () => void;
  currentUser: AppUser;
  allUsers: AppUser[];
  rootCauses: RootCause[];
}

const WORKFLOW_STEPS: DiscrepancyStatus[] = [
  'NEW',
  'TRIAGED',
  'ASSIGNED',
  'IN PROGRESS',
  'RESOLVED',
  'VERIFIED',
  'CLOSED'
];

export const DiscrepancyDetail: React.FC<DiscrepancyDetailProps> = ({
  discrepancyId,
  onBack,
  currentUser,
  allUsers,
  rootCauses
}) => {
  const [item, setItem] = useState<Discrepancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Forms
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  const [assignNotes, setAssignNotes] = useState('');

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveRootCauseId, setResolveRootCauseId] = useState<number | ''>('');

  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkHours, setReworkHours] = useState('');
  const [reworkPerformerId, setReworkPerformerId] = useState<number>(currentUser.id);
  const [reworkDate, setReworkDate] = useState(new Date().toISOString().split('T')[0]);
  const [reworkNotes, setReworkNotes] = useState('');

  const [showRootCauseModal, setShowRootCauseModal] = useState(false);
  const [tagCauseId, setTagCauseId] = useState<number | ''>('');
  const [tagCauseNotes, setTagCauseNotes] = useState('');

  const loadDiscrepancy = async () => {
    try {
      setLoading(true);
      const res = await api.getDiscrepancy(discrepancyId);
      setItem(res);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load discrepancy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscrepancy();
  }, [discrepancyId]);

  if (loading || !item) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span className="material-symbols-outlined animate-spin text-2xl text-secondary">
            progress_activity
          </span>
          <span>Loading discrepancy details...</span>
        </div>
      </div>
    );
  }

  // Handle Workflow Transitions
  const handleTransition = async (toStatus: string, reason?: string) => {
    setErrorMessage(null);
    try {
      const updated = await api.transitionStatus(item.id, {
        to_status: toStatus,
        user_id: currentUser.id,
        user_name: currentUser.display_name,
        user_role: currentUser.role,
        reason: reason || `Transitioned to ${toStatus}`
      });
      setItem(updated);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Submit Assignment
  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return;
    try {
      const updated = await api.assignDiscrepancy(item.id, {
        assignee_id: Number(assigneeId),
        assigned_by: currentUser.id,
        assigner_name: currentUser.display_name,
        notes: assignNotes
      });
      setItem(updated);
      setShowAssignModal(false);
      setAssignNotes('');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Submit Resolution
  const submitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveNotes.trim()) {
      setErrorMessage('Resolution notes are mandatory to resolve (RULE-004)');
      return;
    }
    try {
      const updated = await api.transitionStatus(item.id, {
        to_status: 'RESOLVED',
        user_id: currentUser.id,
        user_name: currentUser.display_name,
        user_role: currentUser.role,
        resolution_notes: resolveNotes.trim(),
        root_cause_id: resolveRootCauseId ? Number(resolveRootCauseId) : undefined,
        reason: 'Resolution verified and implemented'
      });
      setItem(updated);
      setShowResolveModal(false);
      setResolveNotes('');
      setResolveRootCauseId('');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Submit Rework Hours
  const submitRework = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const hours = Number(reworkHours);
    if (isNaN(hours) || hours <= 0) {
      setErrorMessage('Rework hours must be greater than zero and cannot be negative (RULE-006)');
      return;
    }
    try {
      const performerId = reworkPerformerId || allUsers[0]?.id || currentUser.id || 1;
      const updated = await api.logRework(item.id, {
        performed_by: performerId,
        hours,
        work_date: reworkDate || new Date().toISOString().split('T')[0],
        notes: reworkNotes,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name
      });
      setItem(updated);
      setShowReworkModal(false);
      setReworkHours('');
      setReworkNotes('');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Submit Tag Root Cause
  const submitRootCause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCauseId) return;
    try {
      const updated = await api.tagRootCause(item.id, {
        root_cause_id: Number(tagCauseId),
        notes: tagCauseNotes,
        user_id: currentUser.id,
        user_name: currentUser.display_name
      });
      setItem(updated);
      setShowRootCauseModal(false);
      setTagCauseNotes('');
      setTagCauseId('');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'REOPENED') return 3; // In Progress stage
    return WORKFLOW_STEPS.indexOf(status as DiscrepancyStatus);
  };

  const currentStepIdx = getStepIndex(item.status);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="discrepancy-detail-view">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-ledger-btn"
          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Discrepancy Ledger</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Identified: {item.identified_date}</span>
          <span>·</span>
          <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {errorMessage && (
        <div 
          data-testid="detail-error-banner"
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-red-600 text-base">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span 
                data-testid="detail-reference-badge"
                className="text-sm font-mono font-bold bg-primary text-white px-2.5 py-1 rounded"
              >
                {item.reference_number}
              </span>
              <span 
                data-testid="detail-status-badge"
                className="text-xs font-bold px-2.5 py-0.5 rounded uppercase border bg-slate-100 text-slate-800"
              >
                {item.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                {item.severity}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                {item.priority}
              </span>
            </div>
            <h1 
              data-testid="detail-title"
              className="text-lg font-bold text-slate-900 font-display mt-2"
            >
              {item.title}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              {item.description}
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* NEW -> TRIAGED */}
            {item.status === 'NEW' && (
              <button
                type="button"
                data-testid="action-triage-btn"
                onClick={() => handleTransition('TRIAGED', 'Triage completed')}
                className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Triage Issue
              </button>
            )}

            {/* ASSIGN Action (available in NEW, TRIAGED, ASSIGNED, IN PROGRESS, REOPENED) */}
            {['NEW', 'TRIAGED', 'ASSIGNED', 'IN PROGRESS', 'REOPENED'].includes(item.status) && (
              <button
                type="button"
                data-testid="action-assign-btn"
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1.5 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
              >
                {item.assigned_to ? 'Reassign' : 'Assign Investigator'}
              </button>
            )}

            {/* ASSIGNED -> IN PROGRESS */}
            {(item.status === 'ASSIGNED' || item.status === 'TRIAGED' || item.status === 'REOPENED') && (
              <button
                type="button"
                data-testid="action-start-investigation-btn"
                onClick={() => handleTransition('IN PROGRESS', 'Investigation commenced')}
                className="px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                Start Investigation
              </button>
            )}

            {/* IN PROGRESS -> RESOLVED */}
            {item.status === 'IN PROGRESS' && (
              <button
                type="button"
                data-testid="action-resolve-btn"
                onClick={() => setShowResolveModal(true)}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Resolve Defect
              </button>
            )}

            {/* RESOLVED -> VERIFIED */}
            {item.status === 'RESOLVED' && (
              <button
                type="button"
                data-testid="action-verify-btn"
                onClick={() => handleTransition('VERIFIED', 'Verified by QA / Editorial Manager')}
                className="px-3 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold hover:bg-sky-700 transition-colors shadow-sm"
              >
                Verify Resolution
              </button>
            )}

            {/* VERIFIED or RESOLVED -> CLOSED */}
            {(item.status === 'VERIFIED' || item.status === 'RESOLVED') && (
              <button
                type="button"
                data-testid="action-close-btn"
                onClick={() => handleTransition('CLOSED', 'Defect officially closed')}
                className="px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close Discrepancy
              </button>
            )}

            {/* CLOSED or RESOLVED -> REOPEN */}
            {(item.status === 'CLOSED' || item.status === 'RESOLVED' || item.status === 'VERIFIED') && (
              <button
                type="button"
                data-testid="action-reopen-btn"
                onClick={() => handleTransition('REOPENED', 'Defect recurred or resolution incomplete')}
                className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Reopen (FR-018)
              </button>
            )}
          </div>
        </div>

        {/* Workflow Lifecycle Step Tracker */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Workflow Lifecycle Stage (FR-014)
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCurrent = step === item.status;
              const isPassed = currentStepIdx > idx;
              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div 
                    className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                      isCurrent 
                        ? 'bg-secondary ring-2 ring-secondary/30' 
                        : isPassed 
                        ? 'bg-emerald-500' 
                        : 'bg-slate-200'
                    }`}
                  />
                  <span 
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isCurrent ? 'text-secondary font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details, Root Cause, Rework Entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-primary font-display border-b border-slate-100 pb-2">
              Incident Metadata &amp; Journal Associations
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Journal</span>
                <span className="font-semibold text-slate-800">[{item.journal_code}] {item.journal_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Manuscript Ref</span>
                <span className="font-mono text-slate-800">{item.manuscript_reference || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Defect Category</span>
                <span className="font-semibold text-slate-800">{item.category_name}</span>
                {item.sub_category_name && <span className="text-slate-500 block text-[11px]">{item.sub_category_name}</span>}
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Related Editor</span>
                <span className="text-slate-800">{item.related_editor_name || 'Unspecified'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Reported By</span>
                <span className="text-slate-800">{item.creator_name} ({item.creator_role})</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Assigned Investigator</span>
                <span className="text-slate-800 font-medium">{item.assignee_name || 'Unassigned'}</span>
              </div>
            </div>

            {item.impact_description && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Impact Assessment</span>
                <p className="text-slate-700 mt-0.5">{item.impact_description}</p>
              </div>
            )}

            {item.resolution_notes && (
              <div className="pt-2 border-t border-slate-100 text-xs bg-emerald-50/50 p-3 rounded border border-emerald-100">
                <span className="text-emerald-800 font-semibold uppercase text-[10px] block">Resolution Summary</span>
                <p className="text-slate-800 mt-0.5">{item.resolution_notes}</p>
              </div>
            )}
          </div>

          {/* Root Cause Investigation Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-sm font-bold text-primary font-display">
                  Root Cause Investigation (FR-010..013)
                </h2>
                <p className="text-xs text-slate-500">
                  Tag root causes and record investigative findings to eliminate recurrent defects.
                </p>
              </div>
              <button
                type="button"
                data-testid="tag-root-cause-btn"
                onClick={() => setShowRootCauseModal(true)}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-secondary">psychology</span>
                <span>Tag Root Cause</span>
              </button>
            </div>

            {item.rootCauses && item.rootCauses.length > 0 ? (
              <div className="space-y-3">
                {item.rootCauses.map((rc) => (
                  <div key={rc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {rc.cause_name}
                        </span>
                        <span className="text-slate-500 text-[11px]">({rc.root_cause_category})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(rc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rc.investigation_notes && (
                      <p className="text-slate-700 mt-1">{rc.investigation_notes}</p>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1">
                      Logged by: <strong className="text-slate-600">{rc.logged_by_name}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No root cause has been tagged yet. Root cause is required before resolving (RULE-004).
              </div>
            )}
          </div>

          {/* Rework Effort Tracking Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-primary font-display">
                    Rework Effort Tracking
                  </h2>
                  <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    FR-020, RULE-006
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Total correction effort aggregated across all contributors: SUM(hours)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Rework</span>
                  <span 
                    data-testid="detail-total-rework"
                    className="text-base font-bold font-mono text-primary"
                  >
                    {item.total_rework_hours} hrs
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="log-rework-btn"
                  onClick={() => setShowReworkModal(true)}
                  className="px-3 py-1.5 bg-secondary text-white hover:bg-secondary/90 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">more_time</span>
                  <span>Log Rework Effort</span>
                </button>
              </div>
            </div>

            {item.reworkEntries && item.reworkEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" data-testid="rework-entries-table">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Contributor</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2 text-right">Hours</th>
                      <th className="px-3 py-2">Correction Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {item.reworkEntries.map((rw) => (
                      <tr key={rw.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">
                          {rw.performer_name}
                          <span className="text-[10px] text-slate-400 block">{rw.performer_role}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {rw.work_date}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          {rw.hours} hrs
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {rw.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No rework entries recorded yet. Click &quot;Log Rework Effort&quot; to register hours.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workflow History & Audit Trail */}
        <div className="space-y-6">
          {/* Status History Timeline */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-primary font-display border-b border-slate-100 pb-2">
              Status Transition History (FR-019)
            </h2>
            <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
              {item.statusHistory?.map((sh) => (
                <div key={sh.id} className="border-l-2 border-secondary pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-primary font-mono text-[11px]">
                      {sh.from_status} → {sh.to_status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(sh.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{sh.reason || 'Status updated'}</p>
                  <span className="text-[10px] text-slate-400 block">By: {sh.changer_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-primary font-display border-b border-slate-100 pb-2">
              Assignment Log (FR-016)
            </h2>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {item.assignmentHistory && item.assignmentHistory.length > 0 ? (
                item.assignmentHistory.map((asg) => (
                  <div key={asg.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">Assigned to: {asg.assignee_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(asg.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                    {asg.notes && <p className="text-[11px] text-slate-600">{asg.notes}</p>}
                    <span className="text-[10px] text-slate-400 block">By: {asg.assigner_name}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic">No prior assignment history.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Discrepancy */}
      {showAssignModal && (
        <div data-testid="assign-modal" role="dialog" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Assign Discrepancy Investigator</h3>
            <form onSubmit={submitAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Assignee</label>
                <select
                  data-testid="assignee-select"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                  required
                >
                  <option value="">-- Choose Investigator --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name} ({u.role} - {u.department || 'Operations'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assignment Instructions</label>
                <textarea
                  rows={2}
                  data-testid="assign-notes-input"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Please audit MathML alignment against author proof."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-assignment-btn"
                  className="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolve Defect */}
      {showResolveModal && (
        <div data-testid="resolve-modal" role="dialog" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Resolve Discrepancy (RULE-004)</h3>
            <p className="text-xs text-slate-500">
              Provide verifiable resolution notes. A tagged root cause is mandatory before marking resolved.
            </p>
            <form onSubmit={submitResolve} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  data-testid="resolve-notes-input"
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Detail the corrections executed, files regenerated, or author queries addressed."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Root Cause Tag
                </label>
                <select
                  data-testid="resolve-root-cause-select"
                  value={resolveRootCauseId}
                  onChange={(e) => setResolveRootCauseId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                >
                  <option value="">-- {item.rootCauses && item.rootCauses.length > 0 ? 'Keep existing tagged root cause' : 'Select Root Cause (Required)'} --</option>
                  {rootCauses.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.cause_name} ({rc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-resolve-btn"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Rework Effort */}
      {showReworkModal && (
        <div data-testid="rework-modal" role="dialog" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Log Rework Effort (RULE-006)</h3>
            <form onSubmit={submitRework} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contributor</label>
                <select
                  data-testid="rework-performer-select"
                  value={reworkPerformerId}
                  onChange={(e) => setReworkPerformerId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.display_name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Hours Spent <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    data-testid="rework-hours-input"
                    value={reworkHours}
                    onChange={(e) => setReworkHours(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                    required
                  />
                  <span className="text-[10px] text-slate-500 italic">Non-negative (RULE-006)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Work Date</label>
                  <input
                    type="date"
                    data-testid="rework-date-input"
                    value={reworkDate}
                    onChange={(e) => setReworkDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Task / Work Notes</label>
                <textarea
                  rows={2}
                  data-testid="rework-notes-input"
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  placeholder="e.g. Replaced faulty figure vectors and regenerated galley XML."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReworkModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRework}
                  data-testid="submit-rework-btn"
                  className="px-4 py-1.5 bg-secondary text-white rounded text-xs font-semibold hover:bg-secondary/90"
                >
                  Record Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Tag Root Cause */}
      {showRootCauseModal && (
        <div data-testid="root-cause-modal" role="dialog" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Tag Root Cause Investigation (FR-010)</h3>
            <form onSubmit={submitRootCause} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Root Cause Category &amp; Classification <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="tag-cause-select"
                  value={tagCauseId}
                  onChange={(e) => setTagCauseId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                  required
                >
                  <option value="">-- Select Root Cause --</option>
                  {rootCauses.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.cause_name} ({rc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Investigation Notes</label>
                <textarea
                  rows={3}
                  data-testid="tag-cause-notes-input"
                  value={tagCauseNotes}
                  onChange={(e) => setTagCauseNotes(e.target.value)}
                  placeholder="Record findings, telemetry checks, or training discrepancies uncovered during investigation."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRootCauseModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-tag-cause-btn"
                  className="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container"
                >
                  Save Root Cause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
