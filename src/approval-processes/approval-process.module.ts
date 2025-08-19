import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';
import { ApprovalProcessController } from './approval-process.controller';
import { ApprovalProcessService } from './approval-process.service';
import { ApprovalProcessRepository } from './approval-process.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalProcess])],
  controllers: [ApprovalProcessController],
  providers: [ApprovalProcessService, ApprovalProcessRepository],
  exports: [ApprovalProcessService],
})
export class ApprovalProcessModule {}


