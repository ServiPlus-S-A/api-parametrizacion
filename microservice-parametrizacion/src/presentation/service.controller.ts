import { Controller, Post, Body } from '@nestjs/common';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { CreateServiceDto } from '../application/create-service.dto';

@Controller('internal/services')
export class ServiceController {
  constructor(private readonly createServiceUseCase: CreateServiceUseCase) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.createServiceUseCase.execute(createServiceDto);
  }
}
