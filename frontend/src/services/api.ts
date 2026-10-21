import { 
  Discrepancy, 
  Journal, 
  DefectCategory, 
  RootCause, 
  AppUser, 
  ExecutiveKPIs, 
  AuditEvent 
} from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Discrepancies
  async getDiscrepancies(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        searchParams.append(key, String(value));
      }
    }
    const res = await fetch(`${API_BASE}/discrepancies?${searchParams.toString()}`);
    return handleResponse<{ items: Discrepancy[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(res);
  },

  async getDiscrepancy(id: number) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}`);
    return handleResponse<Discrepancy>(res);
  },

  async createDiscrepancy(data: any) {
    const res = await fetch(`${API_BASE}/discrepancies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  async updateDiscrepancy(id: number, data: any) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  async transitionStatus(id: number, data: { to_status: string; user_id: number; user_name: string; user_role?: string; reason?: string; resolution_notes?: string; root_cause_id?: number }) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}/transitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  async assignDiscrepancy(id: number, data: { assignee_id: number; assigned_by: number; assigner_name: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  async logRework(id: number, data: { performed_by: number; hours: number; work_date: string; notes?: string; actor_id: number; actor_name: string }) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}/rework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  async tagRootCause(id: number, data: { root_cause_id: number; notes?: string; user_id: number; user_name: string }) {
    const res = await fetch(`${API_BASE}/discrepancies/${id}/root-causes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Discrepancy>(res);
  },

  // Analytics
  async getSummaryKPIs() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return handleResponse<ExecutiveKPIs>(res);
  },

  async getReworkByJournal() {
    const res = await fetch(`${API_BASE}/analytics/by-journal`);
    return handleResponse<any[]>(res);
  },

  async getReworkByEditor() {
    const res = await fetch(`${API_BASE}/analytics/by-editor`);
    return handleResponse<any[]>(res);
  },

  async getReworkByCategory() {
    const res = await fetch(`${API_BASE}/analytics/by-category`);
    return handleResponse<any[]>(res);
  },

  async getRootCauseDistribution() {
    const res = await fetch(`${API_BASE}/analytics/by-root-cause`);
    return handleResponse<any[]>(res);
  },

  async getTrends() {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    return handleResponse<any[]>(res);
  },

  // Metadata
  async getJournals(includeInactive = false) {
    const res = await fetch(`${API_BASE}/journals?includeInactive=${includeInactive}`);
    return handleResponse<Journal[]>(res);
  },

  async createJournal(data: Partial<Journal> & { actor_id?: number; actor_name?: string }) {
    const res = await fetch(`${API_BASE}/journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Journal>(res);
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<DefectCategory[]>(res);
  },

  async createCategory(data: Partial<DefectCategory> & { actor_id?: number; actor_name?: string }) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<DefectCategory>(res);
  },

  async getRootCauses() {
    const res = await fetch(`${API_BASE}/root-causes`);
    return handleResponse<RootCause[]>(res);
  },

  async createRootCause(data: Partial<RootCause> & { actor_id?: number; actor_name?: string }) {
    const res = await fetch(`${API_BASE}/root-causes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RootCause>(res);
  },

  async getUsers(role?: string) {
    const url = role ? `${API_BASE}/users?role=${encodeURIComponent(role)}` : `${API_BASE}/users`;
    const res = await fetch(url);
    return handleResponse<AppUser[]>(res);
  },

  async getEditorsWithJournals() {
    const res = await fetch(`${API_BASE}/users/editors`);
    return handleResponse<any[]>(res);
  },

  async associateEditorJournal(data: { editor_id: number; journal_id: number; role_title?: string; actor_id?: number; actor_name?: string }) {
    const res = await fetch(`${API_BASE}/users/editor-journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  // Audit
  async getAuditTrail(entityType?: string, entityId?: number) {
    let url = `${API_BASE}/admin/audit`;
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', String(entityId));
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return handleResponse<AuditEvent[]>(res);
  },

  // Reset/reseed
  async resetSeed() {
    const res = await fetch(`${API_BASE}/admin/reset-seed`, { method: 'POST' });
    return handleResponse<any>(res);
  },

  // Export CSV URL builder
  getExportUrl(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        searchParams.append(key, String(value));
      }
    }
    return `${API_BASE}/reports/export?${searchParams.toString()}`;
  }
};

