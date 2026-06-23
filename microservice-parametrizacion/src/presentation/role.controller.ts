import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ListRolesUseCase } from '../application/list-roles.use-case';
import { ListRolesDto } from './dto/list-roles.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/roles')
export class RoleController {
  constructor(private readonly listRolesUseCase: ListRolesUseCase) {}

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Listar roles del sistema',
    description:
      'Retorna el listado de roles predefinidos. Opcionalmente filtra por nombre. Requiere rol Admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes.' })
  async list(@Query() query: ListRolesDto) {
    return this.listRolesUseCase.execute(query);
  }
}
