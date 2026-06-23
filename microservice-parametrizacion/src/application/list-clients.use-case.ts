import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client.repository';
import type { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { ListClientsDto } from '../presentation/dto/list-clients.dto';

const PAGE_SIZE = 20;

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    dto: ListClientsDto,
  ): Promise<{ content: ClientEntity[]; totalPages: number }> {
    if ((dto.page ?? 0) < 0) {
      throw new BadRequestException('page must be a non-negative integer');
    }

    return this.clientRepository.findAndPaginate({
      fullName: dto.fullName,
      taxId: dto.taxId,
      city: dto.city,
      status: dto.status,
      page: dto.page ?? 0,
    });
  }
}

export { PAGE_SIZE };
