import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApprovalRequestRepository } from './approval-request.repository';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class ApprovalRequestService {
  constructor(
    private readonly repository: ApprovalRequestRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createApprovalRequestDto: CreateApprovalRequestDto): Promise<ApprovalRequest> {
    const approvalRequest = await this.repository.create(createApprovalRequestDto);
    
    if (approvalRequest.approverIds && approvalRequest.approverIds.length > 0) {
      try {
        await this.sendNotificationsToApprovers(
          approvalRequest.id,
          `New Approval Request: ${approvalRequest.subject || approvalRequest.code}`,
          undefined,
          undefined
        );
      } catch (error) {
        console.error('Failed to send notifications to approvers:', error);
      }
    }
    
    return approvalRequest;
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

  async sendNotificationToApprovers(
    approvalRequestId: string,
    emailRecipients: Array<{ email: string; subject: string; content: string }>,
    whatsappRecipients: Array<{ phone: string; message: string }>,
  ) {
    const approvalRequest = await this.findOne(approvalRequestId);
    
    return await this.notificationService.sendBulkApprovalRequestNotifications(
      approvalRequestId,
      emailRecipients,
      whatsappRecipients,
    );
  }

  async sendNotificationsToApprovers(
    approvalRequestId: string,
    subject?: string,
    emailContent?: string,
    whatsappContent?: string,
  ) {
    await this.findOne(approvalRequestId);
    
    return await this.notificationService.sendNotificationsToApprovers(
      approvalRequestId,
      subject,
      emailContent,
      whatsappContent,
    );
  }

  async getNotificationTracks(approvalRequestId: string) {
    await this.findOne(approvalRequestId);
    return await this.notificationService.getNotificationTracksByApprovalRequest(approvalRequestId);
  }

  async retryFailedNotification(notificationTrackId: string) {
    return await this.notificationService.retryFailedNotifications(notificationTrackId);
  }

  async checkDeliveryStatus(messageId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackByMessageId(messageId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with messageId ${messageId} not found`);
    }

    if (notificationTrack.type === 'email') {
      await this.notificationService.checkEmailDeliveryStatus(messageId);
    } else if (notificationTrack.type === 'whatsapp') {
      await this.notificationService.checkWhatsAppDeliveryStatus(messageId);
    }

    return await this.notificationService.getNotificationTrackByMessageId(messageId);
  }
}
