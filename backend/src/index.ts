import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getDb } from './db/database.js';
import { discrepanciesRouter } from './routes/discrepancies.js';
import { analyticsRouter } from './routes/analytics.js';
import { journalsRouter } from './routes/journals.js';
import { categoriesRouter } from './routes/categories.js';
import { rootCausesRouter } from './routes/rootCauses.js';
import { usersRouter } from './routes/users.js';
import { reportsRouter } from './routes/reports.js';
import { adminRouter } from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory for evidence attachments
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Publisher-Editor Discrepancy Tracker API', timestamp: new Date().toISOString() });
});

// Mount API routers under both /api/v1 (Architecture standard) and /api
const apiRouter = express.Router();
apiRouter.use('/discrepancies', discrepanciesRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/journals', journalsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/root-causes', rootCausesRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/admin', adminRouter);

app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Serve frontend static build if present
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Initialize DB and start server
try {
  getDb();
  console.log('SQLite database connection initialized.');
  app.listen(PORT, () => {
    console.log(`Discrepancy Tracker Backend running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Failed to start backend server:', err);
  process.exit(1);
}
