# Publisher–Editor Discrepancy Tracker

**Organization:** Taylor & Francis  
**Document type:** Draft Functional Requirements Document (FRD)  
**Status:** Proposed — stakeholder validation required  
**Date:** 20 October 2026

> **Requirements provenance:** Only the high-level stakeholder statement is confirmed. Detailed functionality, workflow, data fields, integrations, metrics, and implementation phases below are proposals requiring approval.

## 1. Stakeholder Statement (Confirmed)

**What:** Logs every defect raised by publisher ↔ editor, tags root cause, and surfaces trends.  
**Value:** Shows which editor, which journal, which defect type is causing the most rework.

## 2. Business Objectives

| ID | Requirement | Status |
|---|---|---|
| BR-001 | Record defects raised between publishers and editors. | Confirmed |
| BR-002 | Tag root causes for defects. | Confirmed |
| BR-003 | Surface discrepancy trends. | Confirmed |
| BR-004 | Identify editors associated with greatest rework. | Confirmed |
| BR-005 | Identify journals associated with greatest rework. | Confirmed |
| BR-006 | Identify defect types associated with greatest rework. | Confirmed |
| BR-007 | Reduce repeat discrepancies using corrective actions. | Proposed |
| BR-008 | Improve visibility and accountability. | Proposed |
| BR-009 | Provide management dashboards and reports. | Proposed |

## 3. Proposed Scope

**In scope:** Discrepancy registration; bidirectional publisher/editor reporting; categorization; editor and journal association; root cause investigation; assignment; lifecycle management; rework effort capture; search and filtering; analytics; reporting; notifications; role-based access; audit history; approved integrations.

**Potentially out of scope for initial release:** Automatic defect correction; manuscript editing; replacement of editorial systems; AI root-cause prediction; employee disciplinary scoring; contract changes.

## 4. Proposed Roles

- **Publisher:** Raise defects, provide evidence, review resolutions.
- **Editor:** Raise defects, respond to assigned records, clarify issues.
- **Editorial Manager:** Assign, prioritize, oversee and close discrepancies.
- **QA Analyst:** Validate issues, classify defects, verify fixes.
- **Administrator:** Manage roles, categories, workflows and reference data.
- **Reporting User:** View permitted dashboards and reports.

Access must be role-based, journal-scoped where necessary, and explicitly approved. An editor associated with a discrepancy must not automatically be considered responsible for causing it.

## 5. Functional Requirements

All FR items are **proposed** unless separately approved.

### 5.1 Discrepancy Creation

| ID | Requirement |
|---|---|
| FR-001 | Allow authorized users to create a discrepancy. |
| FR-002 | Generate a unique read-only discrepancy identifier (example: PED-000001). |
| FR-003 | Validate mandatory and formatted fields before submission. |
| FR-004 | Allow permitted evidence attachments or reference links. |
| FR-005 | Confirm successful creation. |

**Proposed fields:** Discrepancy ID; title; description; raised by; raised-by role; related party; journal; manuscript/submission ID; category; subcategory; severity; priority; identified date; impact description; evidence; assigned to; status; root cause; rework hours; resolution notes.

**Suggested validations:** Title, description, journal, category and identified date required; manuscript ID conditionally required; email/user identifiers validated against authoritative sources where available; evidence file size/types to be specified; system-generated fields read-only.

### 5.2 Classification

| ID | Requirement |
|---|---|
| FR-006 | Select an approved defect category. |
| FR-007 | Allow administrators to manage category taxonomy without corrupting history. |
| FR-008 | Support approved severity levels. |
| FR-009 | Support configurable priority levels. |

**Illustrative categories (not approved):** Manuscript Metadata; Editorial Workflow; Peer Review; Journal Configuration; Submission Validation; Production Handoff; Communication; Publishing Quality; Policy Compliance; Other.

### 5.3 Root Cause

| ID | Requirement |
|---|---|
| FR-010 | Tag each discrepancy with root-cause information. |
| FR-011 | Record investigation notes and supporting evidence. |
| FR-012 | Permit authorized root-cause updates with audit history. |
| FR-013 | Optionally record corrective and preventive actions. |

**Illustrative taxonomy:** Human Error; Process Gap; Training Gap; System Defect; Configuration Issue; Data Quality; Integration Failure; Communication Gap; Undetermined.

### 5.4 Workflow

| ID | Requirement |
|---|---|
| FR-014 | Track discrepancy lifecycle. |
| FR-015 | Restrict status transitions by approved roles and rules. |
| FR-016 | Support assignment and reassignment. |
| FR-017 | Require approved resolution information before resolving. |
| FR-018 | Permit authorized reopening. |
| FR-019 | Preserve assignment, status and resolution history. |

**Proposed flow:** New → Triaged → Assigned / In Progress → Resolved → Verified → Closed. Reopen paths, exception states, and role permissions require approval.

### 5.5 Rework Measurement

| ID | Requirement |
|---|---|
| FR-020 | Capture rework effort, contributors and dates. |
| FR-021 | Calculate total rework hours for selected reporting periods. |
| FR-022 | Aggregate rework by editor using an approved attribution model. |
| FR-023 | Aggregate rework by journal. |
| FR-024 | Aggregate rework by defect category. |
| FR-025 | Distinguish reporter, assignee, affected editor and verified root-cause owner. |

**Formula:** `Total Rework Hours = SUM(eligible rework entries' hours)`.

Possible additional measures: correction count, rework occurrences, cost, and normalized defect rate. Their definitions must be agreed.

### 5.6 Analytics Dashboard

| ID | Requirement |
|---|---|
| FR-026 | Provide a discrepancy/rework overview dashboard. |
| FR-027 | Show agreed KPIs. |
| FR-028 | Filter analytics by date, journal, editor, publisher, category, severity, priority, root cause and status. |
| FR-029 | Drill down from aggregates to authorized underlying records. |
| FR-030 | Compare trends across agreed time periods. |
| FR-031 | Compare journals by discrepancy count and rework. |
| FR-032 | Compare editor-associated rework with explicit attribution labels and access controls. |
| FR-033 | Visualize root-cause distribution. |
| FR-034 | Refresh data at an agreed interval. |

**Proposed KPIs:** Total discrepancies; open count; resolved count; reopened count; rework hours; average resolution time; top journal by rework; top defect category; editor-associated rework; recurrence rate.

**Optional normalization:** `Discrepancy Rate = Discrepancies / Eligible Manuscripts Processed × 100`, only if denominator and attribution data are reliable. Avoid presenting editor rankings as evidence of fault without investigation.

### 5.7 Search and Reporting

| ID | Requirement |
|---|---|
| FR-035 | Provide a searchable discrepancy register. |
| FR-036 | Search by ID, journal, editor, manuscript ID and keywords. |
| FR-037 | Apply multiple filters. |
| FR-038 | Sort by date, severity, priority, status and rework. |
| FR-039 | Paginate or otherwise navigate large result sets. |
| FR-040 | Generate authorized discrepancy reports. |
| FR-041 | Export reports in approved formats (proposed: CSV and XLSX). |
| FR-042 | Apply current filters and permissions to exports. |
| FR-043 | Include aggregated and permitted detailed data. |
| FR-044 | Optionally schedule reports. |

**Suggested reports:** Editor Discrepancy; Journal Quality; Root Cause; Rework Effort; Aging; Monthly Trend; Recurrence.

### 5.8 Notifications

| ID | Requirement |
|---|---|
| FR-045 | Notify users when a discrepancy is assigned. |
| FR-046 | Notify stakeholders on relevant status changes. |
| FR-047 | Notify users when clarification is requested. |
| FR-048 | Optionally remind users about unresolved discrepancies. |
| FR-049 | Optionally escalate records exceeding agreed thresholds. |

Channels, timing, recipients and escalation rules remain open.

### 5.9 Audit and Administration

| ID | Requirement |
|---|---|
| FR-050 | Preserve a history of discrepancy changes. |
| FR-051 | Capture actor, timestamp, action and relevant old/new values. |
| FR-052 | Allow authorized audit-history viewing. |
| FR-053 | Protect audit records from unauthorized modification. |
| FR-054 | Manage defect categories and root causes. |
| FR-055 | Manage user-role assignments under approved IAM policy. |
| FR-056 | Configure supported statuses and transitions. |
| FR-057 | Maintain journal reference data and editor–journal associations. |
| FR-058 | Optionally configure notification, reporting and threshold rules. |

### 5.10 Integrations

| ID | Requirement |
|---|---|
| FR-059 | Use authoritative journal and user reference data where approved. |
| FR-060 | Validate manuscript references against approved sources where technically available. |
| FR-061 | Handle integration failures using agreed retry, logging and recovery behavior. |
| FR-062 | Prevent unauthorized exposure of manuscript and user data. |

**Candidate integrations, not confirmed:** Editorial Submission System; Journal Master Data; IAM; Jira; BI platform; email/notification service. No actual API or system behavior has been verified.

## 6. Proposed Data Model

| Entity | Main fields |
|---|---|
| Discrepancy | ID, title, description, journal, category, severity, priority, status |
| Journal | Journal ID, name, identifier, active flag |
| User | User ID, display name, role |
| EditorJournalAssociation | Editor ID, journal ID, start/end dates |
| RootCause | ID, category, description |
| DiscrepancyRootCause | Discrepancy ID, root cause ID, notes |
| ReworkEntry | ID, discrepancy ID, contributor, hours, date |
| Assignment | Discrepancy ID, assignee, assigned date |
| Attachment | ID, discrepancy ID, file reference |
| AuditEvent | ID, actor, action, timestamp, changed values |
| CorrectiveAction | ID, discrepancy ID, owner, target date, status |

Cardinality (multiple root causes, editors, journals and rework entries) needs confirmation.

## 7. Non-Functional Requirements (Proposed)

| ID | Area | Requirement |
|---|---|---|
| NFR-001 | Performance | Agree page-load thresholds. |
| NFR-002 | Performance | Agree search/dashboard response times. |
| NFR-003 | Scalability | Support expected record and user volumes. |
| NFR-004 | Availability | Define uptime and operating windows. |
| NFR-005 | Security | Authenticate and authorize users. |
| NFR-006 | Security | Encrypt sensitive data in transit and at rest. |
| NFR-007 | Privacy | Enforce data minimization and retention. |
| NFR-008 | Auditability | Protect audit trails. |
| NFR-009 | Accessibility | Meet approved accessibility standards. |
| NFR-010 | Compatibility | Support approved browsers/devices. |
| NFR-011 | Reliability | Avoid duplicate creation on retries. |
| NFR-012 | Recovery | Define backups, RPO and RTO. |
| NFR-013 | Observability | Securely log application/integration failures. |
| NFR-014 | Data Quality | Maintain consistent reference identifiers. |
| NFR-015 | Export Security | Respect permissions in downloaded data. |

No numeric service levels have been supplied.

## 8. Proposed Business Rules

| ID | Rule |
|---|---|
| RULE-001 | Every discrepancy has a unique ID. |
| RULE-002 | Every discrepancy references an authorized journal or approved grouping. |
| RULE-003 | A new discrepancy may initially have an undetermined root cause. |
| RULE-004 | Root cause is required for closure unless an approved exception applies. |
| RULE-005 | Only authorized users may change statuses. |
| RULE-006 | Rework hours cannot be negative. |
| RULE-007 | Multiple rework entries may belong to one discrepancy. |
| RULE-008 | Edits preserve audit history. |
| RULE-009 | Reopening preserves earlier resolutions. |
| RULE-010 | Association with an editor does not establish fault. |
| RULE-011 | Duplicate reports follow an approved linking/deduplication rule. |
| RULE-012 | Inactive journals remain identifiable in historical reporting. |

## 9. User Stories and Acceptance Criteria (Proposed)

| ID | User story | Acceptance criteria |
|---|---|---|
| US-001 | Publisher creates discrepancy | Valid record saved with unique ID. |
| US-002 | Editor reports discrepancy | Authorized editor can create/view record. |
| US-003 | QA classifies defect | Approved classification persists. |
| US-004 | Manager assigns investigation | Assignment and history saved. |
| US-005 | Investigator records root cause | Root cause and notes persist. |
| US-006 | Assignee updates status | Allowed transitions work; prohibited ones fail. |
| US-007 | Team records rework | Rework entries correctly aggregate. |
| US-008 | Manager compares journals | Journal aggregates match underlying records. |
| US-009 | Manager compares categories | Category aggregates reconcile. |
| US-010 | Manager analyzes editors | Attribution and access rules are honored. |
| US-011 | Reporting user exports results | Export matches filters and permissions. |
| US-012 | Admin maintains taxonomy | Historical data remains valid. |
| US-013 | Auditor reviews history | Actor, timestamp and changes visible. |
| US-014 | Manager views recurring causes | Root-cause trends aggregate accurately. |

## 10. Illustrative End-to-End Scenario

A publisher reports incorrect author affiliation metadata (illustrative, not a real incident):

1. Publisher creates discrepancy with journal, manuscript reference, category and evidence.
2. System generates ID, e.g. `PED-000125`.
3. Manager assigns investigator.
4. Investigator records root cause `Data Quality`.
5. Responsible team corrects metadata.
6. Rework contributor logs 2 hours.
7. QA verifies correction.
8. Authorized manager closes record.
9. Dashboard reflects the eligible discrepancy and 2 rework hours.

## 11. QA Test Strategy

- **Positive:** Creation, assignment, classification, resolution, closure, reporting.
- **Negative:** Missing required fields, invalid values, unauthorized transitions.
- **Boundary:** Text lengths, file size, dates, rework decimal limits.
- **Workflow:** Allowed/disallowed transitions and reopening.
- **Data integrity:** Duplicates, reference associations, edit history.
- **API/contract:** Schemas and error behavior once API docs exist.
- **Integration:** Journal, IAM, manuscript and linked-system data.
- **Analytics:** Aggregations, filters, date boundaries, ranking and drill-down reconciliation.
- **Security:** Permissions, journal scoping, export access.
- **Performance:** High-volume search and dashboard workloads.
- **Audit:** Correct actor/time/value history.
- **Regression:** Stability after configuration changes.

## 12. Stakeholder Open Questions

1. Which discrepancy types and publishing workflow stages are included?
2. Will data be entered manually, imported, or synchronized?
3. Who can create, assign, verify, resolve, close and reopen records?
4. What is the authoritative source for journal/editor information?
5. Must every discrepancy reference a manuscript ID?
6. What category, severity, priority and root-cause taxonomies are approved?
7. What statuses, transitions and reopen rules are required?
8. How exactly is rework measured (hours, corrections, cost)?
9. How is editor responsibility attributed, and how are misleading rankings prevented?
10. What KPIs, filters, date periods and reports are required?
11. Which integrations and APIs are available and approved?
12. What are the security, retention, privacy, audit and SLA requirements?
13. Are multiple editors, journals or root causes allowed on a discrepancy?
14. What are the notification and escalation channels/thresholds?
15. What is the definition of a recurring or duplicate discrepancy?

## 13. Recommended Phases

| Phase | Proposed delivery scope | Priority |
|---|---|---|
| Phase 1 — MVP | Registration, categorization, journal/editor association, root causes, status, rework, basic dashboard | P1 |
| Phase 2 — Operations | Assignment, notifications, advanced filters, exports, audit views, escalation | P2 |
| Phase 3 — Analytics | Trend comparisons, recurrence, normalized metrics, corrective actions, integrations | P3 |

## 14. Proposed Definition of Done

- Approved fields and validations implemented.
- Authorized users can record, investigate and resolve discrepancies.
- Journal, editor, category and root-cause references are accurate.
- Rework is captured and aggregated correctly.
- Dashboard totals reconcile with authorized underlying records.
- Search, filters and exports are consistent.
- Permissions and audit history work as approved.
- Non-functional thresholds pass.
- Stakeholders accept UAT outcomes.

## 15. Approval Note

This is a **draft requirements baseline**, not evidence of existing Taylor & Francis application functionality. Business owners should confirm scope, definitions, attribution, workflow, permissions, integrations and acceptance criteria before engineering estimates and QA test-case sign-off.
