import { Router, Request, Response } from 'express';
import { query, get, run } from '../db/database.js';
import { logAuditEvent } from '../services/auditService.js';

export const journalsRouter = Router();

// GET all journals (active or all)
journalsRouter.get('/', (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const sql = includeInactive 
      ? `SELECT * FROM journals ORDER BY journal_name ASC`
      : `SELECT * FROM journals WHERE active = 1 ORDER BY journal_name ASC`;
    const journals = query(sql);
    res.json(journals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST new journal (Admin)
journalsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { journal_code, journal_name, issn, discipline } = req.body;
    if (!journal_code || !journal_name) {
      return res.status(400).json({ error: 'journal_code and journal_name are required' });
    }

    const resDb = run(
      `INSERT INTO journals (journal_code, journal_name, issn, discipline) VALUES (?, ?, ?, ?)`,
      [journal_code.trim().toUpperCase(), journal_name.trim(), issn?.trim() || null, discipline?.trim() || null]
    );

    const newId = Number(resDb.lastInsertRowid);
    const newJournal = get(`SELECT * FROM journals WHERE id = ?`, [newId]);

    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('JOURNAL', newId, actorId, actorName, 'CREATE_JOURNAL', null, newJournal);

    res.status(201).json(newJournal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH journal
journalsRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = get(`SELECT * FROM journals WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    const { journal_name, issn, discipline, active } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (journal_name !== undefined) {
      updates.push('journal_name = ?');
      params.push(journal_name);
    }
    if (issn !== undefined) {
      updates.push('issn = ?');
      params.push(issn);
    }
    if (discipline !== undefined) {
      updates.push('discipline = ?');
      params.push(discipline);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE journals SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = get(`SELECT * FROM journals WHERE id = ?`, [id]);
    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('JOURNAL', id, actorId, actorName, 'UPDATE_JOURNAL', existing, updated);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

