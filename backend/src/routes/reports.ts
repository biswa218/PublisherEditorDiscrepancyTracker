import { Router, Request, Response } from 'express';
import { searchDiscrepancies, DiscrepancyFilterOptions } from '../services/discrepancyService.js';
import { logAuditEvent } from '../services/auditService.js';

export const reportsRouter = Router();

// GET or POST /reports/export (FR-041, FR-042)
reportsRouter.all('/export', (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;

    const filters: DiscrepancyFilterOptions = {
      search: params.search as string,
      journalId: params.journalId ? Number(params.journalId) : undefined,
      categoryId: params.categoryId ? Number(params.categoryId) : undefined,
      status: params.status as string,
      severity: params.severity as string,
      priority: params.priority as string,
      editorId: params.editorId ? Number(params.editorId) : undefined,
      dateFrom: params.dateFrom as string,
      dateTo: params.dateTo as string,
      limit: 1000 // Export up to 1000 matching records
    };

    const results = searchDiscrepancies(filters);
    const format = (params.format as string) || 'csv';

    // Log export event for audit compliance (NFR-015)
    const actorId = params.actor_id ? Number(params.actor_id) : 1;
    const actorName = params.actor_name || 'Reporting User';
    logAuditEvent('EXPORT', 0, actorId, actorName, 'EXPORT_DISCREPANCIES', null, { format, record_count: results.items.length, filters });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="discrepancies-${new Date().toISOString().split('T')[0]}.json"`);
      return res.json(results.items);
    }

    // CSV format
    const headers = [
      'Discrepancy ID',
      'Title',
      'Status',
      'Severity',
      'Priority',
      'Journal Code',
      'Journal Name',
      'Category',
      'Subcategory',
      'Manuscript Reference',
      'Identified Date',
      'Total Rework Hours',
      'Root Cause',
      'Related Editor',
      'Assignee',
      'Reporter'
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = [
      headers.join(','),
      ...results.items.map(item => [
        escapeCsv(item.reference_number),
        escapeCsv(item.title),
        escapeCsv(item.status),
        escapeCsv(item.severity),
        escapeCsv(item.priority),
        escapeCsv(item.journal_code),
        escapeCsv(item.journal_name),
        escapeCsv(item.category_name),
        escapeCsv(item.sub_category_name || ''),
        escapeCsv(item.manuscript_reference || ''),
        escapeCsv(item.identified_date),
        escapeCsv(item.total_rework_hours),
        escapeCsv(item.root_cause_name || ''),
        escapeCsv(item.related_editor_name || ''),
        escapeCsv(item.assignee_name || ''),
        escapeCsv(item.creator_name || '')
      ].join(','))
    ];

    const csvContent = csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="discrepancies-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

