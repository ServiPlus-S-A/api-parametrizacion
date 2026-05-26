import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditLogger {
  private readonly logger = new Logger(AuditLogger.name);

  logAction(userId: string, action: string, resourceId: string) {
    this.logger.log(`Audit: User ${userId} performed ${action} on resource ${resourceId}`);
    // Save to audit table or log file
  }
}
