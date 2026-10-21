import { Router, Request, Response } from 'express';
import { 
  createDiscrepancy, 
  getDiscrepancyById, 
  searchDiscrepancies, 
  DiscrepancyFilterOptions 
} from '../services/discrepancyService.js';
import { transitionStatus, assignDiscrepancy } from '../services/workflowService.js';
import { addReworkEntry, getReworkEntriesForDiscrepancy } from '../services/reworkService.js';
import { logAuditEvent, getAuditEvents } from '../services/auditService.js';
import { run, get } from '../db/database.js';

export const discrepanciesRouter = Router();

// 1. Search & Filter Discrepancies (FR-035..039)
discrepanciesRouter.get('/', (req: Request, res: Response) => {
  try {
    const filters: DiscrepancyFilterOptions = {
      search: req.query.search as string,
      journalId: req.query.journalId ? Number(req.query.journalId) : undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      status: req.query.status as string,
      severity: req.query.severity as string,
      priority: req.query.priority as string,
      editorId: req.query.editorId ? Number(req.query.editorId) : undefined,
      assigneeId: req.query.assigneeId ? Number(req.query.assigneeId) : undefined,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const results = searchDiscrepancies(filters);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to search discrepancies' });
  }
});

// 2. Get Single Discrepancy by ID (FR-014, FR-019)
discrepanciesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = getDiscrepancyById(id);
    if (!item) {
      return res.status(404).json({ error: `Discrepancy ${id} not found` });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create Discrepancy (FR-001..FR-005, RULE-001..003)
discrepanciesRouter.post('/', (req: Request, res: Response) => {
  try {
    const creatorId = req.body.created_by ? Number(req.body.created_by) : 1;
    const creatorUser = get<any>(`SELECT display_name FROM app_users WHERE id = ?`, [creatorId]);
    const creatorName = creatorUser?.display_name || 'System User';

    const created = createDiscrepancy({
      title: req.body.title,
      description: req.body.description,
      journal_id: Number(req.body.journal_id),
      category_id: Number(req.body.category_id),
      sub_category_id: req.body.sub_category_id ? Number(req.body.sub_category_id) : null,
      created_by: creatorId,
      assigned_to: req.body.assigned_to ? Number(req.body.assigned_to) : null,
      related_editor_id: req.body.related_editor_id ? Number(req.body.related_editor_id) : null,
      severity: req.body.severity,
      priority: req.body.priority,
      manuscript_reference: req.body.manuscript_reference,
      identified_date: req.body.identified_date || new Date().toISOString().split('T')[0],
      impact_description: req.body.impact_description,
      evidence_url: req.body.evidence_url,
      root_cause_id: req.body.root_cause_id ? Number(req.body.root_cause_id) : null
    }, creatorName);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Update Permitted Fields (PATCH)
discrepanciesRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = get<any>(`SELECT * FROM discrepancies WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: `Discrepancy ${id} not found` });
    }

    const updates: string[] = ['updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')'];
    const params: any[] = [];

    const allowedFields = ['title', 'description', 'severity', 'priority', 'manuscript_reference', 'impact_description', 'evidence_url'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    params.push(id);
    run(`UPDATE discrepancies SET ${updates.join(', ')} WHERE id = ?`, params);

    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'System User';

    logAuditEvent('DISCREPANCY', id, actorId, actorName, 'UPDATE_DISCREPANCY', existing, req.body);

    const updated = getDiscrepancyById(id);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Workflow Status Transition (FR-014..FR-019, RULE-004..005, RULE-009)
discrepanciesRouter.post('/:id/transitions', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = transitionStatus({
      discrepancyId: id,
      toStatus: req.body.to_status,
      userId: req.body.user_id ? Number(req.body.user_id) : 1,
      userName: req.body.user_name || 'System User',
      userRole: req.body.user_role,
      reason: req.body.reason,
      resolutionNotes: req.body.resolution_notes,
      rootCauseId: req.body.root_cause_id ? Number(req.body.root_cause_id) : undefined
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Assignment / Reassignment (FR-016)
discrepanciesRouter.post('/:id/assignments', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = assignDiscrepancy({
      discrepancyId: id,
      assigneeId: Number(req.body.assignee_id),
      assignedByUserId: req.body.assigned_by ? Number(req.body.assigned_by) : 1,
      assignedByUserName: req.body.assigner_name || 'System User',
      notes: req.body.notes
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 7. Log Rework Entry (FR-020, RULE-006, RULE-007)
discrepanciesRouter.post('/:id/rework', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = addReworkEntry({
      discrepancyId: id,
      performedBy: Number(req.body.performed_by),
      hours: Number(req.body.hours),
      workDate: req.body.work_date || new Date().toISOString().split('T')[0],
      notes: req.body.notes,
      actorId: req.body.actor_id ? Number(req.body.actor_id) : 1,
      actorName: req.body.actor_name || 'System User'
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 8. Tag Root Cause & Investigation Notes (FR-010..012, RULE-003..004)
discrepanciesRouter.post('/:id/root-causes', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const rootCauseId = Number(req.body.root_cause_id);
    const notes = req.body.investigation_notes || req.body.notes || 'Root cause logged';
    const userId = req.body.user_id ? Number(req.body.user_id) : 1;
    const userName = req.body.user_name || 'System User';

    run(`
      INSERT INTO discrepancy_root_causes (discrepancy_id, root_cause_id, investigation_notes, created_by)
      VALUES (?, ?, ?, ?)
    `, [id, rootCauseId, notes, userId]);

    logAuditEvent('DISCREPANCY', id, userId, userName, 'TAG_ROOT_CAUSE', null, { root_cause_id: rootCauseId, notes });

    const updated = getDiscrepancyById(id);
    res.status(201).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 9. Get Audit & Transition History (FR-050..FR-052)
discrepanciesRouter.get('/:id/history', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const auditEvents = getAuditEvents('DISCREPANCY', id);
    const reworkAudit = getAuditEvents('REWORK_ENTRY');
    res.json({
      discrepancyAudit: auditEvents,
      reworkAudit: reworkAudit.filter(a => {
        try {
          const vals = a.new_values ? JSON.parse(a.new_values) : {};
          return vals.discrepancy_id === id;
        } catch {
          return false;
        }
      })
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

