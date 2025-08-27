import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    return await this.repository.find({
      withDeleted: false,
    });
  }

  async findByCreatedBy(createdBy: string): Promise<ApprovalRequest[]> {
    return await this.repository.find({
      where: { createdBy: createdBy },
      withDeleted: false,
    });
  }

  async findPendingByApproverId(approverId: string): Promise<ApprovalRequest[]> {
    return await this.repository.find({
      where: { approverIds: In([approverId]), status: 'pending' },
      relations: ['creator'],
      withDeleted: false,
    });
  }

  async findByCode(code: string): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.repository.findOne({
      where: { code: code },
      withDeleted: false,
    });
    if (!approvalRequest) {
      return null;
    }
    return approvalRequest;
  }

  async findByStatus(status: string): Promise<ApprovalRequest[]> {
    return await this.repository.find({
      where: { status: status },
      withDeleted: false,
    });
  }

  async findOne(id: string): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.repository.findOne({ 
      where: { id: id },
      withDeleted: false,
    });
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
    await this.repository.softDelete(id);
  }

  async findWithDeleted(id: string): Promise<ApprovalRequest | null> {
    const approvalRequest = await this.repository.findOne({ 
      where: { id: id },
      withDeleted: true,
    });
    if (!approvalRequest) {
      return null;
    }
    return approvalRequest;
  }

  async findAllWithDeleted(): Promise<ApprovalRequest[]> {
    return await this.repository.find({
      withDeleted: true,
    });
  }

  async restore(id: string): Promise<void> {
    const approvalRequest = await this.findWithDeleted(id);
    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found');
    }
    await this.repository.restore(id);
  }

  async hardDelete(id: string): Promise<void> {
    const approvalRequest = await this.findWithDeleted(id);
    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found');
    }
    await this.repository.delete(id);
  }
}
