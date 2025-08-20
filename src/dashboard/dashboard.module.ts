import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { NotificationTrack } from '../core/domain/entities/notification-track.entity';
import { User } from '../core/domain/entities/user.entity';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalRequest,
      NotificationTrack,
      User,
      ApprovalProcess,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
