import { Injectable } from '@nestjs/common';

@Injectable()
export class ObserverEvent {
  // Pattern: Observe
  // Emits critical events like multiple failures for Webhooks/BullMQ
  emitCriticalAlert(eventName: string, payload: any) {
    console.log(`[Observer] Emitting event: ${eventName}`, payload);
    // Real implementation would send to BullMQ / Redis
  }
}
