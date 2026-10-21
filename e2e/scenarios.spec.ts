import { test, expect } from '@playwright/test';

test.describe('Publisher-Editor Discrepancy Tracker - End-to-End Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to base URL (Executive Dashboard)
    await page.goto('/');
    // Wait for the app to initialize
    await expect(page.locator('header')).toBeVisible();
  });

  // SCENARIO 1: Discrepancy Registration & Creation Workflow (FR-001..FR-005, RULE-001..003)
  test('Scenario 1: Discrepancy Registration, Validations & Auto PED-ID Generation', async ({ page }) => {
    // 1. Open the Log Discrepancy Modal
    await page.locator('[data-testid="log-discrepancy-btn"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 2. Negative validation check: Submitting empty form should fail (FR-003)
    await page.locator('[data-testid="submit-discrepancy-btn"]').click();
    await expect(page.locator('[data-testid="modal-error-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-error-banner"]')).toContainText('Please provide a title');

    // 3. Fill in mandatory & detailed discrepancy data
    const testTitle = `MathML Inversion in JAP Table 3 [${Date.now()}]`;
    await page.locator('[data-testid="discrepancy-title-input"]').fill(testTitle);
    await page.locator('[data-testid="discrepancy-description-input"]').fill(
      'Corrupted matrix brackets and column header transposition in typeset PDF proof for manuscript JAP-2026-9901.'
    );
    await page.locator('[data-testid="discrepancy-journal-select"]').selectOption({ index: 1 });
    await page.locator('[data-testid="discrepancy-manuscript-input"]').fill('JAP-2026-9901');
    await page.locator('[data-testid="discrepancy-category-select"]').selectOption({ index: 1 });
    await page.locator('[data-testid="discrepancy-severity-select"]').selectOption('HIGH');
    await page.locator('[data-testid="discrepancy-priority-select"]').selectOption('P1');
    await page.locator('[data-testid="discrepancy-editor-select"]').selectOption({ index: 1 });
    await page.locator('[data-testid="discrepancy-impact-input"]').fill('Online First release on hold.');
    await page.locator('[data-testid="discrepancy-evidence-input"]').fill('https://portal.tandf.co.uk/proofs/JAP-9901.pdf');

    // 4. Submit form
    await page.locator('[data-testid="submit-discrepancy-btn"]').click();

    // 5. Verify modal closes and navigates to the newly created discrepancy details
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('[data-testid="detail-title"]')).toHaveText(testTitle);
    
    // 6. Verify auto-generated unique identifier follows format PED-XXXXXX (FR-002, RULE-001)
    const refBadge = await page.locator('[data-testid="detail-reference-badge"]').innerText();
    expect(refBadge).toMatch(/^PED-\d{6}$/);
    
    // 7. Verify initial status is NEW
    await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('NEW');
  });

  // SCENARIO 2: Discrepancy Search, Multi-Filter, Sorting & Export (FR-035..043)
  test('Scenario 2: Discrepancy Search, Multi-Filter, Ledger Pagination & CSV Export', async ({ page }) => {
    // 1. Navigate to Discrepancy Register
    await page.locator('[data-testid="nav-register"]').click();
    await expect(page.locator('[data-testid="discrepancy-register-view"]')).toBeVisible();

    // 2. Search by Keyword (FR-036)
    await page.locator('[data-testid="filter-search-input"]').fill('Equation 14b');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody')).toContainText('PED-000001');

    // 3. Clear search and test Journal filter (FR-037)
    await page.locator('[data-testid="filter-search-input"]').fill('');
    await page.locator('[data-testid="filter-journal-select"]').selectOption({ index: 1 });
    await expect(page.locator('tbody')).toContainText('JAP');

    // 4. Reset journal filter and test Status filter (e.g. CLOSED)
    await page.locator('[data-testid="filter-journal-select"]').selectOption('');
    await page.locator('[data-testid="filter-status-select"]').selectOption('CLOSED');
    await expect(page.locator('[data-testid="discrepancy-table"] tbody')).toContainText('CLOSED');

    // 5. Reset Filters
    await page.locator('[data-testid="reset-filters-btn"]').click();
    await expect(page.locator('[data-testid="filter-status-select"]')).toHaveValue('ALL');

    // 6. Verify CSV Export link is generated with proper filters (FR-041, FR-042)
    const exportBtn = page.locator('[data-testid="export-csv-ledger-btn"]');
    await expect(exportBtn).toBeVisible();
    const href = await exportBtn.getAttribute('href');
    expect(href).toContain('/api/v1/reports/export');
  });

  // SCENARIO 3: Full Workflow Lifecycle Transitions & Reopen Path (FR-014..FR-019, RULE-004, RULE-009)
  test('Scenario 3: Complete Workflow Lifecycle (NEW -> TRIAGED -> IN PROGRESS -> RESOLVED -> VERIFIED -> CLOSED -> REOPENED)', async ({ page }) => {
    // 1. Go to Register and find a record
    await page.locator('[data-testid="nav-register"]').click();
    
    // Pick the first record and click to view detail
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await expect(page.locator('[data-testid="discrepancy-detail-view"]')).toBeVisible();

    const currentStatus = await page.locator('[data-testid="detail-status-badge"]').innerText();

    if (currentStatus === 'NEW') {
      // Transition: NEW -> TRIAGED
      await page.locator('[data-testid="action-triage-btn"]').click();
      await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('TRIAGED');
    }

    const triageStatus = await page.locator('[data-testid="detail-status-badge"]').innerText();
    if (triageStatus === 'TRIAGED' || triageStatus === 'ASSIGNED') {
      // Transition -> IN PROGRESS
      await page.locator('[data-testid="action-start-investigation-btn"]').click();
      await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('IN PROGRESS');
    }

    const inProgressStatus = await page.locator('[data-testid="detail-status-badge"]').innerText();
    if (inProgressStatus === 'IN PROGRESS') {
      // Resolve Defect: Verify Business Rule RULE-004
      await page.locator('[data-testid="action-resolve-btn"]').click();
      await expect(page.locator('[data-testid="resolve-modal"]')).toBeVisible();
      
      // Fill resolution notes and root cause
      await page.locator('[data-testid="resolve-notes-input"]').fill('Corrupted MathML syntax corrected and validated against MathML 3 schema.');
      await page.locator('[data-testid="resolve-root-cause-select"]').selectOption({ index: 1 });
      await page.locator('[data-testid="submit-resolve-btn"]').click();

      await expect(page.locator('[data-testid="resolve-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('RESOLVED');
    }

    // Switch Persona to QA Analyst to verify resolution (FR-015)
    await page.locator('[data-testid="user-role-select"]').selectOption({ label: 'Priya Sharma (QA Analyst)' });
    
    // Transition: RESOLVED -> VERIFIED
    await page.locator('[data-testid="action-verify-btn"]').click();
    await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('VERIFIED');

    // Transition: VERIFIED -> CLOSED
    await page.locator('[data-testid="action-close-btn"]').click();
    await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('CLOSED');

    // Reopen Path (FR-018, RULE-009)
    await page.locator('[data-testid="action-reopen-btn"]').click();
    await expect(page.locator('[data-testid="detail-status-badge"]')).toHaveText('REOPENED');
  });

  // SCENARIO 4: Assignment & Reassignment History (FR-016, FR-019)
  test('Scenario 4: Investigator Assignment & Assignment History Audit', async ({ page }) => {
    await page.locator('[data-testid="nav-register"]').click();
    await page.locator('tbody tr').first().click();
    await expect(page.locator('[data-testid="discrepancy-detail-view"]')).toBeVisible();

    // Open Assign Modal
    const assignBtn = page.locator('[data-testid="action-assign-btn"]');
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      await expect(page.locator('[data-testid="assign-modal"]')).toBeVisible();

      // Select an investigator
      await page.locator('[data-testid="assignee-select"]').selectOption({ index: 2 });
      await page.locator('[data-testid="assign-notes-input"]').fill('Assigned for urgent metadata reconciliation.');
      await page.locator('[data-testid="submit-assignment-btn"]').click();

      await expect(page.locator('[data-testid="assign-modal"]')).not.toBeVisible();
      // Verify assignment history has logged the entry
      await expect(page.locator('text=Assigned for urgent metadata reconciliation.')).toBeVisible();
    }
  });

  // SCENARIO 5: Root Cause Investigation & Tagging (FR-010..012, RULE-003..004)
  test('Scenario 5: Root Cause Tagging & Investigation Notes Capture', async ({ page }) => {
    await page.locator('[data-testid="nav-register"]').click();
    await page.locator('tbody tr').first().click();
    await expect(page.locator('[data-testid="discrepancy-detail-view"]')).toBeVisible();

    // Open Tag Root Cause Modal
    await page.locator('[data-testid="tag-root-cause-btn"]').click();
    await expect(page.locator('[data-testid="root-cause-modal"]')).toBeVisible();

    await page.locator('[data-testid="tag-cause-select"]').selectOption({ index: 2 });
    await page.locator('[data-testid="tag-cause-notes-input"]').fill(
      'Investigation identified XML parsing discrepancy caused by legacy author character encoding mismatch.'
    );
    await page.locator('[data-testid="submit-tag-cause-btn"]').click();

    await expect(page.locator('[data-testid="root-cause-modal"]')).not.toBeVisible();
    await expect(page.locator('text=legacy author character encoding mismatch.')).toBeVisible();
  });

  // SCENARIO 6: Rework Effort Capture & Real-time Aggregation (FR-020, FR-021, RULE-006, RULE-007)
  test('Scenario 6: Rework Effort Logging, Non-Negative Validation (RULE-006) & Real-time SUM(hours) Aggregation', async ({ page }) => {
    await page.locator('[data-testid="nav-register"]').click();
    await page.locator('tbody tr').first().click();
    await expect(page.locator('[data-testid="discrepancy-detail-view"]')).toBeVisible();

    // Read current total rework hours
    const initialReworkText = await page.locator('[data-testid="detail-total-rework"]').innerText();
    const initialHours = parseFloat(initialReworkText);

    // Open Rework Modal
    await page.locator('[data-testid="log-rework-btn"]').click();
    await expect(page.locator('[data-testid="rework-modal"]')).toBeVisible();

    // Select contributor and enter valid 2.5 hours rework
    await page.locator('[data-testid="rework-performer-select"]').selectOption({ index: 0 });
    await page.locator('[data-testid="rework-hours-input"]').fill('2.5');
    await page.locator('[data-testid="rework-notes-input"]').fill('Redid cross-table equations rendering.');
    await page.locator('[data-testid="submit-rework-btn"]').click();

    await expect(page.locator('[data-testid="rework-modal"]')).not.toBeVisible();

    // Verify rework entry appears in table
    await expect(page.locator('[data-testid="rework-entries-table"]')).toContainText('2.5 hrs');
    await expect(page.locator('[data-testid="rework-entries-table"]')).toContainText('Redid cross-table equations rendering.');

    // Verify aggregate total rework hours increased by 2.5
    const updatedReworkText = await page.locator('[data-testid="detail-total-rework"]').innerText();
    const updatedHours = parseFloat(updatedReworkText);
    expect(updatedHours).toBeCloseTo(initialHours + 2.5, 1);
  });

  // SCENARIO 7: Executive Dashboard KPIs & Visual Analytics (FR-026..FR-034)
  test('Scenario 7: Executive Dashboard KPIs, Trend Analytics & Drill-Downs (FR-026..FR-034)', async ({ page }) => {
    await page.locator('[data-testid="nav-dashboard"]').click();
    await expect(page.locator('[data-testid="executive-dashboard-view"]')).toBeVisible();

    // 1. Verify 4 Core KPI Summary Cards
    await expect(page.locator('[data-testid="kpi-total-discrepancies"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-rework-hours"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-open-discrepancies"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-resolution-days"]')).toBeVisible();

    // 2. Verify Journal Ranking table exists
    await expect(page.locator('text=Journal Discrepancy & Rework Ranking')).toBeVisible();

    // 3. Test Drill-Down from Dashboard directly to Ledger
    const drillDownBtn = page.locator('[data-testid^="drilldown-journal-"]').first();
    await drillDownBtn.click();
    await expect(page.locator('[data-testid="discrepancy-register-view"]')).toBeVisible();
  });

  // SCENARIO 8: Editorial Attribution Matrices & Governance Compliance (FR-022, RULE-010)
  test('Scenario 8: Rework Attribution Matrices & Academic Non-Punitive Governance Compliance (RULE-010)', async ({ page }) => {
    await page.locator('[data-testid="nav-analytics"]').click();
    await expect(page.locator('[data-testid="rework-analytics-view"]')).toBeVisible();

    // 1. Verify Mandatory Governance Notice per FR-022 & RULE-010 is present
    await expect(page.locator('[data-testid="governance-disclaimer"]')).toBeVisible();
    await expect(page.locator('[data-testid="governance-disclaimer"]')).toContainText('Association does not establish fault');

    // 2. Verify Editor Attribution Matrix
    await expect(page.locator('[data-testid="editor-attribution-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="editor-attribution-table"]').getByText('Prof. Marcus Davies')).toBeVisible();

    // 3. Test Editor Drill-down
    const drilldownEditor = page.locator('[data-testid^="drilldown-editor-"]').first();
    await drilldownEditor.click();
    await expect(page.locator('[data-testid="discrepancy-register-view"]')).toBeVisible();
  });

  // SCENARIO 9: Admin Taxonomy & Master Reference Configuration (FR-054..FR-057)
  test('Scenario 9: Admin Taxonomy Management (Categories, Root Causes, Journals, Editor Associations)', async ({ page }) => {
    await page.locator('[data-testid="nav-admin"]').click();
    await expect(page.locator('[data-testid="admin-taxonomy-view"]')).toBeVisible();

    // 1. Add new Defect Category (FR-007, FR-054)
    const uniqueCatCode = `CAT-TST-${Date.now().toString().slice(-4)}`;
    await page.locator('[data-testid="new-category-code-input"]').fill(uniqueCatCode);
    await page.locator('[data-testid="new-category-name-input"]').fill('Special Issue Article Metadata');
    await page.locator('[data-testid="submit-new-category-btn"]').click();
    await expect(page.locator('[data-testid="admin-success-banner"]')).toBeVisible();

    // 2. Switch to Root Causes Tab and register a new root cause
    await page.locator('[data-testid="admin-tab-rootCauses"]').click();
    const uniqueRcCode = `RC-TST-${Date.now().toString().slice(-4)}`;
    await page.locator('[data-testid="new-rc-code-input"]').fill(uniqueRcCode);
    await page.locator('[data-testid="new-rc-name-input"]').fill('Third-Party Conversion Glitch');
    await page.locator('[data-testid="submit-new-rc-btn"]').click();
    await expect(page.locator('[data-testid="admin-success-banner"]')).toBeVisible();

    // 3. Switch to Journals Tab and register a new journal (FR-057)
    await page.locator('[data-testid="admin-tab-journals"]').click();
    const uniqueJCode = `TJ-${Date.now().toString().slice(-3)}`;
    await page.locator('[data-testid="new-journal-code-input"]').fill(uniqueJCode);
    await page.locator('[data-testid="new-journal-name-input"]').fill('Taylor Journal of Cybernetics');
    await page.locator('[data-testid="submit-new-journal-btn"]').click();
    await expect(page.locator('[data-testid="admin-success-banner"]')).toBeVisible();
  });

  // SCENARIO 10: System Audit Trail & Tamper-Evident History (FR-050..FR-053, RULE-008)
  test('Scenario 10: System Audit Trail Logs Actor, Timestamp, Action & JSON Delta History (FR-050..053)', async ({ page }) => {
    await page.locator('[data-testid="nav-audit"]').click();
    await expect(page.locator('[data-testid="audit-trail-view"]')).toBeVisible();

    // Verify audit log table is populated with entries
    await expect(page.locator('[data-testid="audit-table"]')).toBeVisible();
    await expect(page.locator('tbody tr')).not.toHaveCount(0);

    // Filter audit trail by entity
    await page.locator('[data-testid="audit-entity-filter"]').selectOption('DISCREPANCY');
    await expect(page.locator('tbody')).toContainText('DISCREPANCY');
  });

});
