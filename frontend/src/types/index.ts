export type DiscrepancyStatus = 
  | 'NEW' 
  | 'TRIAGED' 
  | 'ASSIGNED' 
  | 'IN PROGRESS' 
  | 'RESOLVED' 
  | 'VERIFIED' 
  | 'CLOSED' 
  | 'REOPENED';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type UserRole = 
  | 'Publisher' 
  | 'Editor' 
  | 'Editorial Manager' 
  | 'QA Analyst' 
  | 'Administrator' 
  | 'Reporting User';

export interface AppUser {
  id: number;
  external_user_id: string;
  display_name: string;
  email: string;
  role: UserRole;
  department?: string;
  active: number;
}

export interface Journal {
  id: number;
  journal_code: string;
  journal_name: string;
  issn?: string;
  discipline?: string;
  active: number;
}

export interface DefectCategory {
  id: number;
  category_code: string;
  category_name: string;
  parent_id?: number | null;
  description?: string;
  active: number;
  subcategories?: DefectCategory[];
}

export interface RootCause {
  id: number;
  cause_code: string;
  cause_name: string;
  category?: string;
  description?: string;
  active: number;
}

export interface ReworkEntry {
  id: number;
  discrepancy_id: number;
  performed_by: number;
  performer_name: string;
  performer_role?: string;
  hours: number;
  work_date: string;
  notes?: string;
  created_at: string;
}

export interface StatusHistoryItem {
  id: number;
  discrepancy_id: number;
  from_status: string;
  to_status: string;
  changed_by: number;
  changer_name: string;
  changer_role?: string;
  reason?: string;
  changed_at: string;
}

export interface AssignmentItem {
  id: number;
  discrepancy_id: number;
  assigned_by: number;
  assigner_name: string;
  assigned_to: number;
  assignee_name: string;
  notes?: string;
  assigned_at: string;
}

export interface DiscrepancyRootCauseItem {
  id: number;
  discrepancy_id: number;
  root_cause_id: number;
  cause_code: string;
  cause_name: string;
  root_cause_category?: string;
  investigation_notes?: string;
  logged_by_name: string;
  created_at: string;
}

export interface Discrepancy {
  id: number;
  reference_number: string;
  title: string;
  description: string;
  journal_id: number;
  journal_code: string;
  journal_name: string;
  category_id: number;
  category_name: string;
  sub_category_id?: number | null;
  sub_category_name?: string | null;
  created_by: number;
  creator_name: string;
  creator_role?: string;
  assigned_to?: number | null;
  assignee_name?: string | null;
  assignee_role?: string | null;
  related_editor_id?: number | null;
  related_editor_name?: string | null;
  status: DiscrepancyStatus;
  severity: SeverityLevel;
  priority: PriorityLevel;
  manuscript_reference?: string | null;
  identified_date: string;
  impact_description?: string | null;
  resolution_notes?: string | null;
  evidence_url?: string | null;
  total_rework_hours: number;
  root_cause_name?: string | null;
  created_at: string;
  updated_at: string;
  rootCauses?: DiscrepancyRootCauseItem[];
  reworkEntries?: ReworkEntry[];
  statusHistory?: StatusHistoryItem[];
  assignmentHistory?: AssignmentItem[];
  attachments?: any[];
}

export interface ExecutiveKPIs {
  totalDiscrepancies: number;
  openDiscrepancies: number;
  triagedDiscrepancies: number;
  resolvedDiscrepancies: number;
  closedDiscrepancies: number;
  reopenedDiscrepancies: number;
  criticalDiscrepancies: number;
  totalReworkHours: number;
  discrepanciesWithRework: number;
  avgResolutionDays: number;
  slaComplianceRate: number;
  topJournal: {
    journal_code: string;
    journal_name: string;
    rework_hours: number;
    discrepancies: number;
  } | null;
  topCategory: {
    category_code: string;
    category_name: string;
    rework_hours: number;
    discrepancies: number;
  } | null;
}

export interface AuditEvent {
  id: number;
  entity_type: string;
  entity_id: number;
  actor_id: number | null;
  actor_name: string;
  action: string;
  timestamp: string;
  old_values: string | null;
  new_values: string | null;
}

