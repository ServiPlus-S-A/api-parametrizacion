import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';

const PREDEFINED_ROLES = [
  {
    name: 'Admin',
    description: 'Administrador del sistema con acceso completo',
    status: 'ACTIVO',
    permissions: [],
  },
  {
    name: 'Coordinador',
    description: 'Coordinador con permisos operativos',
    status: 'ACTIVO',
    permissions: [],
  },
  {
    name: 'Tesorero',
    description: 'Tesorero con permisos financieros',
    status: 'ACTIVO',
    permissions: [],
  },
  {
    name: 'Consultor',
    description: 'Consultor con permisos de solo lectura',
    status: 'ACTIVO',
    permissions: [],
  },
];

@Injectable()
export class RoleSeeder implements OnModuleInit {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repo: Repository<RoleOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.repo.count();

    if (count > 0) {
      this.logger.log(`Roles already seeded (${count} found), skipping.`);
      return;
    }

    this.logger.log('Seeding predefined roles...');
    await this.repo.save(PREDEFINED_ROLES.map((r) => this.repo.create(r)));
    this.logger.log(`Seeded ${PREDEFINED_ROLES.length} roles.`);
  }
}
