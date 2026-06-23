import {
  Controller,
  Post,
  Body,
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
import { CreateClientUseCase } from '../application/create-client.use-case';
import { CreateClientDto } from '../application/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/clients')
export class ClientController {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {}

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
}
