import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ListClientsUseCase } from '../application/list-clients.use-case';
import { ChangeClientStatusUseCase } from '../application/change-client-status.use-case';
import { CreateClientUseCase } from '../application/create-client.use-case';
import { ListClientsDto } from './dto/list-clients.dto';
import { ChangeClientStatusDto } from './dto/change-client-status.dto';
import { CreateClientDto } from '../application/create-client.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/clients')
export class ClientController {
  constructor(
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly changeClientStatusUseCase: ChangeClientStatusUseCase,
    private readonly createClientUseCase: CreateClientUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo cliente',
    description:
      'Registra un cliente en la base de datos. Requiere autenticación JWT.',
  })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o campos faltantes.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Se requiere token JWT.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cliente con ese correo o NIT.',
  })
  async create(
    @Body() createClientDto: CreateClientDto,
    @Request() req: RequestWithUser,
  ) {
    const createdById: string = req.user.userId;
    return this.createClientUseCase.execute(createClientDto, createdById);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Listar y buscar clientes (HU-02)',
    description:
      'Retorna un listado paginado de clientes con filtros opcionales. Requiere rol Admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de clientes.' })
  @ApiResponse({ status: 400, description: 'page no puede ser negativa.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes.' })
  async list(@Query() query: ListClientsDto) {
    return this.listClientsUseCase.execute(query);
  }

  @Patch(':id/status')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Modificar estado de cliente (HU-03)',
    description:
      'Cambia el estado Active/Inactive del cliente. Registra motivo en auditoría. Requiere rol Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado exitosamente.',
    schema: { example: { id: 'uuid', status: 'Inactive', mensaje: 'Ok' } },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Cliente tiene solicitudes activas.',
  })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeClientStatusDto,
    @Request() req: RequestWithUser,
  ) {
    const changedBy = req.user?.userId ?? 'system';
    return this.changeClientStatusUseCase.execute(id, body, changedBy);
  }
}
