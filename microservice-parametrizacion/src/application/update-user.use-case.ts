import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type { UserRepository } from '../domain/user.repository';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { RoleOrmEntity } from '../infrastructure/role.orm-entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, updateData: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateData.nombre) {
      user.fullName = updateData.nombre;
    }

    if (updateData.estado) {
      user.status = updateData.estado;
    }

    if (updateData.roleId) {
      const role = new RoleOrmEntity();
      role.id = updateData.roleId;
      user.role = role;
    }

    if (updateData.nuevaClave) {
      user.password = await bcrypt.hash(updateData.nuevaClave, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      estado: updatedUser.status,
    };
  }
}
