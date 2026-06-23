import { ClientEntity } from './client.entity';

export interface IClientRepository {
  save(client: ClientEntity): Promise<ClientEntity>;
  findById(id: string): Promise<ClientEntity | null>;
  findByEmail(email: string): Promise<ClientEntity | null>;
  findByTaxId(taxId: string): Promise<ClientEntity | null>;
  userExists(userId: string): Promise<boolean>;
}

export const CLIENT_REPOSITORY_TOKEN = Symbol('IClientRepository');
