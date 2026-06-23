import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Servicios')
@ApiBearerAuth()
@Controller('api/v1/servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly createServiceUseCase: CreateServiceUseCase) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Crear un nuevo servicio',
    description:
      'Registra un servicio en el catálogo de parametrización. Solo disponible para el rol Administrador.',
  })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Formato de datos inválido.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para crear servicios.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un servicio con ese nombre.',
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.createServiceUseCase.execute(createServiceDto);
  }
}
