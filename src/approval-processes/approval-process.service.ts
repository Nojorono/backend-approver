import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalProcessRepository } from './approval-process.repository';
import { CreateApprovalProcessDto } from './dto/create-approval-process.dto';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';
import { UpdateApprovalProcessDto } from './dto/update-approval-process.dto';

@Injectable()
export class ApprovalProcessService {
  constructor(private readonly repository: ApprovalProcessRepository) {}

  async create(createDto: CreateApprovalProcessDto): Promise<ApprovalProcess> {
    return await this.repository.create(createDto);
  }

  async findAll(): Promise<ApprovalProcess[]> {
    return await this.repository.findAll();
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
}


