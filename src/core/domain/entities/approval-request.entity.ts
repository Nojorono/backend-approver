import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApprovalProcess } from './approval-process.entity';
import { NotificationTrack } from './notification-track.entity';

@Entity('approval_requests')
@Index(['code'], { unique: true })
export class ApprovalRequest extends BaseEntity {
  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'simple-array', nullable: true })
  approverIds: string[];

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  status: string;

  @OneToMany(() => NotificationTrack, (notificationTrack) => notificationTrack.approvalRequest)
  notificationTracks: NotificationTrack[];

  @OneToMany(() => ApprovalProcess, (approvalProcess) => approvalProcess.approvalRequest)
  approvalProcesses: ApprovalProcess[];

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  frontendUrl: string;

  @BeforeInsert()
  async generateCode() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    this.code = `AR-${year}${month}${day}${hour}${minute}${second}`;
  }
}
