import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// App base
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './infrastructure/db.config';
import { ServiceModule } from './service.module';
import { ClientModule } from './client.module';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';

// Auth feature
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig),
    AuthModule,
    ServiceModule,
    ClientModule,
    UserModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
