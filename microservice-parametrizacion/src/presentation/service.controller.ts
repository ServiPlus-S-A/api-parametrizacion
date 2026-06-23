import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
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
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
  ) {}

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

  @Get()
  @Roles('Admin', 'Coord', 'Consultor')
  @ApiOperation({
    summary: 'Consultar catálogo de servicios',
    description:
      'Devuelve un listado paginado (10 por página) ordenado por fecha de creación descendente. Permite filtrar por nombre (búsqueda parcial), categoría y estado.',
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de servicios.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para consultar servicios.',
  })
  async list(@Query() query: ListServicesDto) {
    return this.listServicesUseCase.execute(query);
  }
}
