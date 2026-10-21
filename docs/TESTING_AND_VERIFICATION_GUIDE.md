# Quality Assurance & Verification Guide

**System:** Taylor & Francis Publisher–Editor Discrepancy Tracker  
**Document Code:** QA-PEDT-001  
**Framework:** Playwright Automated End-to-End Suite  

---

## 1. Test Suite Architecture

The system includes a 10-scenario automated end-to-end (E2E) test suite located in `e2e/scenarios.spec.ts`. The suite validates all functional requirements (FR-001..FR-062) and business rules (RULE-001..RULE-012) directly against the rendered browser UI and live SQLite backend.

```
PublisherEditorDiscrepancyTracker/
├── e2e/
│   └── scenarios.spec.ts       # 10 comprehensive business scenarios
├── playwright.config.ts        # Playwright test runner configuration
├── playwright-report/          # Generated HTML reports
└── test-results/               # Failure screenshots and video artifacts
```

---

## 2. Test Execution Commands

### 2.1 Run All Tests Headlessly
```bash
npm run test:e2e
```
*Playwright automatically launches the backend server, initializes the database, executes the tests in headless Chromium, and outputs results.*

### 2.2 Interactive UI Debug Mode
Launch Playwright's time-travel interactive debugger:
```bash
npx playwright test --ui
```

### 2.3 Run a Single Targeted Scenario
```bash
# Run only Scenario 3 (Workflow Lifecycle & Reopen)
npx playwright test -g "Scenario 3"

# Run only Scenario 6 (Rework Tracking)
npx playwright test -g "Scenario 6"
```

### 2.4 View Test Execution Report
```bash
npx playwright show-report
```

---

## 3. Test Scenarios Traceability Matrix

| Test ID | Scenario Name | Target Requirements | Verification Gates |
| :--- | :--- | :--- | :--- |
| **SC-01** | Discrepancy Creation & Validation | FR-001..005, RULE-001, RULE-002 | Mandatory field validation, PED-ID sequence generation (`PED-xxxxxx`), manuscript linking. |
| **SC-02** | Search, Multi-Filter & CSV Export | FR-035..043, FR-044 | Full-text query, multi-select dropdown filtering, pagination bounds, RFC 4180 CSV export download. |
| **SC-03** | 7-Stage Workflow Lifecycle | FR-014..019, RULE-004, RULE-005 | Sequential stage advancement, resolution blocker when root cause is missing, audited reopen rationale. |
| **SC-04** | Investigator Assignment | FR-008..010 | Assignment allocation, assignment notes, timeline audit. |
| **SC-05** | Root Cause Tagging | FR-011..013, RULE-003 | Taxonomy tagging, primary cause selection, tag removal. |
| **SC-06** | Rework Effort Logging | FR-020..025, RULE-006 | Non-negative hours check (`hours >= 0`), live recalculation of `SUM(hours)`, hourly financial rate calculation. |
| **SC-07** | Executive Analytics & KPIs | FR-026..034 | Live KPI metrics (open counts, SLA breaches, rework cost), time trend graphs, journal rankings. |
| **SC-08** | Attribution Matrix & Governance | FR-022, RULE-010 | Editor handling matrix, non-punitive governance disclaimer rendering. |
| **SC-09** | Admin Taxonomy Configuration | FR-054..057 | CRUD on defect categories, root cause taxonomy, journal master records, and editor associations. |
| **SC-10** | Tamper-Evident Audit Trail | FR-050..053, RULE-008 | Chronological audit log verification, actor identification, before/after JSON delta inspection. |

---

## 4. CI/CD Pipeline Integration (Example GitHub Action)

To run the verification suite automatically on pull requests and commits:

```yaml
name: E2E Verification Suite

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js 24
      uses: actions/setup-node@v4
      with:
        node-version: 24
        
    - name: Install Dependencies
      run: npm install
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium
      
    - name: Run E2E Tests
      run: npm run test:e2e
      
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 14
```

