import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API Gateway running on port ${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Services health: http://localhost:${port}/health/services`);
}
void bootstrap();
