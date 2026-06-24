import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { ListUserUseCase } from '../application/list-user.use-case';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQueryDto } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('api/v1/usuarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUserUseCase: ListUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description:
      'Registra un usuario en el sistema. Valida email único, rol activo y contraseña fuerte.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Faltan datos o contraseña débil.' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado.' })
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios con filtros y paginación',
    description:
      'Retorna usuarios paginados. Filtra por nombre/email (q) y por estado. Máximo 10 por página.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Buscar por nombre o email',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado (Active, Blocked)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página (empieza en 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: 'Tamaño de página (máx 10)',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de usuarios.' })
  @ApiResponse({ status: 400, description: 'Page/Size inválido.' })
  @ApiResponse({ status: 401, description: 'Sin token.' })
  async list(@Query() query: ListUserQueryDto) {
    return this.listUserUseCase.execute(query);
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
    return this.updateUserUseCase.execute(id, updateUserDto);
  }
}
