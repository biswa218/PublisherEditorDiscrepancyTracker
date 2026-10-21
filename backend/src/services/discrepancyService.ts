import { run, query, get, transaction } from '../db/database.js';
import { logAuditEvent } from './auditService.js';

export interface CreateDiscrepancyInput {
  title: string;
  description: string;
  journal_id: number;
  category_id: number;
  sub_category_id?: number | null;
  created_by: number;
  assigned_to?: number | null;
  related_editor_id?: number | null;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  manuscript_reference?: string | null;
  identified_date: string;
  impact_description?: string | null;
  evidence_url?: string | null;
  root_cause_id?: number | null;
}

export function generateNextReference(): string {
  const row = get<{ max_id: number }>(`SELECT MAX(id) as max_id FROM discrepancies`);
  const nextNum = (row?.max_id || 0) + 1;
  return `PED-${String(nextNum).padStart(6, '0')}`;
}

export function createDiscrepancy(input: CreateDiscrepancyInput, creatorName: string = 'User') {
  // Validate mandatory fields (FR-003, RULE-001, RULE-002)
  if (!input.title || !input.title.trim()) {
    throw new Error('Title is mandatory');
  }
  if (!input.description || !input.description.trim()) {
    throw new Error('Description is mandatory');
  }
  if (!input.journal_id) {
    throw new Error('Journal selection is mandatory');
  }
  if (!input.category_id) {
    throw new Error('Defect Category selection is mandatory');
  }
  if (!input.identified_date) {
    throw new Error('Identified Date is mandatory');
  }

  // Check valid journal (RULE-002)
  const journal = get(`SELECT id, active FROM journals WHERE id = ?`, [input.journal_id]);
  if (!journal) {
    throw new Error('Selected journal does not exist');
  }

  return transaction(() => {
    const reference = generateNextReference();
    const severity = input.severity || 'MEDIUM';
    const priority = input.priority || 'P2';
    const status = input.assigned_to ? 'ASSIGNED' : 'NEW';

    const insertResult = run(`
      INSERT INTO discrepancies (
        reference_number, title, description, journal_id, category_id, sub_category_id,
        created_by, assigned_to, related_editor_id, status, severity, priority,
        manuscript_reference, identified_date, impact_description, evidence_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reference,
      input.title.trim(),
      input.description.trim(),
      input.journal_id,
      input.category_id,
      input.sub_category_id || null,
      input.created_by,
      input.assigned_to || null,
      input.related_editor_id || null,
      status,
      severity,
      priority,
      input.manuscript_reference?.trim() || null,
      input.identified_date,
      input.impact_description?.trim() || null,
      input.evidence_url?.trim() || null
    ]);

    const newId = Number(insertResult.lastInsertRowid);

    // Initial status history entry
    run(`
      INSERT INTO status_history (discrepancy_id, from_status, to_status, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [newId, 'NEW', status, input.created_by, 'Discrepancy registered']);

    // Assignment history if assigned
    if (input.assigned_to) {
      run(`
        INSERT INTO assignments (discrepancy_id, assigned_by, assigned_to, notes)
        VALUES (?, ?, ?, ?)
      `, [newId, input.created_by, input.assigned_to, 'Initial assignment at registration']);
    }

    // Root cause link if provided initially
    if (input.root_cause_id) {
      run(`
        INSERT INTO discrepancy_root_causes (discrepancy_id, root_cause_id, investigation_notes, created_by)
        VALUES (?, ?, ?, ?)
      `, [newId, input.root_cause_id, 'Initial root cause tagged', input.created_by]);
    }

    // Audit Event (RULE-008)
    logAuditEvent(
      'DISCREPANCY',
      newId,
      input.created_by,
      creatorName,
      'CREATE_DISCREPANCY',
      null,
      { id: newId, reference_number: reference, title: input.title, status, severity, priority }
    );

    return getDiscrepancyById(newId);
  });
}

export function getDiscrepancyById(id: number) {
  const discrepancy = get<any>(`
    SELECT 
      d.*,
      j.journal_code,
      j.journal_name,
      c.category_name,
      sc.category_name as sub_category_name,
      creator.display_name as creator_name,
      creator.role as creator_role,
      assignee.display_name as assignee_name,
      assignee.role as assignee_role,
      editor.display_name as related_editor_name,
      COALESCE((SELECT SUM(hours) FROM rework_entries WHERE discrepancy_id = d.id), 0) as total_rework_hours
    FROM discrepancies d
    JOIN journals j ON d.journal_id = j.id
    JOIN defect_categories c ON d.category_id = c.id
    LEFT JOIN defect_categories sc ON d.sub_category_id = sc.id
    JOIN app_users creator ON d.created_by = creator.id
    LEFT JOIN app_users assignee ON d.assigned_to = assignee.id
    LEFT JOIN app_users editor ON d.related_editor_id = editor.id
    WHERE d.id = ?
  `, [id]);

  if (!discrepancy) {
    return null;
  }

  // Fetch root causes
  const rootCauses = query<any>(`
    SELECT drc.*, rc.cause_code, rc.cause_name, rc.category as root_cause_category, u.display_name as logged_by_name
    FROM discrepancy_root_causes drc
    JOIN root_causes rc ON drc.root_cause_id = rc.id
    JOIN app_users u ON drc.created_by = u.id
    WHERE drc.discrepancy_id = ?
    ORDER BY drc.id ASC
  `, [id]);

  // Fetch rework entries
  const reworkEntries = query<any>(`
    SELECT r.*, u.display_name as performer_name, u.role as performer_role
    FROM rework_entries r
    JOIN app_users u ON r.performed_by = u.id
    WHERE r.discrepancy_id = ?
    ORDER BY r.work_date DESC, r.id DESC
  `, [id]);

  // Fetch status history
  const statusHistory = query<any>(`
    SELECT sh.*, u.display_name as changer_name, u.role as changer_role
    FROM status_history sh
    JOIN app_users u ON sh.changed_by = u.id
    WHERE sh.discrepancy_id = ?
    ORDER BY sh.id DESC
  `, [id]);

  // Fetch assignment history
  const assignmentHistory = query<any>(`
    SELECT a.*, by_u.display_name as assigner_name, to_u.display_name as assignee_name
    FROM assignments a
    JOIN app_users by_u ON a.assigned_by = by_u.id
    JOIN app_users to_u ON a.assigned_to = to_u.id
    WHERE a.discrepancy_id = ?
    ORDER BY a.id DESC
  `, [id]);

  // Fetch attachments
  const attachments = query<any>(`
    SELECT att.*, u.display_name as uploader_name
    FROM attachments att
    JOIN app_users u ON att.uploaded_by = u.id
    WHERE att.discrepancy_id = ?
    ORDER BY att.id DESC
  `, [id]);

  return {
    ...discrepancy,
    rootCauses,
    reworkEntries,
    statusHistory,
    assignmentHistory,
    attachments
  };
}

export interface DiscrepancyFilterOptions {
  search?: string;
  journalId?: number;
  categoryId?: number;
  status?: string;
  severity?: string;
  priority?: string;
  editorId?: number;
  assigneeId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export function searchDiscrepancies(options: DiscrepancyFilterOptions) {
  const whereClauses: string[] = ['1=1'];
  const params: any[] = [];

  if (options.search && options.search.trim()) {
    const s = `%${options.search.trim()}%`;
    whereClauses.push(`(
      d.title LIKE ? OR 
      d.description LIKE ? OR 
      d.reference_number LIKE ? OR 
      d.manuscript_reference LIKE ? OR 
      j.journal_name LIKE ? OR 
      j.journal_code LIKE ?
    )`);
    params.push(s, s, s, s, s, s);
  }

  if (options.journalId) {
    whereClauses.push('d.journal_id = ?');
    params.push(options.journalId);
  }

  if (options.categoryId) {
    whereClauses.push('d.category_id = ?');
    params.push(options.categoryId);
  }

  if (options.status && options.status !== 'ALL') {
    whereClauses.push('d.status = ?');
    params.push(options.status);
  }

  if (options.severity && options.severity !== 'ALL') {
    whereClauses.push('d.severity = ?');
    params.push(options.severity);
  }

  if (options.priority && options.priority !== 'ALL') {
    whereClauses.push('d.priority = ?');
    params.push(options.priority);
  }

  if (options.editorId) {
    whereClauses.push('d.related_editor_id = ?');
    params.push(options.editorId);
  }

  if (options.assigneeId) {
    whereClauses.push('d.assigned_to = ?');
    params.push(options.assigneeId);
  }

  if (options.dateFrom) {
    whereClauses.push('d.identified_date >= ?');
    params.push(options.dateFrom);
  }

  if (options.dateTo) {
    whereClauses.push('d.identified_date <= ?');
    params.push(options.dateTo);
  }

  const whereSql = whereClauses.join(' AND ');

  // Count total matching
  const countRow = get<{ total: number }>(`
    SELECT COUNT(*) as total
    FROM discrepancies d
    JOIN journals j ON d.journal_id = j.id
    WHERE ${whereSql}
  `, params);

  const total = countRow?.total || 0;

  // Sorting
  const allowedSortCols: Record<string, string> = {
    id: 'd.id',
    created_at: 'd.created_at',
    identified_date: 'd.identified_date',
    reference_number: 'd.reference_number',
    severity: 'd.severity',
    priority: 'd.priority',
    status: 'd.status',
    title: 'd.title',
    total_rework_hours: 'total_rework_hours'
  };

  const sortCol = (options.sortBy && allowedSortCols[options.sortBy]) || 'd.id';
  const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';

  // Pagination
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const offset = (page - 1) * limit;

  const items = query<any>(`
    SELECT 
      d.id,
      d.reference_number,
      d.title,
      d.description,
      d.status,
      d.severity,
      d.priority,
      d.manuscript_reference,
      d.identified_date,
      d.created_at,
      d.updated_at,
      j.id as journal_id,
      j.journal_code,
      j.journal_name,
      c.id as category_id,
      c.category_name,
      sc.category_name as sub_category_name,
      creator.display_name as creator_name,
      assignee.display_name as assignee_name,
      editor.display_name as related_editor_name,
      COALESCE((SELECT SUM(hours) FROM rework_entries WHERE discrepancy_id = d.id), 0) as total_rework_hours,
      (SELECT rc.cause_name FROM discrepancy_root_causes drc JOIN root_causes rc ON drc.root_cause_id = rc.id WHERE drc.discrepancy_id = d.id ORDER BY drc.id DESC LIMIT 1) as root_cause_name
    FROM discrepancies d
    JOIN journals j ON d.journal_id = j.id
    JOIN defect_categories c ON d.category_id = c.id
    LEFT JOIN defect_categories sc ON d.sub_category_id = sc.id
    JOIN app_users creator ON d.created_by = creator.id
    LEFT JOIN app_users assignee ON d.assigned_to = assignee.id
    LEFT JOIN app_users editor ON d.related_editor_id = editor.id
    WHERE ${whereSql}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

