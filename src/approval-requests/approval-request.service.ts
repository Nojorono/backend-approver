import {
  Injectable,
  NotFoundException,
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
      this.sendNotificationsInBackground(
        approvalRequest.id,
        `New Approval Request: ${approvalRequest.subject || approvalRequest.code}`,
        undefined,
        undefined
      );
    }

    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-process/${approvalRequest.id}?approverId=`;
    approvalRequest.frontendUrl = frontendUrl;
    await this.repository.update(approvalRequest.id, { frontendUrl });
    return approvalRequest;
  }

  async findPendingByApproverId(approverId: string): Promise<ApprovalRequest[]> {
    const checkApprovalRequest = await this.repository.findPendingByApproverId(approverId);
    if (checkApprovalRequest.length > 0) {
      for (const approvalRequest of checkApprovalRequest) {
        const checkApproverProcess = await this.approvalProcessRepository.findByApprovalRequestIdAndApproverId(approvalRequest.id, approverId);
        if (!checkApproverProcess) {
          return [approvalRequest];
        }
      }
    }    
    return [];
  }

  private sendNotificationsInBackground(
    approvalRequestId: string,
    subject?: string,
    emailContent?: string,
    whatsappContent?: string,
  ): void {
    const startTime = Date.now();
    console.log(`Starting background notification process for approval request: ${approvalRequestId}`);
    
    setImmediate(async () => {
      try {
        await this.sendNotificationsToApprovers(
          approvalRequestId,
          subject,
          emailContent,
          whatsappContent
        );
        const duration = Date.now() - startTime;
        console.log(`✅ Background notifications completed successfully for approval request: ${approvalRequestId} (took ${duration}ms)`);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Background notification failed for approval request ${approvalRequestId} (took ${duration}ms):`, error);
      }
    });
  }

  async getNotificationStatus(approvalRequestId: string): Promise<{
    approvalRequestId: string;
    notificationTracks: NotificationTrack[];
    totalNotifications: number;
    sentCount: number;
    failedCount: number;
    pendingCount: number;
  }> {
    const notificationTracks = await this.notificationService.getNotificationTracksByApprovalRequest(approvalRequestId);
    
    const totalNotifications = notificationTracks.length;
    const sentCount = notificationTracks.filter(track => track.status === 'sent' || track.status === 'delivered').length;
    const failedCount = notificationTracks.filter(track => track.status === 'failed' || track.status === 'rejected').length;
    const pendingCount = notificationTracks.filter(track => track.status === 'pending').length;

    return {
      approvalRequestId,
      notificationTracks,
      totalNotifications,
      sentCount,
      failedCount,
      pendingCount,
    };
  }

  async triggerNotifications(approvalRequestId: string): Promise<{ success: boolean; message: string }> {
    const approvalRequest = await this.findOne(approvalRequestId);
    
    if (!approvalRequest.approverIds || approvalRequest.approverIds.length === 0) {
      throw new BadRequestException('No approvers assigned to this approval request');
    }

    this.sendNotificationsInBackground(
      approvalRequestId,
      `Approval Request Reminder: ${approvalRequest.subject || approvalRequest.code}`,
      undefined,
      undefined
    );

    return {
      success: true,
      message: 'Notifications triggered successfully in background'
    };
  }

  async findAll(): Promise<ApprovalRequest[]> {
    return await this.repository.findAll();
  }

  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    status?: string,
    createdBy?: string
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
    } else if (createdBy) {
      approvalRequests = await this.repository.findByCreatedBy(createdBy);
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
