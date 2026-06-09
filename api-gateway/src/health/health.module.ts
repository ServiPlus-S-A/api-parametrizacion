import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [HttpModule, ProxyModule],
  controllers: [HealthController],
})
export class HealthModule {}
