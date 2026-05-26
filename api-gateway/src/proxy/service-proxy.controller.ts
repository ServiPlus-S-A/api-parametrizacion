import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CircuitBreakerInterceptor } from '../common/circuit-breaker.interceptor';
// import { lastValueFrom } from 'rxjs';

@Controller('api/services')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CircuitBreakerInterceptor)
export class ServiceProxyController {
  // constructor(private readonly httpService: HttpService) {}

  @Post()
  async createService(@Body() payload: any) {
    const microserviceUrl = process.env.MICROSERVICE_URL + '/internal/services';
    // const response = await lastValueFrom(this.httpService.post(microserviceUrl, payload));
    // return response.data;
    return { status: 'Proxied successfully', payload };
  }
}
