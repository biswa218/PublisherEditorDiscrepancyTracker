import { run, query } from '../db/database.js';

export interface AuditEventRecord {
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

export function logAuditEvent(
  entityType: string,
  entityId: number,
  actorId: number | null,
  actorName: string,
  action: string,
  oldValues?: any,
  newValues?: any
): void {
  run(
    `INSERT INTO audit_events (entity_type, entity_id, actor_id, actor_name, action, old_values, new_values)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      entityType,
      entityId,
      actorId,
      actorName,
      action,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null
    ]
  );
}

export function getAuditEvents(entityType?: string, entityId?: number, limit: number = 100): AuditEventRecord[] {
  if (entityType && entityId) {
    return query<AuditEventRecord>(
      `SELECT * FROM audit_events WHERE entity_type = ? AND entity_id = ? ORDER BY id DESC LIMIT ?`,
      [entityType, entityId, limit]
    );
  }
  if (entityType) {
    return query<AuditEventRecord>(
      `SELECT * FROM audit_events WHERE entity_type = ? ORDER BY id DESC LIMIT ?`,
      [entityType, limit]
    );
  }
  return query<AuditEventRecord>(
    `SELECT * FROM audit_events ORDER BY id DESC LIMIT ?`,
    [limit]
  );
}

