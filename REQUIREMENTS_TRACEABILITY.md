# Taylor & Francis Publisher–Editor Discrepancy Tracker
## Requirements Traceability Matrix (RTM)

This document tracks and maps every Business Objective, Functional Requirement, Business Rule, and User Story defined in the Functional Requirements Document (`artifacts/Publisher_Editor_Discrepancy_Tracker_Requirements.md`) and Technical Architecture Blueprint (`artifacts/Publisher_Editor_Discrepancy_Tracker_SQLite_Architecture.md`) to its backend implementation, frontend components, database tables, and automated Playwright E2E test scenarios.

---

### 1. Business Objectives (BR-001 – BR-009)

| Requirement ID | Business Objective Statement | Status | Implementation Component | Verification Test |
|---|---|---|---|---|
| **BR-001** | Record defects raised between publishers and editors | **Implemented** | `discrepancyService.ts`, `LogDiscrepancyModal.tsx`, `discrepancies` table | E2E Scenario 1 |
| **BR-002** | Tag root causes for defects | **Implemented** | `discrepancy_root_causes` table, `rootCauses.ts`, `DiscrepancyDetail.tsx` | E2E Scenario 5 |
| **BR-003** | Surface discrepancy trends | **Implemented** | `analyticsService.ts` (`/analytics/trends`), `ExecutiveDashboard.tsx` | E2E Scenario 7 |
| **BR-004** | Identify editors associated with greatest rework | **Implemented** | `analyticsService.ts` (`/analytics/by-editor`), `ReworkAnalytics.tsx` | E2E Scenario 8 |
| **BR-005** | Identify journals associated with greatest rework | **Implemented** | `analyticsService.ts` (`/analytics/by-journal`), `ExecutiveDashboard.tsx` | E2E Scenario 7 |
| **BR-006** | Identify defect types associated with greatest rework | **Implemented** | `analyticsService.ts` (`/analytics/by-category`), `ExecutiveDashboard.tsx` | E2E Scenario 7 |
| **BR-007** | Reduce repeat discrepancies using corrective actions | **Implemented** | Root Cause investigation workflows & `corrective_actions` table | E2E Scenario 5 |
| **BR-008** | Improve visibility and accountability | **Implemented** | RBAC persona switcher, assignments log, live lifecycle stepper | E2E Scenario 3, 4 |
| **BR-009** | Provide management dashboards and reports | **Implemented** | `ExecutiveDashboard.tsx`, CSV Export (`/reports/export`) | E2E Scenario 2, 7 |

---

### 2. Functional Requirements (FR-001 – FR-062)

#### 2.1 Discrepancy Creation & Validation
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-001** | Allow authorized users to create a discrepancy | `POST /api/v1/discrepancies`, `LogDiscrepancyModal.tsx` | E2E Scenario 1 |
| **FR-002** | Generate unique read-only identifier (e.g. `PED-000001`) | `generateNextReference()` in `discrepancyService.ts` | E2E Scenario 1 |
| **FR-003** | Validate mandatory & formatted fields | Validation logic in `discrepancyService.ts` & modal validation error banner | E2E Scenario 1 |
| **FR-004** | Allow permitted evidence attachments or reference links | `evidence_url` column in `discrepancies` & `attachments` table | E2E Scenario 1 |
| **FR-005** | Confirm successful creation | Navigates directly to generated discrepancy details card | E2E Scenario 1 |

#### 2.2 Classification & Taxonomy
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-006** | Select an approved defect category | Hierarchical `defect_categories` table (parent & subcategories) | E2E Scenario 1 |
| **FR-007** | Allow administrators to manage category taxonomy without corrupting history | `POST /api/v1/categories`, `AdminTaxonomy.tsx` Category Management tab | E2E Scenario 9 |
| **FR-008** | Support approved severity levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) | Enforced in SQLite CHECK constraint and severity badges in UI | E2E Scenario 1, 2 |
| **FR-009** | Support configurable priority levels (`P1`, `P2`, `P3`, `P4`) | Enforced in SQLite schema and UI priority selectors | E2E Scenario 1, 2 |

#### 2.3 Root Cause Analysis
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-010** | Tag each discrepancy with root-cause information | `discrepancy_root_causes` table, `POST /api/v1/discrepancies/:id/root-causes` | E2E Scenario 5 |
| **FR-011** | Record investigation notes and supporting evidence | `investigation_notes` field in `DiscrepancyDetail.tsx` | E2E Scenario 5 |
| **FR-012** | Permit authorized root-cause updates with audit history | Tracked in `audit_events` with actor, timestamp, and values delta | E2E Scenario 5, 10 |
| **FR-013** | Optionally record corrective and preventive actions | Schema support via `corrective_actions` table | Unit / Schema DDL |

#### 2.4 Workflow & Lifecycle
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-014** | Track discrepancy lifecycle (`NEW` → `TRIAGED` → `ASSIGNED` → `IN PROGRESS` → `RESOLVED` → `VERIFIED` → `CLOSED`) | `workflowService.ts`, visual 7-step tracker in `DiscrepancyDetail.tsx` | E2E Scenario 3 |
| **FR-015** | Restrict status transitions by approved roles and rules | QA Analyst verification check enforced in `workflowService.ts` | E2E Scenario 3 |
| **FR-016** | Support assignment and reassignment | `assignments` table, `POST /api/v1/discrepancies/:id/assignments` | E2E Scenario 4 |
| **FR-017** | Require approved resolution information before resolving | Resolution notes and tagged root cause mandatory for `RESOLVED` transition | E2E Scenario 3 |
| **FR-018** | Permit authorized reopening | `CLOSED` and `RESOLVED` allow transitioning to `REOPENED` | E2E Scenario 3 |
| **FR-019** | Preserve assignment, status and resolution history | `status_history` and `assignments` tables rendered chronologically | E2E Scenario 3, 4 |

#### 2.5 Rework Measurement & Aggregation
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-020** | Capture rework effort, contributors, and dates | `rework_entries` table with performed_by, hours, work_date, notes | E2E Scenario 6 |
| **FR-021** | Calculate total rework hours for reporting periods | `SUM(hours)` computed dynamically in SQL and rendered in UI | E2E Scenario 6, 7 |
| **FR-022** | Aggregate rework by editor using an approved attribution model | `GET /api/v1/analytics/by-editor` with non-punitive governance disclaimer | E2E Scenario 8 |
| **FR-023** | Aggregate rework by journal | `GET /api/v1/analytics/by-journal` with discrepancy & open counts | E2E Scenario 7, 8 |
| **FR-024** | Aggregate rework by defect category | `GET /api/v1/analytics/by-category` with rework percentage share | E2E Scenario 7 |
| **FR-025** | Distinguish reporter, assignee, affected editor, and verified root-cause owner | Discrete relational columns in `discrepancies` table with distinct roles | E2E Scenario 1, 3 |

#### 2.6 Analytics Dashboard
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-026** | Provide a discrepancy/rework overview dashboard | `ExecutiveDashboard.tsx` with KPI cards and interactive tables | E2E Scenario 7 |
| **FR-027** | Show agreed KPIs (total, open, triaged, resolved, rework, avg resolution days) | `analyticsService.ts` (`/analytics/summary`) | E2E Scenario 7 |
| **FR-028** | Filter analytics by date, journal, editor, publisher, category, severity, status | Search parameters supported on all register and analytics queries | E2E Scenario 2 |
| **FR-029** | Drill down from aggregates to authorized underlying records | Drill-down buttons navigate directly to register with active filter state | E2E Scenario 7, 8 |
| **FR-030** | Compare trends across agreed time periods | Monthly discrepancy and rework trajectory visual bar | E2E Scenario 7 |
| **FR-031** | Compare journals by discrepancy count and rework | Journal Ranking table with total hours, open count, and avg rework | E2E Scenario 7 |
| **FR-032** | Compare editor-associated rework with explicit attribution labels | Editorial attribution matrix with mandatory governance notice | E2E Scenario 8 |
| **FR-033** | Visualize root-cause distribution | Root cause Pareto ranking by incident volume and total hours | E2E Scenario 8 |
| **FR-034** | Refresh data at agreed interval | Dynamic TanStack Query / React effect refreshing on state updates | E2E Scenario 1..10 |

#### 2.7 Search and Reporting
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-035** | Provide a searchable discrepancy register | `DiscrepancyRegister.tsx` | E2E Scenario 2 |
| **FR-036** | Search by ID, journal, editor, manuscript ID and keywords | Full SQL multi-field `LIKE` search in `discrepancyService.ts` | E2E Scenario 2 |
| **FR-037** | Apply multiple filters simultaneously | Combined Journal, Category, Status, Severity, Priority dropdowns | E2E Scenario 2 |
| **FR-038** | Sort by date, severity, priority, status and rework | Dynamic SQL sorting in `discrepancyService.ts` | E2E Scenario 2 |
| **FR-039** | Paginate large result sets | SQL `LIMIT` and `OFFSET` with Next/Previous pagination controls | E2E Scenario 2 |
| **FR-040** | Generate authorized discrepancy reports | `GET /api/v1/reports/export` | E2E Scenario 2 |
| **FR-041** | Export reports in approved formats (CSV and JSON) | CSV generator with standard headers and JSON stream | E2E Scenario 2 |
| **FR-042** | Apply current filters and permissions to exports | Active query filters forwarded to export endpoint | E2E Scenario 2 |
| **FR-043** | Include aggregated and permitted detailed data | Exports include reference, title, journal, category, rework, and editor | E2E Scenario 2 |

#### 2.8 Audit and Administration
| FR ID | Requirement | Implementation Details | Test Coverage |
|---|---|---|---|
| **FR-050** | Preserve a history of discrepancy changes | `audit_events` table tracking entity_type, entity_id, actor, timestamp | E2E Scenario 10 |
| **FR-051** | Capture actor, timestamp, action and old/new values | JSON serialization of state deltas in `auditService.ts` | E2E Scenario 10 |
| **FR-052** | Allow authorized audit-history viewing | `AuditTrail.tsx` view with entity filter and diff inspection | E2E Scenario 10 |
| **FR-053** | Protect audit records from unauthorized modification | Audit records are append-only with no delete/update endpoints | Unit / Security |
| **FR-054** | Manage defect categories and root causes | `AdminTaxonomy.tsx` Category and Root Cause management tabs | E2E Scenario 9 |
| **FR-055** | Manage user-role assignments under approved IAM policy | Persona switcher and user reference table `app_users` | E2E Scenario 3 |
| **FR-056** | Configure supported statuses and transitions | Centralized transition matrix `ALLOWED_TRANSITIONS` | E2E Scenario 3 |
| **FR-057** | Maintain journal reference data and editor–journal associations | `AdminTaxonomy.tsx` Journals and Editor-Journal tabs | E2E Scenario 9 |

---

### 3. Business Rules Compliance (RULE-001 – RULE-012)

| Rule ID | Business Rule Specification | Enforcement Mechanism | Verification |
|---|---|---|---|
| **RULE-001** | Every discrepancy has a unique ID | Auto-generated `PED-XXXXXX` with UNIQUE constraint | E2E Scenario 1 |
| **RULE-002** | Every discrepancy references an authorized journal | Foreign key reference to `journals(id)` | E2E Scenario 1 |
| **RULE-003** | A new discrepancy may initially have an undetermined root cause | Optional root cause at registration, defaults to Undetermined | E2E Scenario 1 |
| **RULE-004** | Root cause and resolution notes required for closure/resolution | Enforced in `workflowService.ts` before moving to `RESOLVED` | E2E Scenario 3 |
| **RULE-005** | Only authorized users may change statuses | Role-based check on QA verification in `workflowService.ts` | E2E Scenario 3 |
| **RULE-006** | Rework hours cannot be negative | SQLite table constraint `CHECK (hours >= 0)` & frontend validation | E2E Scenario 6 |
| **RULE-007** | Multiple rework entries may belong to one discrepancy | One-to-many relationship in `rework_entries` with `SUM(hours)` | E2E Scenario 6 |
| **RULE-008** | Edits preserve audit history | `logAuditEvent` triggered on all create, update, transition, and rework operations | E2E Scenario 10 |
| **RULE-009** | Reopening preserves earlier resolutions | Prior resolutions retained in `status_history` and `resolution_notes` | E2E Scenario 3 |
| **RULE-010** | Association with an editor does not establish fault | Prominent non-punitive governance notice rendered in `ReworkAnalytics.tsx` | E2E Scenario 8 |
| **RULE-011** | Duplicate reports follow approved linking/deduplication rule | Handled via manuscript ID lookup and search filtering | E2E Scenario 2 |
| **RULE-012** | Inactive journals remain identifiable in historical reporting | Soft-deletion flag `active IN (0,1)` preserves historical joins | E2E Scenario 7, 9 |

---

### 4. User Stories & Acceptance Criteria (US-001 – US-014)

| User Story | Role | Acceptance Criteria | Test Status |
|---|---|---|---|
| **US-001** | Publisher | Publisher creates discrepancy; valid record saved with unique ID | **Passed (Scenario 1)** |
| **US-002** | Editor | Authorized editor can create/view record | **Passed (Scenario 1, 2)** |
| **US-003** | QA Analyst | QA classifies defect and approves/verifies resolution | **Passed (Scenario 3)** |
| **US-004** | Manager | Editorial Manager assigns investigation; history saved | **Passed (Scenario 4)** |
| **US-005** | Investigator | Investigator records root cause; findings and notes persist | **Passed (Scenario 5)** |
| **US-006** | Assignee | Allowed workflow transitions succeed; invalid transitions rejected | **Passed (Scenario 3)** |
| **US-007** | Contributor | Team records rework; rework entries correctly aggregate into total | **Passed (Scenario 6)** |
| **US-008** | Manager | Manager compares journals; journal aggregates match underlying records | **Passed (Scenario 7)** |
| **US-009** | Manager | Manager compares categories; category aggregates reconcile | **Passed (Scenario 7)** |
| **US-010** | Manager | Manager analyzes editors; attribution rules & disclaimers honored | **Passed (Scenario 8)** |
| **US-011** | Reporting User | Export matches active filters and permissions | **Passed (Scenario 2)** |
| **US-012** | Administrator | Admin maintains taxonomy; historical data remains valid | **Passed (Scenario 9)** |
| **US-013** | Auditor | Actor, timestamp, and changes visible in chronological trail | **Passed (Scenario 10)** |
| **US-014** | Manager | Root-cause trends aggregate accurately across publications | **Passed (Scenario 8)** |

