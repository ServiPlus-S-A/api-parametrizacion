import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthUseCase } from '../application/auth.use-case';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authUseCase.login(loginDto.correo, loginDto.contrasena);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/menu')
  getMenu(@Request() req: any) {
    // req.user is injected by JwtStrategy
    // Default implementation to satisfy HU-17
    // In the future, this can query RoleOrmEntity for real permissions
    const role = req.user?.role || 'User';
    
    if (role === 'Admin') {
      return { modulos: ['clientes', 'servicios', 'usuarios', 'roles'] };
    }
    return { modulos: ['clientes', 'servicios'] };
  }
}
