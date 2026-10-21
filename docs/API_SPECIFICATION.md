# REST API Specification

**Base URL:** `/api/v1` (with legacy fallback support on `/api`)  
**Format:** JSON (UTF-8)  
**Authentication Standard:** HTTP Headers / Bearer Token (SSO Header Injection supported: `X-User-Id`)  

---

## 1. Discrepancy Management

### 1.1 List Discrepancies (Filtered & Paginated)
- **Endpoint:** `GET /api/v1/discrepancies`
- **Query Parameters:**
  - `search` *(string, optional)*: Partial match against reference ID, title, description, or manuscript ID.
  - `status` *(string, optional)*: Filter by lifecycle status (`NEW`, `TRIAGED`, `ASSIGNED`, `IN PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`).
  - `severity` *(string, optional)*: Filter by severity (`Critical`, `Major`, `Minor`, `Cosmetic`).
  - `priority` *(string, optional)*: Filter by priority (`P1 - Urgent`, `P2 - High`, `P3 - Medium`, `P4 - Low`).
  - `journalId` *(integer, optional)*: ID of journal.
  - `categoryId` *(integer, optional)*: ID of defect category.
  - `page` *(integer, optional, default: 1)*: Page number.
  - `limit` *(integer, optional, default: 20)*: Page size.
- **Response `200 OK`:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "reference_id": "PED-000001",
        "title": "Unrendered Mathematical Formula in Galley Proof",
        "status": "IN PROGRESS",
        "severity": "Major",
        "priority": "P2 - High",
        "journal_name": "Journal of Academic Precision",
        "category_name": "Typesetting Defect",
        "created_at": "2026-10-18T10:14:00Z",
        "total_rework_hours": 3.5
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
  ```

### 1.2 Create Discrepancy (FR-001..005)
- **Endpoint:** `POST /api/v1/discrepancies`
- **Request Body:**
  ```json
  {
    "title": "Missing Author ORCID identifier on Title Page",
    "description": "Author ORCID was provided during submission but omitted in final composition.",
    "journal_id": 1,
    "category_id": 2,
    "severity": "Minor",
    "priority": "P3 - Medium",
    "manuscript_id": "JAP-2026-8812",
    "doi": "10.1080/jap.2026.8812",
    "created_by": 1
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": 49,
    "reference_id": "PED-000049",
    "status": "NEW",
    "title": "Missing Author ORCID identifier on Title Page",
    "created_at": "2026-10-21T14:20:00Z"
  }
  ```

### 1.3 Get Discrepancy by ID
- **Endpoint:** `GET /api/v1/discrepancies/:id`
- **Response `200 OK`:** Returns full discrepancy aggregate, including tagged root causes, rework entries, assigned investigator, attachments, and status timeline.

### 1.4 Advance Workflow Status (FR-014..019)
- **Endpoint:** `POST /api/v1/discrepancies/:id/status`
- **Request Body:**
  ```json
  {
    "status": "RESOLVED",
    "changed_by": 2,
    "notes": "Formula re-rendered with MathML 3.0 specification.",
    "reopen_reason": null
  }
  ```
- **Error `400 Bad Request`:** Returned if moving to `RESOLVED` without tagged root cause (RULE-004) or reopening without reason (RULE-005).

### 1.5 Assign Investigator (FR-010)
- **Endpoint:** `POST /api/v1/discrepancies/:id/assign`
- **Request Body:**
  ```json
  {
    "assigned_to": 3,
    "assigned_by": 5,
    "notes": "Assigned to digital systems lead for LaTeX review"
  }
  ```

### 1.6 Tag Root Cause (FR-011..013)
- **Endpoint:** `POST /api/v1/discrepancies/:id/root-causes`
- **Request Body:**
  ```json
  {
    "root_cause_id": 4,
    "tagged_by": 2,
    "is_primary": 1
  }
  ```

### 1.7 Log Rework Effort (FR-020..025)
- **Endpoint:** `POST /api/v1/discrepancies/:id/rework`
- **Request Body:**
  ```json
  {
    "user_id": 2,
    "hours": 1.75,
    "hourly_rate": 65.00,
    "rework_date": "2026-10-21",
    "description": "Proof corrections and LaTeX symbol verification"
  }
  ```
- **Error `400 Bad Request`:** Returned if `hours < 0` (RULE-006).

---

## 2. Analytics & Reporting

### 2.1 Executive Summary KPIs
- **Endpoint:** `GET /api/v1/analytics/summary`
- **Response `200 OK`:**
  ```json
  {
    "openDiscrepancies": 14,
    "totalReworkHours": 182.5,
    "totalReworkCost": 11862.50,
    "slaBreaches": 2,
    "avgResolutionDays": 3.4
  }
  ```

### 2.2 Rework Trends Over Time
- **Endpoint:** `GET /api/v1/analytics/trends`
- **Response `200 OK`:** Returns monthly/weekly aggregated hours and incident counts.

### 2.3 Journal Ranking & Defect Pareto
- **Endpoint:** `GET /api/v1/analytics/by-journal` (Rework hours aggregated by journal)
- **Endpoint:** `GET /api/v1/analytics/by-category` (Defect frequency and Pareto cumulative percentage)

### 2.4 Handling Editor Attribution Matrix (RULE-010)
- **Endpoint:** `GET /api/v1/analytics/attribution-matrix`
- **Response `200 OK`:**
  ```json
  {
    "disclaimer": "CONFIDENTIAL & NON-PUNITIVE: Data collected strictly for workflow enhancement and training under Taylor & Francis Academic Governance Policy.",
    "matrix": [
      {
        "editor_id": 2,
        "editor_name": "Prof. Marcus Davies",
        "journal_name": "Journal of Academic Precision",
        "discrepancies_handled": 12,
        "total_rework_hours": 34.0,
        "avg_rework_per_incident": 2.83
      }
    ]
  }
  ```

### 2.5 Filtered CSV Export
- **Endpoint:** `GET /api/v1/reports/export-csv`
- **Behavior:** Streams filtered dataset as RFC 4180 CSV file with `Content-Disposition: attachment; filename="discrepancy_ledger_export.csv"`.

---

## 3. Administrative Master Data

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Returns all active defect categories |
| `POST` | `/api/v1/categories` | Adds new defect taxonomy node |
| `GET` | `/api/v1/root-causes` | Returns root cause taxonomy list |
| `POST` | `/api/v1/root-causes` | Adds new root cause code |
| `GET` | `/api/v1/journals` | Returns registered journal master list |
| `POST` | `/api/v1/journals` | Registers a new journal |
| `GET` | `/api/v1/admin/audit-trail` | Paginated immutable operational audit ledger |
| `GET` | `/api/v1/users` | Lists system users and editorial personnel |

