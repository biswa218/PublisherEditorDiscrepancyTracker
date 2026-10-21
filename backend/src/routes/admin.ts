import { Router, Request, Response } from 'express';
import { getAuditEvents } from '../services/auditService.js';
import { seedData } from '../db/seed.js';

export const adminRouter = Router();

// GET audit trail events (FR-052)
adminRouter.get('/audit', (req: Request, res: Response) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId ? Number(req.query.entityId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 200;

    const events = getAuditEvents(entityType, entityId, limit);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST reset and re-seed database
adminRouter.post('/reset-seed', (req: Request, res: Response) => {
  try {
    seedData();
    res.json({ success: true, message: 'Database reset and re-seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

