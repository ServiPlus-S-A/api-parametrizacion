import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateClientUseCase } from '../application/create-client.use-case';
import { CreateClientDto } from '../application/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/clients')
export class ClientController {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createClientDto: CreateClientDto, @Request() req: any) {
    // The authenticated user's id is injected by JwtStrategy into req.user
    const createdById: string = req.user.userId;
    return this.createClientUseCase.execute(createClientDto, createdById);
  }
}
