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
  SendSingleWhatsAppDto 
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

  @Patch('notifications/retry/:notificationTrackId')
  @ApiOperation({ summary: 'Retry failed notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification retry initiated successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  retryFailedNotification(@Param('notificationTrackId') notificationTrackId: string) {
    return this.approvalRequestService.retryFailedNotification(notificationTrackId);
  }

  @Get('notifications/check-status/:messageId')
  @ApiOperation({ summary: 'Check delivery status of a notification' })
  @ApiResponse({
    status: 200,
    description: 'Delivery status checked successfully.',
    type: NotificationTrack,
  })
  @ApiResponse({ status: 404, description: 'Notification track not found.' })
  checkDeliveryStatus(@Param('messageId') messageId: string) {
    return this.approvalRequestService.checkDeliveryStatus(messageId);
  }
}
