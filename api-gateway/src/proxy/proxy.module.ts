import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import servicesConfig from '../config/services.config';
import { ServiceRegistryService } from './service-registry.service';
import { ProxyMiddleware } from './proxy.middleware';

@Module({
  imports: [ConfigModule.forFeature(servicesConfig)],
  providers: [ServiceRegistryService],
  exports: [ServiceRegistryService],
})
export class ProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('api/*path');
  }
}
