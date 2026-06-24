import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Usuarios')
@Controller('api/v1/usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  @Put('me')
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description:
      'Permite al usuario autenticado actualizar su propio nombre y/o contraseña.',
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos incorrectos o inválidos.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateMe(
    @Request() req: RequestWithUser,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.updateUserUseCase.execute(req.user.userId, updateMeDto);
  }

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
