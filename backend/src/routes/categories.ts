import { Router, Request, Response } from 'express';
import { query, get, run } from '../db/database.js';
import { logAuditEvent } from '../services/auditService.js';

export const categoriesRouter = Router();

// GET all categories & subcategories (FR-006, FR-007)
categoriesRouter.get('/', (req: Request, res: Response) => {
  try {
    const parentCategories = query<any>(`
      SELECT * FROM defect_categories WHERE parent_id IS NULL AND active = 1 ORDER BY category_name ASC
    `);

    const subCategories = query<any>(`
      SELECT * FROM defect_categories WHERE parent_id IS NOT NULL AND active = 1 ORDER BY category_name ASC
    `);

    // Hierarchy map
    const result = parentCategories.map(parent => ({
      ...parent,
      subcategories: subCategories.filter(sub => sub.parent_id === parent.id)
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST new category / subcategory (Admin - FR-007, FR-054)
categoriesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { category_code, category_name, parent_id, description } = req.body;
    if (!category_code || !category_name) {
      return res.status(400).json({ error: 'category_code and category_name are required' });
    }

    const resDb = run(
      `INSERT INTO defect_categories (category_code, category_name, parent_id, description) VALUES (?, ?, ?, ?)`,
      [category_code.trim().toUpperCase(), category_name.trim(), parent_id ? Number(parent_id) : null, description?.trim() || null]
    );

    const newId = Number(resDb.lastInsertRowid);
    const newCat = get(`SELECT * FROM defect_categories WHERE id = ?`, [newId]);

    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('DEFECT_CATEGORY', newId, actorId, actorName, 'CREATE_CATEGORY', null, newCat);

    res.status(201).json(newCat);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH category (Admin)
categoriesRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = get(`SELECT * FROM defect_categories WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { category_name, description, active } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (category_name !== undefined) {
      updates.push('category_name = ?');
      params.push(category_name);
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
      run(`UPDATE defect_categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = get(`SELECT * FROM defect_categories WHERE id = ?`, [id]);
    const actorId = req.body.actor_id ? Number(req.body.actor_id) : 1;
    const actorName = req.body.actor_name || 'Administrator';
    logAuditEvent('DEFECT_CATEGORY', id, actorId, actorName, 'UPDATE_CATEGORY', existing, updated);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

