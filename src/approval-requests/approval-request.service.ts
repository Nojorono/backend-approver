import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApprovalRequestRepository } from './approval-request.repository';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';

@Injectable()
export class ApprovalRequestService {
  constructor(private readonly repository: ApprovalRequestRepository) {}

  async create(createApprovalRequestDto: CreateApprovalRequestDto): Promise<ApprovalRequest> {
    return await this.repository.create(createApprovalRequestDto);
  }

  async findAll(): Promise<ApprovalRequest[]> {
    return await this.repository.findAll();
  }

  async findByStatus(status: string): Promise<ApprovalRequest[]> {
    return await this.repository.findByStatus(status);
  }

  async findOne(id: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.repository.findOne(id);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request with ID ${id} not found`);
    }
    return approvalRequest;
  }

  async findByCode(code: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.repository.findByCode(code);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request with code ${code} not found`);
    }
    return approvalRequest;
  }

  async update(id: string, updateApprovalRequestDto: UpdateApprovalRequestDto): Promise<ApprovalRequest> {
    const updatedApprovalRequest = await this.repository.update(id, updateApprovalRequestDto);
    if (!updatedApprovalRequest) {
      throw new NotFoundException(`Approval request with ID ${id} not found`);
    }
    return updatedApprovalRequest;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }

  async findWithDeleted(id: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.repository.findWithDeleted(id);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request with ID ${id} not found`);
    }
    return approvalRequest;
  }

  async findAllWithDeleted(): Promise<ApprovalRequest[]> {
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
}
