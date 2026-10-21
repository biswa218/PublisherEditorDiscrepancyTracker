import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'discrepancy_tracker.db');

export class AppDatabase {
  private static instance: DatabaseSync | null = null;

  public static getInstance(): DatabaseSync {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new DatabaseSync(DB_PATH);
      // SQLite architectural configurations
      AppDatabase.instance.exec('PRAGMA foreign_keys = ON;');
      AppDatabase.instance.exec('PRAGMA journal_mode = WAL;');
      AppDatabase.instance.exec('PRAGMA busy_timeout = 5000;');

      // Auto-initialize schema if needed
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        AppDatabase.instance.exec(schemaSql);
      }
    }
    return AppDatabase.instance;
  }
}

export const getDb = (): DatabaseSync => AppDatabase.getInstance();

export const query = <T = any>(sql: string, params: any[] = []): T[] => {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
};

export const get = <T = any>(sql: string, params: any[] = []): T | undefined => {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...params);
  return (result as T) || undefined;
};

export const run = (sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } => {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

export const exec = (sql: string): void => {
  const db = getDb();
  db.exec(sql);
};

export const transaction = <T>(fn: () => T): T => {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const res = fn();
    db.exec('COMMIT');
    return res;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

