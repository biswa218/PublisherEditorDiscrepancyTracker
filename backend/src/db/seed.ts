import { getDb, exec, run, query } from './database.js';

export function seedData() {
  const db = getDb();
  console.log('--- Initializing database seed data ---');

  // Clear existing data in reverse order of foreign keys
  db.exec(`
    DELETE FROM corrective_actions;
    DELETE FROM attachments;
    DELETE FROM audit_events;
    DELETE FROM status_history;
    DELETE FROM assignments;
    DELETE FROM rework_entries;
    DELETE FROM discrepancy_root_causes;
    DELETE FROM discrepancies;
    DELETE FROM root_causes;
    DELETE FROM defect_categories;
    DELETE FROM editor_journals;
    DELETE FROM journals;
    DELETE FROM app_users;
    DELETE FROM sqlite_sequence;
  `);

  // 1. Users
  const users = [
    { external_id: 'USR-PUB-01', name: 'Eleanor Vance', email: 'eleanor.vance@tandf.co.uk', role: 'Publisher', dept: 'Production Operations' },
    { external_id: 'USR-ED-01', name: 'Prof. Marcus Davies', email: 'm.davies@tandf.academic.org', role: 'Editor', dept: 'Biosciences & Precision Engineering' },
    { external_id: 'USR-ED-02', name: 'Dr. Sarah Jenkins', email: 's.jenkins@tandf.academic.org', role: 'Editor', dept: 'Digital Systems & Modern Materials' },
    { external_id: 'USR-ED-03', name: 'Prof. Chen Wei', email: 'c.wei@tandf.academic.org', role: 'Editor', dept: 'Social Sciences & Humanities' },
    { external_id: 'USR-MGR-01', name: 'Liam O\'Connor', email: 'liam.oconnor@tandf.co.uk', role: 'Editorial Manager', dept: 'Editorial Quality Operations' },
    { external_id: 'USR-QA-01', name: 'Priya Sharma', email: 'priya.sharma@tandf.co.uk', role: 'QA Analyst', dept: 'Scholarly Integrity & QA' },
    { external_id: 'USR-ADM-01', name: 'Arthur Pendelton', email: 'arthur.pendelton@tandf.co.uk', role: 'Administrator', dept: 'Enterprise Systems' },
    { external_id: 'USR-REP-01', name: 'Diana Prince', email: 'diana.prince@tandf.co.uk', role: 'Reporting User', dept: 'Executive Governance' }
  ];

  for (const u of users) {
    run(
      `INSERT INTO app_users (external_user_id, display_name, email, role, department) VALUES (?, ?, ?, ?, ?)`,
      [u.external_id, u.name, u.email, u.role, u.dept]
    );
  }

  // 2. Journals
  const journals = [
    { code: 'JAP', name: 'Journal of Academic Precision', issn: '2045-8123', discipline: 'Multidisciplinary / Methodology' },
    { code: 'CRB', name: 'Critical Review of Bioscience', issn: '1098-4421', discipline: 'Life Sciences' },
    { code: 'IJDS', name: 'Int. Journal of Digital Scholarly Systems', issn: '2573-9901', discipline: 'Computer & Information Science' },
    { code: 'AMM', name: 'Annals of Modern Materials', issn: '1943-2210', discipline: 'Materials Engineering' },
    { code: 'SSHR', name: 'Social Sciences & Humanities Review', issn: '2168-5541', discipline: 'Humanities & Social Sciences' },
    { code: 'EQA', name: 'Environmental Quality & Agriculture', issn: '1532-6893', discipline: 'Agriculture & Ecology' }
  ];

  for (const j of journals) {
    run(
      `INSERT INTO journals (journal_code, journal_name, issn, discipline) VALUES (?, ?, ?, ?)`,
      [j.code, j.name, j.issn, j.discipline]
    );
  }

  // 3. Editor-Journal Associations
  // Davies -> JAP (1) and CRB (2)
  // Jenkins -> IJDS (3) and AMM (4)
  // Chen Wei -> SSHR (5)
  run(`INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date) VALUES (2, 1, 'Editor-in-Chief', '2022-01-01')`);
  run(`INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date) VALUES (2, 2, 'Senior Associate Editor', '2023-03-15')`);
  run(`INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date) VALUES (3, 3, 'Editor-in-Chief', '2021-08-01')`);
  run(`INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date) VALUES (3, 4, 'Section Editor', '2022-05-10')`);
  run(`INSERT INTO editor_journals (editor_id, journal_id, role_title, start_date) VALUES (4, 5, 'Editor-in-Chief', '2020-11-20')`);

  // 4. Categories & Subcategories
  const parentCats = [
    { code: 'CAT-META', name: 'Manuscript Metadata', desc: 'Author names, affiliations, funding, abstracts, and identifiers' },
    { code: 'CAT-WORKFLOW', name: 'Editorial Workflow', desc: 'Review process, milestone transitions, and submission handling' },
    { code: 'CAT-PEER', name: 'Peer Review Integrity', desc: 'Reviewer conflicts, anonymization, and recommendation audits' },
    { code: 'CAT-CONFIG', name: 'Journal Configuration', desc: 'Style sheet rules, special issues, and taxonomies' },
    { code: 'CAT-SUBMIT', name: 'Submission Validation', desc: 'File formatting, figures, tables, and compile checks' },
    { code: 'CAT-PROD', name: 'Production Handoff', desc: 'Proof generation, typesetter parity, and galley XML' },
    { code: 'CAT-COMM', name: 'Communication & Notices', desc: 'Author correspondence, editorial board queries, and disputes' },
    { code: 'CAT-QUAL', name: 'Publishing Quality', desc: 'DOI resolution, indexing deposits, and digital parity' },
    { code: 'CAT-COMP', name: 'Policy Compliance', desc: 'Ethics statements, data availability, and open access licenses' }
  ];

  for (const c of parentCats) {
    run(`INSERT INTO defect_categories (category_code, category_name, description) VALUES (?, ?, ?)`, [c.code, c.name, c.desc]);
  }

  // Subcategories
  const subCats = [
    { code: 'SUB-AFFIL', name: 'Affiliation & ORCID Mismatch', parent_id: 1, desc: 'Mismatch between registered affiliation and final galley XML' },
    { code: 'SUB-FUND', name: 'Funding & Grant Info Error', parent_id: 1, desc: 'Funder DOI or award number omitted or truncated' },
    { code: 'SUB-REV-CONS', name: 'Reviewer Consent Missing', parent_id: 2, desc: 'Peer review completed without verifiable consent token' },
    { code: 'SUB-ANON', name: 'Double-blind Anonymization Leak', parent_id: 3, desc: 'Author identification exposed in manuscript metadata' },
    { code: 'SUB-XML-PARITY', name: 'Galley Proof XML Discrepancy', parent_id: 6, desc: 'Mathematical formula or tabular alignment mismatch in typeset PDF' },
    { code: 'SUB-DOI-FAIL', name: 'CrossRef DOI Deposit Failure', parent_id: 8, desc: 'Deposit rejected due to invalid schema or duplicate suffix' }
  ];

  for (const sc of subCats) {
    run(`INSERT INTO defect_categories (category_code, category_name, parent_id, description) VALUES (?, ?, ?, ?)`, [sc.code, sc.name, sc.parent_id, sc.desc]);
  }

  // 5. Root Causes
  const rootCauses = [
    { code: 'RC-HUMAN', name: 'Human Error', cat: 'Human', desc: 'Manual transcription mistake or overlooked guideline' },
    { code: 'RC-PROC', name: 'Process Gap', cat: 'Process', desc: 'Ambiguous SOP or lack of milestone validation checkpoint' },
    { code: 'RC-TRAIN', name: 'Training Gap', cat: 'Training', desc: 'Unfamiliarity with editorial guidelines or tooling updates' },
    { code: 'RC-SYS', name: 'System Defect', cat: 'System', desc: 'CMS parsing bug, XML serializer flaw, or state sync error' },
    { code: 'RC-CONFIG', name: 'Configuration Issue', cat: 'Configuration', desc: 'Incorrect journal profile or metadata mapping table' },
    { code: 'RC-DATA', name: 'Data Quality', cat: 'Data', desc: 'Corrupted incoming author submission data or character encoding issue' },
    { code: 'RC-INTEG', name: 'Integration Failure', cat: 'Integration', desc: 'Timeout or contract mismatch with third-party service (e.g. CrossRef/ORCID)' },
    { code: 'RC-COMM', name: 'Communication Gap', cat: 'Communication', desc: 'Unanswered editorial queries between publisher and managing editor' },
    { code: 'RC-UNDET', name: 'Undetermined', cat: 'Triage', desc: 'Initial triage status prior to formal root cause investigation' }
  ];

  for (const rc of rootCauses) {
    run(`INSERT INTO root_causes (cause_code, cause_name, category, description) VALUES (?, ?, ?, ?)`, [rc.code, rc.name, rc.cat, rc.desc]);
  }

  // 6. Seed Discrepancies
  const discrepancies = [
    {
      ref: 'PED-000001',
      title: 'Galley Proof XML Discrepancy in Equation 14b',
      desc: 'Subscript characters inverted during TeX-to-JATS XML handoff on manuscript DEMO-2026-001. Lead author flagged discrepancy on page 7.',
      journal_id: 1,
      cat_id: 6,
      sub_cat_id: 14,
      created_by: 1, // Eleanor Vance
      assigned_to: 6, // Priya Sharma (QA)
      related_editor_id: 2, // Prof. Davies
      status: 'CLOSED',
      severity: 'HIGH',
      priority: 'P1',
      ms_ref: 'JAP-2026-08912',
      identified_date: '2026-10-01',
      impact: 'Delay in publication online first; galley rebuild necessary.',
      resolution_notes: 'Typesetter redid mathematical rendering and re-validated XML against MathML 3 schema.',
      closed_at: '2026-10-05T14:20:00Z',
      rework: [
        { performer: 6, hours: 3.5, date: '2026-10-02', notes: 'QA schema validation and MathML tree inspection' },
        { performer: 1, hours: 2.0, date: '2026-10-03', notes: 'Author proof coordination and re-export verification' }
      ],
      root_cause_id: 4 // System Defect
    },
    {
      ref: 'PED-000002',
      title: 'Author Affiliation and ORCID Mismatch on Accepted Paper',
      desc: 'Second author affiliation institution listed as Oxford instead of Cambridge; ORCID attached to third author incorrectly.',
      journal_id: 1,
      cat_id: 1,
      sub_cat_id: 10,
      created_by: 2, // Marcus Davies
      assigned_to: 5, // Liam O'Connor
      related_editor_id: 2,
      status: 'VERIFIED',
      severity: 'MEDIUM',
      priority: 'P2',
      ms_ref: 'JAP-2026-09022',
      identified_date: '2026-10-03',
      impact: 'Funder metadata compliance delayed.',
      resolution_notes: 'Corrected author affiliations in submission system and verified against author institution registry.',
      rework: [
        { performer: 5, hours: 1.5, date: '2026-10-04', notes: 'Manual correction of metadata registry' },
        { performer: 6, hours: 1.0, date: '2026-10-05', notes: 'ORCID checksum validation' }
      ],
      root_cause_id: 6 // Data Quality
    },
    {
      ref: 'PED-000003',
      title: 'Reviewer Identity Leak in Anonymized Peer Review Report',
      desc: 'Reviewer comments PDF contained unstripped track changes and username in metadata properties, compromising double-blind integrity.',
      journal_id: 2,
      cat_id: 3,
      sub_cat_id: 13,
      created_by: 1,
      assigned_to: 5,
      related_editor_id: 2,
      status: 'RESOLVED',
      severity: 'CRITICAL',
      priority: 'P1',
      ms_ref: 'CRB-2026-00431',
      identified_date: '2026-10-06',
      impact: 'Requires reviewer consultation and author reassurance regarding impartiality.',
      resolution_notes: 'Sanitized metadata using automated scrub script and updated editorial office intake checklist.',
      rework: [
        { performer: 5, hours: 4.5, date: '2026-10-07', notes: 'Incident response, reviewer outreach, and file scrubbing' },
        { performer: 6, hours: 2.0, date: '2026-10-08', notes: 'Systematic PDF metadata audit' }
      ],
      root_cause_id: 2 // Process Gap
    },
    {
      ref: 'PED-000004',
      title: 'CrossRef DOI Deposit Failed Due to Suffix Collision',
      desc: 'Automated deposit job received 409 Conflict from CrossRef REST API for issue volume 44.',
      journal_id: 3,
      cat_id: 8,
      sub_cat_id: 15,
      created_by: 1,
      assigned_to: 7, // Arthur Pendelton (Admin)
      related_editor_id: 3, // Dr. Jenkins
      status: 'IN PROGRESS',
      severity: 'HIGH',
      priority: 'P2',
      ms_ref: 'IJDS-2026-1184',
      identified_date: '2026-10-10',
      impact: 'Articles online without working DOIs for 48 hours.',
      rework: [
        { performer: 7, hours: 5.0, date: '2026-10-11', notes: 'Investigating CrossRef deposit payload logs and XML syntax' }
      ],
      root_cause_id: 7 // Integration Failure
    },
    {
      ref: 'PED-000005',
      title: 'Missing Reviewer Consent Token on Transferred Manuscript',
      desc: 'Manuscript transferred from sister journal arrived without signed reviewer consent records for secondary evaluation.',
      journal_id: 4,
      cat_id: 2,
      sub_cat_id: 12,
      created_by: 3, // Sarah Jenkins
      assigned_to: 5,
      related_editor_id: 3,
      status: 'ASSIGNED',
      severity: 'MEDIUM',
      priority: 'P3',
      ms_ref: 'AMM-2026-0331',
      identified_date: '2026-10-12',
      impact: 'Review progression halted awaiting consent confirmation.',
      rework: [
        { performer: 5, hours: 1.0, date: '2026-10-13', notes: 'Drafting retroactive consent dispatch' }
      ],
      root_cause_id: 8 // Communication Gap
    },
    {
      ref: 'PED-000006',
      title: 'Funder Award Grant ID Omitted from Production Galley',
      desc: 'National Science Foundation grant CHE-2201994 missing from acknowledgment section in production proof.',
      journal_id: 2,
      cat_id: 1,
      sub_cat_id: 11,
      created_by: 1,
      assigned_to: 6,
      related_editor_id: 2,
      status: 'TRIAGED',
      severity: 'LOW',
      priority: 'P3',
      ms_ref: 'CRB-2026-00512',
      identified_date: '2026-10-14',
      impact: 'Author query raised before final online index publication.',
      rework: [],
      root_cause_id: 9 // Undetermined
    },
    {
      ref: 'PED-000007',
      title: 'Corrupted Vector Graphic in Figure 5 High-Res Proof',
      desc: 'CMYK color profile inversion converted greyscale histology image into illegible false-color banding.',
      journal_id: 2,
      cat_id: 5,
      sub_cat_id: null,
      created_by: 1,
      assigned_to: null,
      related_editor_id: 2,
      status: 'NEW',
      severity: 'HIGH',
      priority: 'P2',
      ms_ref: 'CRB-2026-00550',
      identified_date: '2026-10-16',
      impact: 'Print galley run on hold pending re-rasterization.',
      rework: [],
      root_cause_id: 9 // Undetermined
    },
    {
      ref: 'PED-000008',
      title: 'Ethics Statement Missing in Special Issue Editorial',
      desc: 'Guest editorial published without standard COPE ethics disclosure statement as required by policy.',
      journal_id: 5,
      cat_id: 9,
      sub_cat_id: null,
      created_by: 4, // Chen Wei
      assigned_to: 5,
      related_editor_id: 4,
      status: 'RESOLVED',
      severity: 'MEDIUM',
      priority: 'P2',
      ms_ref: 'SSHR-2026-ED01',
      identified_date: '2026-10-08',
      impact: 'Addendum required for published editorial note.',
      resolution_notes: 'Published formal correction note and updated Special Issue template.',
      rework: [
        { performer: 5, hours: 2.0, date: '2026-10-09', notes: 'Prepared erratum text and verified with COPE standards' }
      ],
      root_cause_id: 2 // Process Gap
    },
    {
      ref: 'PED-000009',
      title: 'Editorial Board Roster Desync on Journal Homepage',
      desc: 'Departed editorial board members still displayed on Taylor & Francis Online page 6 months after term expiry.',
      journal_id: 1,
      cat_id: 4,
      sub_cat_id: null,
      created_by: 2,
      assigned_to: 7,
      related_editor_id: 2,
      status: 'CLOSED',
      severity: 'LOW',
      priority: 'P4',
      ms_ref: null,
      identified_date: '2026-09-20',
      impact: 'Public-facing academic governance compliance error.',
      resolution_notes: 'Synchronized Editorial Manager roster with web CMS portal.',
      closed_at: '2026-09-25T11:00:00Z',
      rework: [
        { performer: 7, hours: 3.0, date: '2026-09-22', notes: 'CMS configuration and database cache purge' }
      ],
      root_cause_id: 5 // Configuration Issue
    },
    {
      ref: 'PED-000010',
      title: 'Reopened: Supplementary Dataset Link 404 in Published PDF',
      desc: 'Zenodo repository link cited in Section 4.2 points to private unreleased repository token.',
      journal_id: 3,
      cat_id: 8,
      sub_cat_id: null,
      created_by: 1,
      assigned_to: 6,
      related_editor_id: 3,
      status: 'REOPENED',
      severity: 'HIGH',
      priority: 'P1',
      ms_ref: 'IJDS-2026-0994',
      identified_date: '2026-10-15',
      impact: 'Data availability mandate violated; paper flagged by readers.',
      resolution_notes: 'Previous resolution assumed author had unlocked repository, but permissions remained restricted.',
      rework: [
        { performer: 6, hours: 2.5, date: '2026-10-15', notes: 'Re-opened investigation and author re-contact' }
      ],
      root_cause_id: 1 // Human Error
    }
  ];

  for (const d of discrepancies) {
    const res = run(`
      INSERT INTO discrepancies (
        reference_number, title, description, journal_id, category_id, sub_category_id,
        created_by, assigned_to, related_editor_id, status, severity, priority,
        manuscript_reference, identified_date, impact_description, resolution_notes, closed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      d.ref, d.title, d.desc, d.journal_id, d.cat_id, d.sub_cat_id,
      d.created_by, d.assigned_to, d.related_editor_id, d.status, d.severity, d.priority,
      d.ms_ref, d.identified_date, d.impact, d.resolution_notes || null, d.closed_at || null
    ]);

    const discId = Number(res.lastInsertRowid);

    // Discrepancy Root Cause link
    if (d.root_cause_id) {
      run(`
        INSERT INTO discrepancy_root_causes (discrepancy_id, root_cause_id, investigation_notes, created_by)
        VALUES (?, ?, ?, ?)
      `, [discId, d.root_cause_id, `Investigation logged during triage for ${d.ref}`, d.created_by]);
    }

    // Rework entries
    if (d.rework && d.rework.length > 0) {
      for (const rw of d.rework) {
        run(`
          INSERT INTO rework_entries (discrepancy_id, performed_by, hours, work_date, notes)
          VALUES (?, ?, ?, ?, ?)
        `, [discId, rw.performer, rw.hours, rw.date, rw.notes]);
      }
    }

    // Status History
    run(`
      INSERT INTO status_history (discrepancy_id, from_status, to_status, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [discId, 'NEW', d.status, d.created_by, `Lifecycle progression to ${d.status}`]);

    // Assignments
    if (d.assigned_to) {
      run(`
        INSERT INTO assignments (discrepancy_id, assigned_by, assigned_to, notes)
        VALUES (?, ?, ?, ?)
      `, [discId, 5, d.assigned_to, `Operational assignment for triage/resolution`]);
    }

    // Audit Event
    run(`
      INSERT INTO audit_events (entity_type, entity_id, actor_id, actor_name, action, old_values, new_values)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'DISCREPANCY',
      discId,
      d.created_by,
      d.created_by === 1 ? 'Eleanor Vance' : 'Prof. Marcus Davies',
      'CREATE_DISCREPANCY',
      null,
      JSON.stringify({ reference: d.ref, title: d.title, status: d.status, severity: d.severity })
    ]);
  }

  console.log('--- Database seeding completed successfully! ---');
}

// Run directly if invoked from command line
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedData();
}
