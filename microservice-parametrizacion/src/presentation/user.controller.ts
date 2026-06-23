import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Usuarios')
@Controller('api/v1/usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza el perfil y/o contraseña de un usuario.',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos incompletos o inválidos.' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (Requiere Administrador).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Nota: El control de permisos de Administrador se puede validar aquí
    // o usando un guardia de RolesGuard personalizado.
    return this.updateUserUseCase.execute(id, updateUserDto);
  }
}
