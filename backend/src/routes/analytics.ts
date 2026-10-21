import { Router, Request, Response } from 'express';
import { 
  getExecutiveSummaryKPIs, 
  getReworkByJournal, 
  getReworkByEditor, 
  getReworkByCategory, 
  getRootCauseDistribution, 
  getAnalyticsTrends 
} from '../services/analyticsService.js';

export const analyticsRouter = Router();

analyticsRouter.get('/summary', (req: Request, res: Response) => {
  try {
    const data = getExecutiveSummaryKPIs();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

analyticsRouter.get('/by-journal', (req: Request, res: Response) => {
  try {
    const data = getReworkByJournal();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

analyticsRouter.get('/by-editor', (req: Request, res: Response) => {
  try {
    const data = getReworkByEditor();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

analyticsRouter.get('/by-category', (req: Request, res: Response) => {
  try {
    const data = getReworkByCategory();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

analyticsRouter.get('/by-root-cause', (req: Request, res: Response) => {
  try {
    const data = getRootCauseDistribution();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

analyticsRouter.get('/trends', (req: Request, res: Response) => {
  try {
    const data = getAnalyticsTrends();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

