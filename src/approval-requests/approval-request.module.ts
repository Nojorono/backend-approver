import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { NotificationTrack } from '../core/domain/entities/notification-track.entity';
import { User } from '../core/domain/entities/user.entity';
import { ApprovalRequestController } from './approval-request.controller';
import { ApprovalRequestService } from './approval-request.service';
import { ApprovalRequestRepository } from './approval-request.repository';
import { NotificationService } from './notification.service';
import { InfobipModule } from '../infobip/infobip.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovalRequest, NotificationTrack, User]),
    InfobipModule,
  ],
  controllers: [ApprovalRequestController],
  providers: [ApprovalRequestService, ApprovalRequestRepository, NotificationService],
  exports: [ApprovalRequestService, NotificationService],
})
export class ApprovalRequestModule {}
