import { run, get, transaction } from '../db/database.js';
import { logAuditEvent } from './auditService.js';
import { getDiscrepancyById } from './discrepancyService.js';

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'NEW': ['TRIAGED', 'ASSIGNED', 'CLOSED'],
  'TRIAGED': ['ASSIGNED', 'IN PROGRESS', 'CLOSED'],
  'ASSIGNED': ['IN PROGRESS', 'TRIAGED'],
  'IN PROGRESS': ['RESOLVED'],
  'RESOLVED': ['VERIFIED', 'CLOSED', 'REOPENED', 'IN PROGRESS'],
  'VERIFIED': ['CLOSED', 'REOPENED', 'IN PROGRESS'],
  'CLOSED': ['REOPENED', 'IN PROGRESS'],
  'REOPENED': ['ASSIGNED', 'IN PROGRESS', 'TRIAGED']
};

export interface TransitionInput {
  discrepancyId: number;
  toStatus: string;
  userId: number;
  userName: string;
  userRole?: string;
  reason?: string;
  resolutionNotes?: string;
  rootCauseId?: number;
}

export function transitionStatus(input: TransitionInput) {
  const discrepancy = get<any>(`SELECT * FROM discrepancies WHERE id = ?`, [input.discrepancyId]);
  if (!discrepancy) {
    throw new Error(`Discrepancy ID ${input.discrepancyId} not found`);
  }

  const currentStatus = discrepancy.status;
  const targetStatus = input.toStatus.toUpperCase();

  // Check valid status
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}`
    );
  }

  // Business Rule RULE-004: Root cause and resolution notes required when resolving
  if (targetStatus === 'RESOLVED') {
    if (!input.resolutionNotes && !discrepancy.resolution_notes) {
      throw new Error('Resolution notes are required to resolve a discrepancy (FR-017, RULE-004)');
    }

    // Check if root cause exists or is provided
    const existingCause = get(`SELECT id FROM discrepancy_root_causes WHERE discrepancy_id = ?`, [input.discrepancyId]);
    if (!existingCause && !input.rootCauseId) {
      throw new Error('A tagged Root Cause is required before resolving the discrepancy (RULE-004)');
    }
  }

  // Verification permission rule (FR-015, US-003)
  if (targetStatus === 'VERIFIED') {
    const privilegedRoles = ['QA Analyst', 'Editorial Manager', 'Administrator'];
    if (input.userRole && !privilegedRoles.includes(input.userRole)) {
      throw new Error(`Only QA Analysts, Editorial Managers, or Administrators may verify resolutions (FR-015)`);
    }
  }

  return transaction(() => {
    // If root cause was provided with resolution, link it
    if (input.rootCauseId) {
      run(`
        INSERT INTO discrepancy_root_causes (discrepancy_id, root_cause_id, investigation_notes, created_by)
        VALUES (?, ?, ?, ?)
      `, [input.discrepancyId, input.rootCauseId, input.reason || 'Tagged at resolution', input.userId]);
    }

    const updates: string[] = ['status = ?', 'updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')'];
    const params: any[] = [targetStatus];

    if (input.resolutionNotes) {
      updates.push('resolution_notes = ?');
      params.push(input.resolutionNotes);
    }

    if (targetStatus === 'VERIFIED') {
      updates.push('verified_by = ?');
      params.push(input.userId);
    }

    if (targetStatus === 'CLOSED') {
      updates.push('closed_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')');
    }

    params.push(input.discrepancyId);

    run(`UPDATE discrepancies SET ${updates.join(', ')} WHERE id = ?`, params);

    // Record status history (RULE-005, RULE-008, RULE-009)
    run(`
      INSERT INTO status_history (discrepancy_id, from_status, to_status, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [input.discrepancyId, currentStatus, targetStatus, input.userId, input.reason || `Status updated to ${targetStatus}`]);

    // Audit event (FR-050..053)
    logAuditEvent(
      'DISCREPANCY',
      input.discrepancyId,
      input.userId,
      input.userName,
      'STATUS_TRANSITION',
      { status: currentStatus },
      { status: targetStatus, reason: input.reason || null }
    );

    return getDiscrepancyById(input.discrepancyId);
  });
}

export interface AssignInput {
  discrepancyId: number;
  assigneeId: number;
  assignedByUserId: number;
  assignedByUserName: string;
  notes?: string;
}

export function assignDiscrepancy(input: AssignInput) {
  const discrepancy = get<any>(`SELECT * FROM discrepancies WHERE id = ?`, [input.discrepancyId]);
  if (!discrepancy) {
    throw new Error(`Discrepancy ID ${input.discrepancyId} not found`);
  }

  const assignee = get<any>(`SELECT id, display_name FROM app_users WHERE id = ? AND active = 1`, [input.assigneeId]);
  if (!assignee) {
    throw new Error(`Assignee user ID ${input.assigneeId} not found or inactive`);
  }

  return transaction(() => {
    const oldAssigneeId = discrepancy.assigned_to;
    const currentStatus = discrepancy.status;

    // Transition to ASSIGNED if currently NEW or TRIAGED
    let newStatus = currentStatus;
    if (currentStatus === 'NEW' || currentStatus === 'TRIAGED') {
      newStatus = 'ASSIGNED';
    }

    run(`
      UPDATE discrepancies 
      SET assigned_to = ?, status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?
    `, [input.assigneeId, newStatus, input.discrepancyId]);

    // Insert assignment history (FR-016, FR-019)
    run(`
      INSERT INTO assignments (discrepancy_id, assigned_by, assigned_to, notes)
      VALUES (?, ?, ?, ?)
    `, [input.discrepancyId, input.assignedByUserId, input.assigneeId, input.notes || 'Discrepancy assigned']);

    if (newStatus !== currentStatus) {
      run(`
        INSERT INTO status_history (discrepancy_id, from_status, to_status, changed_by, reason)
        VALUES (?, ?, ?, ?, ?)
      `, [input.discrepancyId, currentStatus, newStatus, input.assignedByUserId, `Status moved to ASSIGNED upon assignment to ${assignee.display_name}`]);
    }

    logAuditEvent(
      'DISCREPANCY',
      input.discrepancyId,
      input.assignedByUserId,
      input.assignedByUserName,
      'ASSIGN_DISCREPANCY',
      { assigned_to: oldAssigneeId, status: currentStatus },
      { assigned_to: input.assigneeId, assignee_name: assignee.display_name, status: newStatus }
    );

    return getDiscrepancyById(input.discrepancyId);
  });
}

