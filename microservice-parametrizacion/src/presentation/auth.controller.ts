import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
import { AuthUseCase } from '../application/auth.use-case';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Permite autenticarse y obtener un token JWT. Bloquea la cuenta por 15 minutos tras 5 intentos fallidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa. Retorna el token JWT.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiResponse({
    status: 403,
    description: 'Cuenta bloqueada por 5 intentos fallidos.',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authUseCase.login(loginDto.correo, loginDto.contrasena);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/menu')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener menú de navegación',
    description:
      'Retorna los módulos disponibles según el rol del usuario logueado.',
  })
  @ApiResponse({ status: 200, description: 'Listado de módulos permitidos.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  getMenu(@Request() req: RequestWithUser) {
    const role = req.user.role;

    if (role === 'Admin') {
      return { modulos: ['clientes', 'servicios', 'usuarios', 'roles'] };
    }
    return { modulos: ['clientes', 'servicios'] };
  }
}
