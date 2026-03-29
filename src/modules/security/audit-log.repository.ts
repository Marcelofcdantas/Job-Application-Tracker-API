import { AuditLog } from "./audit-log.model.js";

export class AuditLogRepository {
  async create(data: {
    userId?: string | null;
    event: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return AuditLog.create({
      userId: data.userId ?? null,
      event: data.event,
      ipAddress: data.ipAddress ?? null,
      metadata: data.metadata ?? null
    });
  }
}
