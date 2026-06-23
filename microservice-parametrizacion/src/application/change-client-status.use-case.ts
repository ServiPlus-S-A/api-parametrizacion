import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client.repository';
import type { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { ChangeClientStatusDto } from '../presentation/dto/change-client-status.dto';
import { AuditLogger } from '../transversal/audit.logger';

@Injectable()
export class ChangeClientStatusUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(
    id: string,
    dto: ChangeClientStatusDto,
    changedBy: string = 'system',
  ): Promise<{ id: string; status: 'Active' | 'Inactive'; mensaje: string }> {
    // a. 404 if client not found
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    // b. 409 if client has active solicitudes and we're deactivating
    if (dto.status === 'Inactive') {
      const hasSolicitudes = await this.clientRepository.hasActiveSolicitudes(id);
      if (hasSolicitudes) {
        // TODO: This check depends on the Solicitudes module which does not exist yet.
        // hasActiveSolicitudes() currently always returns false (stub).
        throw new ConflictException(
          `Client ${client.fullName} has active solicitudes and cannot be deactivated`,
        );
      }
    }

    // Idempotent: already in the requested status
    if (client.status === dto.status) {
      return { id: client.id, status: client.status, mensaje: 'Ok' };
    }

    // c. Logical update — never DELETE
    const updated = new ClientEntity(
      client.id,
      client.fullName,
      client.taxId,
      client.clientType,
      client.city,
      client.email,
      dto.status,
      client.createdAt,
      new Date(),
    );
    await this.clientRepository.save(updated);

    // d. Side effects when deactivating
    if (dto.status === 'Inactive') {
      await this.clientRepository.saveStatusHistory(
        client.id,
        client.status,
        dto.status,
        dto.motivo,
        changedBy,
      );

      this.closeActiveSessionIfExists(client.id);
    }

    this.auditLogger.logAction(changedBy, `CHANGE_STATUS_TO_${dto.status}`, client.id);

    return { id: updated.id, status: updated.status, mensaje: 'Ok' };
  }

  private closeActiveSessionIfExists(clientId: string): void {
    // TODO: Pendiente — no existe sistema de gestión de sesiones activas en el proyecto.
    // Este método debe integrarse cuando el módulo de autenticación/sesiones esté disponible.
    this.auditLogger.logAction(
      'system',
      'CLOSE_SESSION_STUB',
      clientId,
    );
  }
}
