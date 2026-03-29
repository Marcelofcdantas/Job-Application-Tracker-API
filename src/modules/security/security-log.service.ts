import { AuditLogRepository } from "./audit-log.repository.js";
import { logger } from "../../utils/logger.js";

export class SecurityLogService {
  private repo = new AuditLogRepository();

  async record(event: string, payload: {
    userId?: string | null;
    ipAddress?: string | null;
    metadata?: Record<string, unknown> | null;
  } = {}) {
    logger.info({ securityEvent: event, ...payload }, "Security event");
    await this.repo.create({
      userId: payload.userId ?? null,
      event,
      ipAddress: payload.ipAddress ?? null,
      metadata: payload.metadata ?? null
    });
  }
}
