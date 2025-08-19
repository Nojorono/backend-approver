import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApprovalRequest } from './approval-request.entity';

export enum NotificationType {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

@Entity('notification_tracks')
@Index(['approvalRequestId', 'type'])
@Index(['status'])
@Index(['messageId'])
export class NotificationTrack extends BaseEntity {
  @Column({ name: 'approval_request_id' })
  approvalRequestId: string;

  @ManyToOne(() => ApprovalRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'approval_request_id' })
  approvalRequest: ApprovalRequest;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  recipient: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', nullable: true })
  retryCount: number;
}
