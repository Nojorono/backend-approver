import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';

@Injectable()
export class ApprovalRequestRepository {
  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly repository: Repository<ApprovalRequest>,
  ) {}

  async create(createApprovalRequestDto: CreateApprovalRequestDto): Promise<ApprovalRequest> {
    const approvalRequest = this.repository.create(createApprovalRequestDto);
    return await this.repository.save(approvalRequest);
  }

  async findAll(): Promise<ApprovalRequest[]> {
    return await this.repository.find();
  }

  async findByCode(code: string): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.repository.findOne({
      where: { code: code },
    });
    if (!approvalRequest) {
      return null;
    }
    return approvalRequest;
  }

  async findByStatus(status: string): Promise<ApprovalRequest[]> {
    return await this.repository.find({
      where: { status: status },
    });
  }

  async findOne(id: string): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.repository.findOne({ where: { id: id } });
    if (!approvalRequest) {
      return null;
    }
    return approvalRequest;
  }

  async update(id: string, updateApprovalRequestDto: UpdateApprovalRequestDto): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.findOne(id);
    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found');
    }
    await this.repository.update(id, updateApprovalRequestDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const approvalRequest = await this.findOne(id);
    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found');
    }
    await this.repository.delete(id);
  }
}
