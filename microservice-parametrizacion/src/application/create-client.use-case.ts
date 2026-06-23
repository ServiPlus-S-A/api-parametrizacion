import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client.repository';
import type { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { CreateClientDto } from './create-client.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(dto: CreateClientDto, createdById: string): Promise<ClientEntity> {
    // Check uniqueness of email
    const existingByEmail = await this.clientRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException(
        `Ya existe un cliente registrado con el correo ${dto.email}`,
      );
    }

    // Check uniqueness of taxId (NIT / cédula)
    const existingByTaxId = await this.clientRepository.findByTaxId(dto.taxId);
    if (existingByTaxId) {
      throw new ConflictException(
        `Ya existe un cliente registrado con el NIT/cédula ${dto.taxId}`,
      );
    }

    const newClient = new ClientEntity(
      uuidv4(),
      dto.fullName,
      dto.taxId,
      dto.clientType,
      dto.city,
      dto.email,
      createdById,
    );

    return await this.clientRepository.save(newClient);
  }
}
