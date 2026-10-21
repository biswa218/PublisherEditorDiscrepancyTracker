import { Router, Request, Response } from 'express';
import { query, get, run } from '../db/database.js';
import { logAuditEvent } from '../services/auditService.js';

export const rootCausesRouter = Router();

// GET all root causes (FR-010, FR-054)
rootCausesRouter.get('/', (req: Request, res: Response) => {
  try {
    const list = query<any>(`SELECT * FROM root_causes WHERE active = 1 ORDER BY category ASC, cause_name ASC`);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST new root cause (Admin)
rootCausesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { cause_code, cause_name, category, description } = req.body;
    if (!cause_code || !cause_name) {
      return res.status(400).json({ error: 'cause_code and cause_name are required' });
    }

    const resDb = run(
      `INSERT INTO root_causes (cause_code, cause_name, category, description) VALUES (?, ?, ?, ?)`,
      [cause_code.trim().toUpperCase(), cause_name.trim(), category?.trim() || 'General', description?.trim() || null]
    );

    const newId = Number(resDb.lastInsertRowid);
    const newCause = get(`SELECT * FROM root_causes WHERE id = ?`, [newId]);

    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('ROOT_CAUSE', newId, actorId, actorName, 'CREATE_ROOT_CAUSE', null, newCause);

    res.status(201).json(newCause);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH root cause (Admin)
rootCausesRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = get(`SELECT * FROM root_causes WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Root cause not found' });
    }

    const { cause_name, category, description, active } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (cause_name !== undefined) {
      updates.push('cause_name = ?');
      params.push(cause_name);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE root_causes SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = get(`SELECT * FROM root_causes WHERE id = ?`, [id]);
    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('ROOT_CAUSE', id, actorId, actorName, 'UPDATE_ROOT_CAUSE', existing, updated);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

