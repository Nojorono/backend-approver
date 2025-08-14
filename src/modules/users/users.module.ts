import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRolesService } from './services/user-roles.service';
import { User } from '@/modules/auth/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Role } from '@/modules/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Role])],
  controllers: [UsersController],
  providers: [UsersService, UserRolesService],
  exports: [UsersService, UserRolesService],
})
export class UsersModule {}
