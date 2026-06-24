import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ListRolesUseCase } from '../application/list-roles.use-case';
import { GetRoleUseCase } from '../application/get-role.use-case';
import { UpdateRoleUseCase } from '../application/update-role.use-case';
import { ListRolesDto } from './dto/list-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/roles')
export class RoleController {
  constructor(
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
  ) {}

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

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Obtener detalle de un rol',
    description:
      'Retorna la información completa de un rol incluyendo descripción, estado, permisos y fechas. Requiere rol Admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Detalle del rol.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes.' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el rol con ese ID.',
  })
  async getById(@Param('id') id: string) {
    return this.getRoleUseCase.execute(id);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Actualizar información y estado de roles (HU-12)',
    description:
      'Actualiza parcialmente los datos de un rol existente. Requiere rol Admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del rol a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o incompletos.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes.' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el rol con ese ID.',
  })
  @ApiResponse({
    status: 409,
    description: 'El nombre ya existe o el rol tiene usuarios asociados.',
  })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, updateRoleDto);
  }
}
