import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
  } from 'typeorm';
  import { BaseEntity } from './base.entity';
import { ApprovalRequest } from './approval-request.entity';

  export enum ApprovalProcessStatus {
    APPROVED = 'approved',
    REJECTED = 'rejected',
  }
  
  @Entity('approval_processes')
  export class ApprovalProcess extends BaseEntity {
    @Column({ name: 'approval_request_id' })
    approvalRequestId: string;
  
    @ManyToOne(() => ApprovalRequest, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'approval_request_id' })
    approvalRequest: ApprovalRequest;
  
    @Column({ name: 'approver_id' })
    approverId: string;
  
    @Column({ type: 'enum', enum: ApprovalProcessStatus })
    status: ApprovalProcessStatus;

    @Column({ nullable: true })
    reasonRejected: string;
  }
  