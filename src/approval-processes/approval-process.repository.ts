import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';
import { CreateApprovalProcessDto } from './dto/create-approval-process.dto';
import { UpdateApprovalProcessDto } from './dto/update-approval-process.dto';

@Injectable()
export class ApprovalProcessRepository {
  constructor(
    @InjectRepository(ApprovalProcess)
    private readonly repository: Repository<ApprovalProcess>,
  ) {}

  async create(createDto: CreateApprovalProcessDto): Promise<ApprovalProcess> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<ApprovalProcess[]> {
    return await this.repository.find({ withDeleted: false });
  }

  async findOne(id: string): Promise<ApprovalProcess | null> {
    const entity = await this.repository.findOne({ where: { id }, withDeleted: false });
    if (!entity) {
      return null;
    }
    return entity;
  }

  async findByApproverId(approverId: string): Promise<ApprovalProcess | null> {
    const entity = await this.repository.findOne({ where: { approverId }, withDeleted: false });
    if (!entity) {
      return null;
    }
    return entity;
  }

  async update(id: string, updateDto: UpdateApprovalProcessDto): Promise<ApprovalProcess | null> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException('Approval process not found');
    }
    await this.repository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException('Approval process not found');
    }
    await this.repository.softDelete(id);
  }

  async findWithDeleted(id: string): Promise<ApprovalProcess | null> {
    const entity = await this.repository.findOne({ where: { id }, withDeleted: true });
    if (!entity) {
      return null;
    }
    return entity;
  }

  async findAllWithDeleted(): Promise<ApprovalProcess[]> {
    return await this.repository.find({ withDeleted: true });
  }

  async restore(id: string): Promise<void> {
    const entity = await this.findWithDeleted(id);
    if (!entity) {
      throw new NotFoundException('Approval process not found');
    }
    await this.repository.restore(id);
  }

  async hardDelete(id: string): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException('Approval process not found');
    }
    await this.repository.delete(id);
  }

  async findByApprovalRequestIdAndApproverId(approvalRequestId: string, approverId: string): Promise<ApprovalProcess | null> {
    const entity = await this.repository.findOne({ 
      where: { approvalRequestId, approverId }, 
      withDeleted: false 
    });
    if (!entity) {
      return null;
    }
    return entity;
  }

  async findByApprovalRequestId(approvalRequestId: string): Promise<ApprovalProcess | null> {
    const entity = await this.repository.findOne({ 
      where: { approvalRequestId }, 
      withDeleted: false 
    });
    return entity;
  }
}


