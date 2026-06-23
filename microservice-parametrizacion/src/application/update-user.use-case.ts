import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type { IUserRepository } from '../domain/user.repository';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateData: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updates: Record<string, unknown> = {};

    if (updateData.nombre) {
      updates.nombre = updateData.nombre;
    }

    if (updateData.estado) {
      updates.estado = updateData.estado;
    }

    if (updateData.roleId) {
      updates.rolId = updateData.roleId;
    }

    if (updateData.nuevaClave) {
      updates.clave = await bcrypt.hash(updateData.nuevaClave, 10);
    }

    const updatedUser = await this.userRepository.update(id, updates);

    return {
      id: updatedUser.id,
      estado: updatedUser.estado,
    };
  }
}
