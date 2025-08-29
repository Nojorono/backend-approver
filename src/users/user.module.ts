import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../core/domain/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AuthModule } from '../infrastructure/modules/auth.module';
import { InfobipModule } from '../infobip/infobip.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    InfobipModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
