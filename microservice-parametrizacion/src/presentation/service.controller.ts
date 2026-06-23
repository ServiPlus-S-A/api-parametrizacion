import { Controller, Post, Body } from '@nestjs/common';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { CreateServiceDto } from '../application/create-service.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Servicios')
@Controller('internal/services')
export class ServiceController {
  constructor(private readonly createServiceUseCase: CreateServiceUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo servicio', description: 'Registra un servicio en la base de datos de parametrización.' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'Ya existe un servicio con ese nombre.' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.createServiceUseCase.execute(createServiceDto);
  }
}
