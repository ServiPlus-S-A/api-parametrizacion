import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type { IUserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';
import { RoleOrmEntity } from '../infrastructure/role.orm-entity';
import { CreateUserDto } from '../presentation/dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
  ) {}

  async execute(
    dto: CreateUserDto,
  ): Promise<{ id: string; email: string; estado: string }> {
    // 1. Validar que el email no esté registrado
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // 2. Validar que el rol exista y esté activo
    const role = await this.roleRepository.findOne({
      where: { id: dto.rolId },
    });
    if (!role) {
      throw new NotFoundException('El rol especificado no existe');
    }
    if (role.status !== 'Active') {
      throw new BadRequestException('El rol especificado no está activo');
    }

    // 3. Hashear la clave con bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.clave, saltRounds);

    // 4. Generar UUID y crear entidad de dominio
    const userId = uuidv4();
    const user = new UserEntity(
      userId,
      dto.nombre,
      dto.email,
      passwordHash,
      'Active',
      dto.rolId,
    );

    // 5. Guardar en base de datos
    await this.userRepository.save(user);

    // 6. Devolver respuesta (NUNCA devolvemos la clave)
    return {
      id: user.id,
      email: user.email,
      estado: 'ACTIVO',
    };
  }
}
