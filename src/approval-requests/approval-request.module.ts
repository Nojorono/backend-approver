import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { ApprovalRequestController } from './approval-request.controller';
import { ApprovalRequestService } from './approval-request.service';
import { ApprovalRequestRepository } from './approval-request.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest])],
  controllers: [ApprovalRequestController],
  providers: [ApprovalRequestService, ApprovalRequestRepository],
  exports: [ApprovalRequestService],
})
export class ApprovalRequestModule {}
