import { Router, Request, Response } from 'express';
import { query, run, get } from '../db/database.js';
import { logAuditEvent } from '../services/auditService.js';

export const usersRouter = Router();

// GET all users
usersRouter.get('/', (req: Request, res: Response) => {
  try {
    const role = req.query.role as string;
    let sql = `SELECT id, external_user_id, display_name, email, role, department, active FROM app_users WHERE active = 1`;
    const params: any[] = [];
    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }
    sql += ` ORDER BY display_name ASC`;
    const users = query(sql, params);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET editors with journal associations
usersRouter.get('/editors', (req: Request, res: Response) => {
  try {
    const editors = query<any>(`
      SELECT 
        u.id, 
        u.display_name, 
        u.email, 
        u.department,
        ej.id as association_id,
        ej.role_title,
        ej.start_date,
        j.id as journal_id,
        j.journal_code,
        j.journal_name
      FROM app_users u
      LEFT JOIN editor_journals ej ON ej.editor_id = u.id AND ej.active = 1
      LEFT JOIN journals j ON ej.journal_id = j.id
      WHERE u.role = 'Editor' AND u.active = 1
      ORDER BY u.display_name ASC, j.journal_name ASC
    `);

    // Group by editor
    const grouped = new Map<number, any>();
    for (const row of editors) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          display_name: row.display_name,
          email: row.email,
          department: row.department,
          journals: []
        });
      }
      if (row.journal_id) {
        grouped.get(row.id).journals.push({
          journal_id: row.journal_id,
          journal_code: row.journal_code,
          journal_name: row.journal_name,
          role_title: row.role_title,
          start_date: row.start_date
        });
      }
    }

    res.json(Array.from(grouped.values()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST associate editor with journal (FR-057)
usersRouter.post('/editor-journals', (req: Request, res: Response) => {
  try {
    const { editor_id, journal_id, role_title, start_date } = req.body;
    if (!editor_id || !journal_id) {
      return res.status(400).json({ error: 'editor_id and journal_id are required' });
    }

    run(`
      INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(editor_id, journal_id) DO UPDATE SET active = 1, role_title = excluded.role_title
    `, [Number(editor_id), Number(journal_id), role_title || 'Editor', start_date || new Date().toISOString().split('T')[0]]);

    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('EDITOR_JOURNAL', Number(editor_id), actorId, actorName, 'ASSOCIATE_EDITOR_JOURNAL', null, { editor_id, journal_id, role_title });

    res.status(201).json({ success: true, message: 'Editor associated with journal successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

