import { run, query, get, transaction } from '../db/database.js';
import { logAuditEvent } from './auditService.js';
import { getDiscrepancyById } from './discrepancyService.js';

export interface AddReworkInput {
  discrepancyId: number;
  performedBy: number;
  hours: number;
  workDate: string;
  notes?: string;
  actorId: number;
  actorName: string;
}

export function addReworkEntry(input: AddReworkInput) {
  // Validate non-negative hours (RULE-006)
  const numericHours = Number(input.hours);
  if (isNaN(numericHours) || numericHours < 0) {
    throw new Error('Rework hours cannot be negative (RULE-006)');
  }
  if (numericHours === 0) {
    throw new Error('Rework hours must be greater than zero');
  }

  if (!input.workDate) {
    throw new Error('Work date is required (FR-020)');
  }

  const discrepancy = get(`SELECT id, reference_number FROM discrepancies WHERE id = ?`, [input.discrepancyId]);
  if (!discrepancy) {
    throw new Error(`Discrepancy ID ${input.discrepancyId} not found`);
  }

  const performer = get<any>(`SELECT id, display_name FROM app_users WHERE id = ?`, [input.performedBy]);
  if (!performer) {
    throw new Error(`Performer user ID ${input.performedBy} not found`);
  }

  return transaction(() => {
    const res = run(`
      INSERT INTO rework_entries (discrepancy_id, performed_by, hours, work_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [input.discrepancyId, input.performedBy, numericHours, input.workDate, input.notes?.trim() || null]);

    const entryId = Number(res.lastInsertRowid);

    // Update timestamp on discrepancy
    run(`UPDATE discrepancies SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`, [input.discrepancyId]);

    // Log audit event
    logAuditEvent(
      'REWORK_ENTRY',
      entryId,
      input.actorId,
      input.actorName,
      'LOG_REWORK_EFFORT',
      null,
      {
        discrepancy_id: input.discrepancyId,
        performed_by: input.performedBy,
        performer_name: performer.display_name,
        hours: numericHours,
        work_date: input.workDate,
        notes: input.notes
      }
    );

    return getDiscrepancyById(input.discrepancyId);
  });
}

export function getReworkEntriesForDiscrepancy(discrepancyId: number) {
  return query(`
    SELECT r.*, u.display_name as performer_name, u.role as performer_role
    FROM rework_entries r
    JOIN app_users u ON r.performed_by = u.id
    WHERE r.discrepancy_id = ?
    ORDER BY r.work_date DESC, r.id DESC
  `, [discrepancyId]);
}

