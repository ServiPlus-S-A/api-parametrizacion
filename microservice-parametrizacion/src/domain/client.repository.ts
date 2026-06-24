import { ClientEntity } from './client.entity';

export interface IClientRepository {
  findById(id: string): Promise<ClientEntity | null>;
  findByEmail(email: string): Promise<ClientEntity | null>;
  findByTaxId(taxId: string): Promise<ClientEntity | null>;
  findByUserId(userId: string): Promise<ClientEntity | null>;
  userExists(userId: string): Promise<boolean>;
  findAndPaginate(filters: {
    fullName?: string;
    taxId?: string;
    city?: string;
    status?: 'Active' | 'Inactive';
    page: number;
  }): Promise<{ content: ClientEntity[]; totalPages: number }>;
  save(client: ClientEntity): Promise<ClientEntity>;
  /**
   * @stub Always returns false.
   * TODO: implement when the Solicitudes module exists.
   */
  hasActiveSolicitudes(id: string): Promise<boolean>;
  saveStatusHistory(
    clientId: string,
    previousStatus: 'Active' | 'Inactive',
    newStatus: 'Active' | 'Inactive',
    motivo: string,
    changedBy?: string,
  ): Promise<void>;
}

export const CLIENT_REPOSITORY_TOKEN = Symbol('IClientRepository');
