import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { ApprovalProcessController } from './approval-process.controller';
import { ApprovalProcessService } from './approval-process.service';
import { ApprovalProcessRepository } from './approval-process.repository';
import { ApprovalRequestRepository } from '../approval-requests/approval-request.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalProcess, ApprovalRequest])],
  controllers: [ApprovalProcessController],
  providers: [ApprovalProcessService, ApprovalProcessRepository, ApprovalRequestRepository],
  exports: [ApprovalProcessService, ApprovalProcessRepository],
})
export class ApprovalProcessModule {}


