-- Taylor & Francis Publisher-Editor Discrepancy Tracker Schema
-- Architecture Blueprint: SQLite persistence with WAL mode, Foreign Keys ON

PRAGMA foreign_keys = ON;

-- 1. App Users (SSO / IAM Reference Table)
CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_user_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Publisher', 'Editor', 'Editorial Manager', 'QA Analyst', 'Administrator', 'Reporting User')),
    department TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

-- 2. Journals Reference Data
CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_code TEXT NOT NULL UNIQUE,
    journal_name TEXT NOT NULL,
    issn TEXT,
    discipline TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

-- 3. Editor-Journal Associations
CREATE TABLE IF NOT EXISTS editor_journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    editor_id INTEGER NOT NULL REFERENCES app_users(id),
    journal_id INTEGER NOT NULL REFERENCES journals(id),
    role_title TEXT DEFAULT 'Editor-in-Chief',
    start_date TEXT,
    end_date TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    UNIQUE(editor_id, journal_id)
);

-- 4. Defect Categories & Hierarchy
CREATE TABLE IF NOT EXISTS defect_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_code TEXT NOT NULL UNIQUE,
    category_name TEXT NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES defect_categories(id),
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

-- 5. Root Cause Taxonomy
CREATE TABLE IF NOT EXISTS root_causes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cause_code TEXT NOT NULL UNIQUE,
    cause_name TEXT NOT NULL UNIQUE,
    category TEXT, -- e.g. Human Error, Process Gap, Training Gap, System Defect, Data Quality
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

-- 6. Discrepancies Core Table
CREATE TABLE IF NOT EXISTS discrepancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_number TEXT NOT NULL UNIQUE, -- PED-000001
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    journal_id INTEGER NOT NULL REFERENCES journals(id),
    category_id INTEGER NOT NULL REFERENCES defect_categories(id),
    sub_category_id INTEGER REFERENCES defect_categories(id),
    created_by INTEGER NOT NULL REFERENCES app_users(id),
    assigned_to INTEGER REFERENCES app_users(id),
    related_editor_id INTEGER REFERENCES app_users(id),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'TRIAGED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'REOPENED')),
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    manuscript_reference TEXT,
    identified_date TEXT NOT NULL,
    impact_description TEXT,
    resolution_notes TEXT,
    evidence_url TEXT,
    verified_by INTEGER REFERENCES app_users(id),
    closed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    version INTEGER NOT NULL DEFAULT 0
);

-- 7. Discrepancy Root Causes (Investigation Links)
CREATE TABLE IF NOT EXISTS discrepancy_root_causes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    root_cause_id INTEGER NOT NULL REFERENCES root_causes(id),
    investigation_notes TEXT,
    created_by INTEGER NOT NULL REFERENCES app_users(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 8. Rework Entries (RULE-006: hours >= 0)
CREATE TABLE IF NOT EXISTS rework_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    performed_by INTEGER NOT NULL REFERENCES app_users(id),
    hours NUMERIC NOT NULL CHECK (hours >= 0),
    work_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 9. Workflow Assignments History
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES app_users(id),
    assigned_to INTEGER NOT NULL REFERENCES app_users(id),
    notes TEXT,
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 10. Status Transition History (RULE-005, RULE-008, RULE-009)
CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES app_users(id),
    reason TEXT,
    changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 11. Comprehensive Audit Events (FR-050..FR-053, RULE-008)
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    actor_id INTEGER REFERENCES app_users(id),
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    old_values TEXT,
    new_values TEXT
);

-- 12. Evidence Attachments
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    uploaded_by INTEGER NOT NULL REFERENCES app_users(id),
    uploaded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 13. Corrective Actions (FR-013)
CREATE TABLE IF NOT EXISTS corrective_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discrepancy_id INTEGER NOT NULL REFERENCES discrepancies(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES app_users(id),
    description TEXT NOT NULL,
    target_date TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Indexes for high-performance searching and analytics
CREATE INDEX IF NOT EXISTS idx_discrepancies_journal_status ON discrepancies(journal_id, status);
CREATE INDEX IF NOT EXISTS idx_discrepancies_created_at ON discrepancies(created_at);
CREATE INDEX IF NOT EXISTS idx_discrepancies_category ON discrepancies(category_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_assigned_to ON discrepancies(assigned_to);
CREATE INDEX IF NOT EXISTS idx_discrepancies_related_editor ON discrepancies(related_editor_id);
CREATE INDEX IF NOT EXISTS idx_rework_discrepancy ON rework_entries(discrepancy_id);
CREATE INDEX IF NOT EXISTS idx_rework_performed_by ON rework_entries(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);

