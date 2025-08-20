import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApprovalRequestRepository } from './approval-request.repository';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { NotificationTrack } from '../core/domain/entities/notification-track.entity';
import { NotificationService } from './notification.service';
import { ApprovalProcessRepository } from '../approval-processes/approval-process.repository';

@Injectable()
export class ApprovalRequestService {
  constructor(
    private readonly repository: ApprovalRequestRepository,
    private readonly notificationService: NotificationService,
    private readonly approvalProcessRepository: ApprovalProcessRepository,
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

  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    data: Array<{
      approvalRequest: ApprovalRequest;
      notificationTracks: NotificationTrack[];
      approvalProcess: any;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const maxLimit = Math.min(limit, 100);
    const offset = (page - 1) * maxLimit;

    let approvalRequests: ApprovalRequest[];
    let total: number;

    if (status) {
      approvalRequests = await this.repository.findByStatus(status);
      total = approvalRequests.length;
      approvalRequests = approvalRequests.slice(offset, offset + maxLimit);
    } else {
      approvalRequests = await this.repository.findAll();
      total = approvalRequests.length;
      approvalRequests = approvalRequests.slice(offset, offset + maxLimit);
    }

    const data = await Promise.all(
      approvalRequests.map(async (approvalRequest) => {
        const notificationTracks = await this.notificationService.getNotificationTracksByApprovalRequest(approvalRequest.id);
        const approvalProcess = await this.approvalProcessRepository.findByApprovalRequestId(approvalRequest.id);

        return {
          approvalRequest,
          notificationTracks,
          approvalProcess
        };
      })
    );

    const totalPages = Math.ceil(total / maxLimit);

    return {
      data,
      pagination: {
        page,
        limit: maxLimit,
        total,
        totalPages
      }
    };
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

  async checkDeliveryStatusByNotificationTrackId(notificationTrackId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackById(notificationTrackId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with ID ${notificationTrackId} not found`);
    }

    if (notificationTrack.messageId) {
      if (notificationTrack.type === 'email') {
        await this.notificationService.checkEmailDeliveryStatus(notificationTrack.messageId);
      } else if (notificationTrack.type === 'whatsapp') {
        await this.notificationService.checkWhatsAppDeliveryStatus(notificationTrack.messageId);
      }
    }

    return await this.notificationService.getNotificationTrackById(notificationTrackId);
  }

  async retryResendByMessageId(messageId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackByMessageId(messageId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with messageId ${messageId} not found`);
    }

    return await this.notificationService.retryResendByMessageId(messageId);
  }

  async retryResendByNotificationTrackId(notificationTrackId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackById(notificationTrackId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with ID ${notificationTrackId} not found`);
    }

    return await this.notificationService.retryResendByNotificationTrackId(notificationTrackId);
  }

  async checkRetryEligibility(messageId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackByMessageId(messageId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with messageId ${messageId} not found`);
    }

    return await this.notificationService.checkRetryEligibility(messageId);
  }

  async checkRetryEligibilityByNotificationTrackId(notificationTrackId: string) {
    const notificationTrack = await this.notificationService.getNotificationTrackById(notificationTrackId);
    
    if (!notificationTrack) {
      throw new NotFoundException(`Notification track with ID ${notificationTrackId} not found`);
    }

    return await this.notificationService.checkRetryEligibilityByNotificationTrackId(notificationTrackId);
  }

  async bulkRetryResend(messageIds: string[]) {
    if (!messageIds || messageIds.length === 0) {
      throw new BadRequestException('Message IDs array cannot be empty');
    }

    if (messageIds.length > 100) {
      throw new BadRequestException('Cannot process more than 100 message IDs at once');
    }

    const results: NotificationTrack[] = [];
    const errors: Array<{ messageId: string; error: string }> = [];

    for (const messageId of messageIds) {
      try {
        const result = await this.retryResendByMessageId(messageId);
        results.push(result);
      } catch (error) {
        errors.push({
          messageId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results,
      errors,
      totalProcessed: messageIds.length,
      totalSuccess: results.length,
      totalErrors: errors.length,
    };
  }

  async bulkRetryResendByNotificationTrackIds(notificationTrackIds: string[]) {
    if (!notificationTrackIds || notificationTrackIds.length === 0) {
      throw new BadRequestException('Notification track IDs array cannot be empty');
    }

    if (notificationTrackIds.length > 100) {
      throw new BadRequestException('Cannot process more than 100 notification track IDs at once');
    }

    const results: NotificationTrack[] = [];
    const errors: Array<{ notificationTrackId: string; error: string }> = [];

    for (const notificationTrackId of notificationTrackIds) {
      try {
        const result = await this.retryResendByNotificationTrackId(notificationTrackId);
        results.push(result);
      } catch (error) {
        errors.push({
          notificationTrackId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results,
      errors,
      totalProcessed: notificationTrackIds.length,
      totalSuccess: results.length,
      totalErrors: errors.length,
    };
  }
}
