import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './infrastructure/guards/auth.guard';
import { RolePermissionModule } from './infrastructure/modules/role-permission.module';
import { MenuModule } from './infrastructure/modules/menu.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { UserModule } from './users/user.module';
import { ApprovalRequestModule } from './approval-requests/approval-request.module';
import { InfobipModule } from './infobip/infobip.module';
import { S3Module } from './infrastructure/modules/s3.module';
import { ApprovalProcessModule } from './approval-processes/approval-process.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'approver'),
        entities: [
          join(__dirname, 'core', 'domain', 'entities', '*.entity.{ts,js}'),
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolePermissionModule,
    MenuModule,
    UserModule,
    ApprovalRequestModule,
    S3Module,
    ApprovalProcessModule,
    InfobipModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
