# Operational Runbook: Publisher–Editor Discrepancy Tracker

**Client:** Taylor & Francis Scholarly Operations  
**System Name:** Publisher–Editor Discrepancy Tracker (PEDT)  
**Version:** 1.0.0  
**Target Audience:** DevOps Engineers, System Administrators, Operational Support, and Client Technical Leads  
**Classification:** Internal Operational Documentation  

---

## 1. System Overview & Architecture Summary

The Publisher–Editor Discrepancy Tracker is a high-performance modular monolith designed to capture, triage, investigate, and attribute operational discrepancies across academic journal publishing workflows.

### Component Topology
- **Unified Web & API Service:** Node.js 24 Alpine runtime serving both the Express v4 REST API (`/api/v1`) and the compiled React TypeScript Single Page Application (SPA).
- **Persistence Engine:** Embedded SQLite database running in Write-Ahead Logging (`WAL`) mode with strict foreign key constraints enabled. Zero external database engine required.
- **Evidence Storage:** Local filesystem storage mounted at `/app/backend/uploads` for audit artifacts and discrepancy evidence attachments.
- **Port:** Default HTTP `5000` (configurable via `PORT` environment variable).

---

## 2. Environment Specifications & Sizing

### Recommended System Requirements
| Component | Minimum Specification | Recommended Production |
| :--- | :--- | :--- |
| **CPU** | 1 vCPU / Core | 2 vCPU / Cores |
| **Memory** | 1 GB RAM | 2 GB – 4 GB RAM |
| **Storage** | 10 GB SSD (Persistent local volume) | 50 GB NVMe SSD |
| **OS / Runtime** | Docker Engine 24+ / Node.js 24+ | Docker Engine 26+ / Alpine 3.20 |

> [!IMPORTANT]
> **Storage Type Requirement:** SQLite requires local block storage (direct SSD, Docker named volume, or local host directory mount). **Do not mount SQLite database files over networked CIFS, SMB, or NFS shares**, as network lock latency can trigger database locking errors under concurrent operations.

---

## 3. Configuration Reference & Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Node runtime mode (`production` or `development`). |
| `PORT` | `5000` | HTTP port on which the Express web server listens. |
| `DATA_DIR` | `/app/backend/data` | Absolute path where the SQLite database file and WAL logs are stored. |
| `DB_PATH` | `/app/backend/data/discrepancy_tracker.db` | Explicit filepath for the primary SQLite database file. |
| `UPLOADS_DIR` | `/app/backend/uploads` | Directory for evidence attachment uploads. |

---

## 4. Deployment Procedures

### 4.1 Deployment via Docker Compose (Recommended)

1. **Clone or pull repository:**
   ```bash
   git clone https://github.com/biswa218/PublisherEditorDiscrepancyTracker.git
   cd PublisherEditorDiscrepancyTracker
   ```

2. **Launch containers in detached mode:**
   ```bash
   docker compose up -d --build
   ```

3. **Verify running containers and health:**
   ```bash
   docker compose ps
   curl -s http://localhost:5000/health
   ```
   Expected response:
   ```json
   {"status":"UP","service":"Publisher-Editor Discrepancy Tracker API","timestamp":"..."}
   ```

### 4.2 Windows Native Deployment (PowerShell)

For development or staging environments without Docker:

```powershell
# First time setup / run
.\run-app.ps1

# Force fresh build and seed baseline demo data
.\run-app.ps1 -Rebuild -Seed
```

---

## 5. Routine Operational Procedures

### 5.1 Service Health Verification
The service exposes a lightweight `/health` endpoint monitored by Docker and load balancers:

```bash
# Check service health
curl -f http://localhost:5000/health

# Check database query responsiveness via users endpoint
curl -f http://localhost:5000/api/v1/users
```

### 5.2 Container Lifecycle Management
Using the included PowerShell helper script `docker-run.ps1` or standard Docker CLI:

```powershell
# View real-time logs
.\docker-run.ps1 -Action logs

# Restart container
.\docker-run.ps1 -Action restart

# Gracefully terminate container
.\docker-run.ps1 -Action down
```

### 5.3 Database Backup & Hot Snapshots
Because SQLite runs in `WAL` mode, hot backups can be taken safely while the application is actively serving read and write traffic.

#### Online SQLite Safe Backup
```bash
# Execute safe backup inside running container
docker exec -t discrepancy-tracker-app node -e "
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('/app/backend/data/discrepancy_tracker.db');
  db.exec('VACUUM INTO \"/app/backend/data/backup_' + Date.now() + '.db\"');
  console.log('Online backup created successfully');
"
```

#### Host-Level Volume Backup
```powershell
# Copy backup off the volume to host destination
docker cp discrepancy-tracker-app:/app/backend/data/discrepancy_tracker.db ./backups/discrepancy_tracker_$(Get-Date -Format 'yyyyMMdd_HHmmss').db
```

### 5.4 Database Maintenance & Checkpointing
SQLite WAL mode checkpoints automatically at 1,000 pages. For periodic off-peak maintenance (e.g., weekly cron):

```bash
# Force WAL truncation and index optimization
docker exec -t discrepancy-tracker-app node -e "
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('/app/backend/data/discrepancy_tracker.db');
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  db.exec('PRAGMA optimize;');
  console.log('WAL truncated and schema optimized.');
"
```

---

## 6. Incident Management & Playbooks

### Playbook 1: Port Collision (`EADDRINUSE: port 5000`)
- **Symptoms:** Container fails to bind port or logs show `listen EADDRINUSE: address already in use :::5000`.
- **Diagnosis:**
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  ```
- **Remediation:**
  1. Specify an alternative host port in `docker-compose.yml` or set environment variable:
     ```bash
     PORT=5050 docker compose up -d
     ```
  2. Or terminate the stale process using port 5000.

### Playbook 2: Database Busy / Lock Contention (`SQLITE_BUSY`)
- **Symptoms:** API returns 500 with `busy_timeout` or `database is locked`.
- **Diagnosis:** The system enforces `PRAGMA busy_timeout = 5000;`. Sustained locks occur if an external process opened the `.db` file directly without closing.
- **Remediation:**
  1. Verify no external host process (e.g. SQLite CLI or DB Browser) has the `.db` file open directly.
  2. Inspect running transactions:
     ```bash
     docker restart discrepancy-tracker-app
     ```

### Playbook 3: Volume Storage Exhaustion
- **Symptoms:** File uploads fail with `ENOSPC` or HTTP 500 during attachment upload.
- **Diagnosis:**
  ```bash
  docker exec -t discrepancy-tracker-app df -h /app/backend/uploads
  ```
- **Remediation:**
  1. Prune temporary files or old orphaned attachments.
  2. Expand host Docker volume capacity.

### Playbook 4: Disaster Recovery (Full Database Restore)
1. Stop application container:
   ```bash
   docker compose down
   ```
2. Replace corrupt database file with verified backup:
   ```powershell
   Copy-Item ./backups/discrepancy_tracker_backup.db ./backend/data/discrepancy_tracker.db -Force
   Remove-Item ./backend/data/discrepancy_tracker.db-wal -ErrorAction SilentlyContinue
   Remove-Item ./backend/data/discrepancy_tracker.db-shm -ErrorAction SilentlyContinue
   ```
3. Restart container:
   ```bash
   docker compose up -d
   ```
4. Verify integrity:
   ```bash
   docker exec -t discrepancy-tracker-app node -e "
     const { DatabaseSync } = require('node:sqlite');
     const db = new DatabaseSync('/app/backend/data/discrepancy_tracker.db');
     const res = db.prepare('PRAGMA integrity_check;').all();
     console.log(res);
   "
   ```

---

## 7. Security & Compliance Notes

1. **Non-Root Execution:** The Docker container executes under the unprivileged `node` user (UID 1000).
2. **Academic Non-Punitive Attribution Governance (RULE-010):** All analytical queries and attribution matrices strictly log and present the Taylor & Francis non-punitive governance disclaimer.
3. **Audit Trail Immutability (RULE-008):** The `audit_events` table contains an append-only transaction ledger with JSON change deltas. Do not run manual `DELETE` or `UPDATE` queries against this table.

---

## 8. Escalation & Support Contacts

- **Internal Engineering / Repository:** [GitHub Repository](https://github.com/biswa218/PublisherEditorDiscrepancyTracker.git)
- **Primary Branch:** `main`
- **Application Health URL:** `http://<host>:5000/health`

