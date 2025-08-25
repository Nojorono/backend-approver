import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalProcessRepository } from './approval-process.repository';
import { CreateApprovalProcessDto } from './dto/create-approval-process.dto';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';
import { UpdateApprovalProcessDto } from './dto/update-approval-process.dto';
import { ApprovalRequestRepository } from '../approval-requests/approval-request.repository';

@Injectable()
export class ApprovalProcessService {
  constructor(
    private readonly repository: ApprovalProcessRepository,
    private readonly approvalRequestRepository: ApprovalRequestRepository,
  ) {}

  async create(createDto: CreateApprovalProcessDto): Promise<ApprovalProcess> {
    const checkApprovalProcess = await this.repository.findByApprovalRequestIdAndApproverId(createDto.approvalRequestId, createDto.approverId);
    if (checkApprovalProcess) {
      throw new BadRequestException('Approval process with this approval request and approver already exists');
    } 
    const approvalProcess = await this.repository.create(createDto);
    await this.checkAndUpdateApprovalRequestStatus(createDto.approvalRequestId);
    return approvalProcess;
  }

  async findAll(): Promise<ApprovalProcess[]> {
    return await this.repository.findAll();
  }

  async findByApproverId(approverId: string): Promise<ApprovalProcess[]> {
    return await this.repository.findByApproverId(approverId);
  }

  async findOne(id: string): Promise<ApprovalProcess> {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Approval process with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: UpdateApprovalProcessDto): Promise<ApprovalProcess> {
    const updated = await this.repository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Approval process with ID ${id} not found`);
    }
    await this.checkAndUpdateApprovalRequestStatus(updated.approvalRequestId);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }

  async findWithDeleted(id: string): Promise<ApprovalProcess> {
    const entity = await this.repository.findWithDeleted(id);
    if (!entity) {
      throw new NotFoundException(`Approval process with ID ${id} not found`);
    }
    return entity;
  }

  async findAllWithDeleted(): Promise<ApprovalProcess[]> {
    return await this.repository.findAllWithDeleted();
  }

  async restore(id: string): Promise<void> {
    await this.findWithDeleted(id);
    await this.repository.restore(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findWithDeleted(id);
    await this.repository.hardDelete(id);
  }

  async checkAndUpdateApprovalRequestStatus(approvalRequestId: string): Promise<{ status: string; message: string; counts: any }> {
    const approvalRequest = await this.approvalRequestRepository.findOne(approvalRequestId);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request with ID ${approvalRequestId} not found`);
    }

    const approverIdsCount = approvalRequest.approverIds ? approvalRequest.approverIds.length : 0;
    const approvalProcesses = await this.repository.findAllByApprovalRequestId(approvalRequestId);
    const approvalProcessesCount = approvalProcesses.length;

    const counts = {
      approverIdsCount,
      approvalProcessesCount,
      approvedCount: approvalProcesses.filter(process => process.status === 'approved').length,
      rejectedCount: approvalProcesses.filter(process => process.status === 'rejected').length,
      pendingCount: approverIdsCount - approvalProcessesCount
    };

    if (approverIdsCount === 0) {
      return { 
        status: 'pending', 
        message: 'No approvers assigned',
        counts 
      };
    }

    if (approvalProcessesCount !== approverIdsCount) {
      return { 
        status: 'pending', 
        message: `Not all approvers have responded yet. Expected: ${approverIdsCount}, Received: ${approvalProcessesCount}`,
        counts 
      };
    }

    const hasRejected = approvalProcesses.some(process => process.status === 'rejected');
    const allApproved = approvalProcesses.every(process => process.status === 'approved');

    if (hasRejected) {
      await this.approvalRequestRepository.update(approvalRequestId, { status: 'rejected' });
      return { 
        status: 'rejected', 
        message: 'Approval request rejected by one or more approvers',
        counts 
      };
    }

    if (allApproved) {
      await this.approvalRequestRepository.update(approvalRequestId, { status: 'approved' });
      return { 
        status: 'approved', 
        message: 'Approval request approved by all approvers',
        counts 
      };
    }

    return { 
      status: 'pending', 
      message: 'Approval request still pending',
      counts 
    };
  }
}


