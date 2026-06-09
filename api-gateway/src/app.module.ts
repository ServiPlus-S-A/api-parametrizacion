import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import gatewayConfig from './config/gateway.config';
import { ProxyModule } from './proxy/proxy.module';
import { HealthModule } from './health/health.module';
import { GatewayExceptionFilter } from './common/gateway-exception.filter';
import { RateLimiterGuard } from './common/rate-limiter.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
    }),
    ProxyModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GatewayExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
