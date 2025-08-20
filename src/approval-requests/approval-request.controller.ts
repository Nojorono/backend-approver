import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApprovalRequestService } from './approval-request.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { 
  SendNotificationDto, 
  SendSingleEmailDto, 
  SendSingleWhatsAppDto,
  RetryResendByNotificationTrackIdDto,
  BulkRetryResendByNotificationTrackIdsDto
} from './dto/send-notification.dto';
import { SendApproverNotificationDto } from './dto/send-approver-notification.dto';
import { NotificationTrack } from '../core/domain/entities/notification-track.entity';

@ApiTags('Approval Requests')
@Controller('approval-requests')
@ApiBearerAuth('JWT-auth')
export class ApprovalRequestController {
  constructor(private readonly approvalRequestService: ApprovalRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Approval Request' })
  @ApiResponse({
    status: 201,
    description: 'The Approval Request has been successfully created.',
    type: ApprovalRequest,
  })
  create(@Body() createApprovalRequestDto: CreateApprovalRequestDto) {
    return this.approvalRequestService.create(createApprovalRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Approval Requests' })
  @ApiResponse({ status: 200, description: 'Return all Approval Requests.', type: [ApprovalRequest] })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.approvalRequestService.findByStatus(status);
    }
    return this.approvalRequestService.findAll();
  }

  @Get('pending-by-approver/:approverId')
  @ApiOperation({ summary: 'Get all pending Approval Requests by approver ID' })
  @ApiResponse({ status: 200, description: 'Return all pending Approval Requests by approver ID.', type: [ApprovalRequest] })
  findPendingByApproverId(@Param('approverId') approverId: string) {
    return this.approvalRequestService.findPendingByApproverId(approverId);
  }

  @Get('with-relations')
  @ApiOperation({ summary: 'Get all Approval Requests with notification tracks and approval process relations' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all Approval Requests with relations.', 
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              approvalRequest: { type: 'object' },
              notificationTracks: { type: 'array' },
              approvalProcess: { type: 'object' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'createdBy', required: false, description: 'find by createdBy' })
  findAllWithRelations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string
  ) {
    return this.approvalRequestService.findAllWithRelations(page, limit, status, createdBy);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get an Approval Request by code' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findByCode(@Param('code') code: string) {
    return this.approvalRequestService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an Approval Request by id' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findOne(@Param('id') id: string) {
    return this.approvalRequestService.findOne(id);
  }



  @Patch(':id')
  @ApiOperation({ summary: 'Update an Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully updated.',
    type: ApprovalRequest,
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  update(@Param('id') id: string, @Body() updateApprovalRequestDto: UpdateApprovalRequestDto) {
    return this.approvalRequestService.update(id, updateApprovalRequestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully soft deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  remove(@Param('id') id: string) {
    return this.approvalRequestService.remove(id);
  }

  @Get('with-deleted/:id')
  @ApiOperation({ summary: 'Get an Approval Request by id including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request including soft deleted.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findWithDeleted(@Param('id') id: string) {
    return this.approvalRequestService.findWithDeleted(id);
  }

  @Get('all/with-deleted')
  @ApiOperation({ summary: 'Get all Approval Requests including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return all Approval Requests including soft deleted.', type: [ApprovalRequest] })
  findAllWithDeleted() {
    return this.approvalRequestService.findAllWithDeleted();
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore a soft deleted Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully restored.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  restore(@Param('id') id: string) {
    return this.approvalRequestService.restore(id);
  }

  @Delete('hard-delete/:id')
  @ApiOperation({ summary: 'Hard delete an Approval Request (permanent)' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been permanently deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  hardDelete(@Param('id') id: string) {
    return this.approvalRequestService.hardDelete(id);
  }

  @Post('notifications/send')
  @ApiOperation({ summary: 'Send notifications to approvers' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent successfully.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  sendNotifications(@Body() sendNotificationDto: SendNotificationDto) {
    return this.approvalRequestService.sendNotificationToApprovers(
      sendNotificationDto.approvalRequestId,
      sendNotificationDto.emailRecipients || [],
      sendNotificationDto.whatsappRecipients || [],
    );
  }

  @Post('notifications/send-to-approvers')
  @ApiOperation({ summary: 'Send notifications to approvers automatically from approval request' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent to approvers successfully.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  sendNotificationsToApprovers(@Body() sendApproverNotificationDto: SendApproverNotificationDto) {
    return this.approvalRequestService.sendNotificationsToApprovers(
      sendApproverNotificationDto.approvalRequestId,
      sendApproverNotificationDto.subject,
      sendApproverNotificationDto.emailContent,
      sendApproverNotificationDto.whatsappContent,
    );
  }

  @Post('notifications/send-email')
  @ApiOperation({ summary: 'Send single email notification' })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  sendEmail(@Body() sendEmailDto: SendSingleEmailDto) {
    return this.approvalRequestService.sendNotificationToApprovers(
      sendEmailDto.approvalRequestId,
      [{ email: sendEmailDto.recipientEmail, subject: sendEmailDto.subject, content: sendEmailDto.content }],
      [],
    );
  }

  @Post('notifications/send-whatsapp')
  @ApiOperation({ summary: 'Send single WhatsApp notification' })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp message sent successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  sendWhatsApp(@Body() sendWhatsAppDto: SendSingleWhatsAppDto) {
    return this.approvalRequestService.sendNotificationToApprovers(
      sendWhatsAppDto.approvalRequestId,
      [],
      [{ phone: sendWhatsAppDto.recipientPhone, message: sendWhatsAppDto.message }],
    );
  }

  @Get('notifications/:approvalRequestId')
  @ApiOperation({ summary: 'Get notification tracks for approval request' })
  @ApiResponse({
    status: 200,
    description: 'Notification tracks retrieved successfully.',
    type: [NotificationTrack],
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  getNotificationTracks(@Param('approvalRequestId') approvalRequestId: string) {
    return this.approvalRequestService.getNotificationTracks(approvalRequestId);
  }

  @Get('notifications/:approvalRequestId/status')
  @ApiOperation({ summary: 'Get notification status summary for approval request' })
  @ApiResponse({
    status: 200,
    description: 'Notification status retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        approvalRequestId: { type: 'string' },
        notificationTracks: { type: 'array' },
        totalNotifications: { type: 'number' },
        sentCount: { type: 'number' },
        failedCount: { type: 'number' },
        pendingCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  getNotificationStatus(@Param('approvalRequestId') approvalRequestId: string) {
    return this.approvalRequestService.getNotificationStatus(approvalRequestId);
  }

  @Post('notifications/:approvalRequestId/trigger')
  @ApiOperation({ summary: 'Manually trigger notifications for approval request' })
  @ApiResponse({
    status: 200,
    description: 'Notifications triggered successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  @ApiResponse({ status: 400, description: 'No approvers assigned to approval request.' })
  triggerNotifications(@Param('approvalRequestId') approvalRequestId: string) {
    return this.approvalRequestService.triggerNotifications(approvalRequestId);
  }

  @Get('notifications/check-status/:notificationTrackId')
  @ApiOperation({ summary: 'Check delivery status of a notification by notification track ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery status checked successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  checkDeliveryStatusByNotificationTrackId(@Param('notificationTrackId') notificationTrackId: string) {
    return this.approvalRequestService.checkDeliveryStatusByNotificationTrackId(notificationTrackId);
  }

  @Get('notifications/check-retry-eligibility/:messageId')
  @ApiOperation({ summary: 'Check if a notification can be retried' })
  @ApiResponse({
    status: 200,
    description: 'Retry eligibility checked successfully.',
    schema: {
      type: 'object',
      properties: {
        canRetry: { type: 'boolean' },
        reason: { type: 'string' },
        retryCount: { type: 'number' },
        maxRetries: { type: 'number' },
        status: { type: 'string' },
        type: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  checkRetryEligibility(@Param('messageId') messageId: string) {
    return this.approvalRequestService.checkRetryEligibility(messageId);
  }

  @Get('notifications/check-retry-eligibility-by-track/:notificationTrackId')
  @ApiOperation({ summary: 'Check if a notification can be retried by notification track ID' })
  @ApiResponse({
    status: 200,
    description: 'Retry eligibility checked successfully.',
    schema: {
      type: 'object',
      properties: {
        canRetry: { type: 'boolean' },
        reason: { type: 'string' },
        retryCount: { type: 'number' },
        maxRetries: { type: 'number' },
        status: { type: 'string' },
        type: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  checkRetryEligibilityByNotificationTrackId(@Param('notificationTrackId') notificationTrackId: string) {
    return this.approvalRequestService.checkRetryEligibilityByNotificationTrackId(notificationTrackId);
  }

  @Post('notifications/retry-resend')
  @ApiOperation({ summary: 'Retry resend notification by notification track ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retry resend initiated successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  @ApiResponse({ status: 400, description: 'Notification cannot be retried.' })
  retryResendByNotificationTrackId(@Body() retryResendDto: RetryResendByNotificationTrackIdDto) {
    return this.approvalRequestService.retryResendByNotificationTrackId(retryResendDto.notificationTrackId);
  }

  @Patch('notifications/retry/:notificationTrackId')
  @ApiOperation({ summary: 'Retry resend notification by notification track ID (direct)' })
  @ApiResponse({
    status: 200,
    description: 'Notification retry resend initiated successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  @ApiResponse({ status: 400, description: 'Notification cannot be retried.' })
  retryResendByNotificationTrackIdDirect(@Param('notificationTrackId') notificationTrackId: string) {
    return this.approvalRequestService.retryResendByNotificationTrackId(notificationTrackId);
  }

  @Post('notifications/bulk-retry-resend')
  @ApiOperation({ summary: 'Bulk retry resend notifications by notification track IDs' })
  @ApiResponse({
    status: 200,
    description: 'Bulk notification retry resend initiated successfully.',
    type: [NotificationTrack],
  })
  @ApiResponse({ status: 400, description: 'Invalid notification track IDs provided.' })
  bulkRetryResend(@Body() bulkRetryDto: BulkRetryResendByNotificationTrackIdsDto) {
    return this.approvalRequestService.bulkRetryResendByNotificationTrackIds(bulkRetryDto.notificationTrackIds);
  }
}
