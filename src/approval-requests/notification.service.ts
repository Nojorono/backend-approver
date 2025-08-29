import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InfobipEmailService } from '../infobip/services/infobip-email.service';
import { InfobipWhatsAppService } from '../infobip/services/infobip-whatsapp.service';
import { NotificationTrack, NotificationType, NotificationStatus } from '../core/domain/entities/notification-track.entity';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';
import { User } from '../core/domain/entities/user.entity';
import { SendEmailDto } from '../infobip/dto/email.dto';
import { WhatsAppTextMessageDto } from '../infobip/dto/whatsapp.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly maxRetries = parseInt(process.env.MAX_NOTIFICATION_RETRIES || '3');

  constructor(
    @InjectRepository(NotificationTrack)
    private readonly notificationTrackRepository: Repository<NotificationTrack>,
    @InjectRepository(ApprovalRequest)
    private readonly approvalRequestRepository: Repository<ApprovalRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly infobipEmailService: InfobipEmailService,
    private readonly infobipWhatsAppService: InfobipWhatsAppService,
  ) {}

  async sendApprovalRequestEmail(
    approvalRequestId: string,
    recipientEmail: string,
    subject: string,
    content: string,
    metadata?: Record<string, unknown>,
    recipientId?: string,
  ): Promise<NotificationTrack> {
    let notificationTrack: NotificationTrack | undefined;

    try {
      const approvalRequest = await this.approvalRequestRepository.findOne({
        where: { id: approvalRequestId },
      });

      if (!approvalRequest) {
        throw new Error(`Approval request with ID ${approvalRequestId} not found`);
      }

      notificationTrack = this.notificationTrackRepository.create({
        approvalRequestId,
        type: NotificationType.EMAIL,
        status: NotificationStatus.PENDING,
        recipient: recipientEmail,
        recipientId,
        subject,
        content,
        metadata,
        retryCount: 0,
      });

      await this.notificationTrackRepository.save(notificationTrack);

      const emailData: SendEmailDto = {
        to: [{ email: recipientEmail }],
        subject,
        html: content,
      };

      const response = await this.infobipEmailService.sendEmail(emailData);

      if (response.messages && response.messages.length > 0) {
        const message = response.messages[0];
        const status = this.mapInfobipStatusToNotificationStatus(message.status.groupId);

        await this.notificationTrackRepository.update(notificationTrack.id, {
          messageId: message.messageId,
          status,
          sentAt: new Date(),
          metadata: metadata as any,
        });

        this.logger.log(`Email sent successfully for approval request ${approvalRequestId} to ${recipientEmail}`);
      }

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrack.id },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after creation');
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send email for approval request ${approvalRequestId}:`, error);

      if (notificationTrack) {
        await this.notificationTrackRepository.update(notificationTrack.id, {
          status: NotificationStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: (notificationTrack.retryCount || 0) + 1,
        });
      }

      throw error;
    }
  }

  async sendApprovalRequestWhatsApp(
    approvalRequestId: string,
    recipientPhone: string,
    message: string,
    metadata?: Record<string, unknown>,
    recipientId?: string,
  ): Promise<NotificationTrack> {
    let notificationTrack: NotificationTrack | undefined;

    try {
      const approvalRequest = await this.approvalRequestRepository.findOne({
        where: { id: approvalRequestId },
      });

      if (!approvalRequest) {
        throw new Error(`Approval request with ID ${approvalRequestId} not found`);
      }

      notificationTrack = this.notificationTrackRepository.create({
        approvalRequestId,
        type: NotificationType.WHATSAPP,
        status: NotificationStatus.PENDING,
        recipient: recipientPhone,
        recipientId,
        content: message,
        metadata,
        retryCount: 0,
      });

      await this.notificationTrackRepository.save(notificationTrack);

      const whatsappData: WhatsAppTextMessageDto = {
        to: recipientPhone,
        text: message,
      };

      const response = await this.infobipWhatsAppService.sendTextMessage(whatsappData);

      const status = this.mapInfobipStatusToNotificationStatus(response.status.groupId);

      await this.notificationTrackRepository.update(notificationTrack.id, {
        messageId: response.messageId,
        status,
        sentAt: new Date(),
        metadata: metadata as any,
      });

      this.logger.log(`WhatsApp message sent successfully for approval request ${approvalRequestId} to ${recipientPhone}`);

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrack.id },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after creation');
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message for approval request ${approvalRequestId}:`, error);

      if (notificationTrack) {
        const errorMessage = this.formatWhatsAppErrorMessage(error);
        
        await this.notificationTrackRepository.update(notificationTrack.id, {
          status: NotificationStatus.FAILED,
          errorMessage,
          retryCount: (notificationTrack.retryCount || 0) + 1,
        });
      }

      throw error;
    }
  }

  async sendBulkApprovalRequestNotifications(
    approvalRequestId: string,
    emailRecipients: Array<{ email: string; subject: string; content: string }>,
    whatsappRecipients: Array<{ phone: string; message: string }>,
  ): Promise<{
    emailResults: NotificationTrack[];
    whatsappResults: NotificationTrack[];
  }> {
    const emailResults: NotificationTrack[] = [];
    const whatsappResults: NotificationTrack[] = [];

    for (const recipient of emailRecipients) {
      try {
        const result = await this.sendApprovalRequestEmail(
          approvalRequestId,
          recipient.email,
          recipient.subject,
          recipient.content,
        );
        emailResults.push(result);
      } catch (error) {
        this.logger.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }

    for (const recipient of whatsappRecipients) {
      try {
        const result = await this.sendApprovalRequestWhatsApp(
          approvalRequestId,
          recipient.phone,
          recipient.message,
        );
        whatsappResults.push(result);
      } catch (error) {
        this.logger.error(`Failed to send WhatsApp to ${recipient.phone}:`, error);
      }
    }

    return { emailResults, whatsappResults };
  }

  async sendNotificationsToApprovers(
    approvalRequestId: string,
    subject?: string,
    emailContent?: string,
    whatsappContent?: string,
  ): Promise<{
    emailResults: NotificationTrack[];
    whatsappResults: NotificationTrack[];
  }> {
    const approvalRequest = await this.approvalRequestRepository.findOne({
      where: { id: approvalRequestId },
    });

    console.log(approvalRequest);

    if (!approvalRequest) {
      throw new Error(`Approval request with ID ${approvalRequestId} not found`);
    }

    if (!approvalRequest.approverIds || approvalRequest.approverIds.length === 0) {
      throw new Error(`No approvers found for approval request ${approvalRequestId}`);
    }

    const approvers = await this.userRepository.find({ where: { id: In(approvalRequest.approverIds) } });
    console.log("approvers", approvers);
    const emailResults: NotificationTrack[] = [];
    const whatsappResults: NotificationTrack[] = [];

    const defaultSubject = `Approval Request: ${approvalRequest.subject || approvalRequest.code}`;
         const defaultEmailContent = `
       <!DOCTYPE html>
       <html lang="en">
       <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Approval Request Notification</title>
         <style>
           body {
             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
             line-height: 1.6;
             color: #333;
             background-color: #f8f9fa;
             margin: 0;
             padding: 0;
           }
           .container {
             max-width: 600px;
             margin: 0 auto;
             background-color: #ffffff;
             border-radius: 8px;
             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
             overflow: hidden;
           }
                                   .header {
              background: linear-gradient(135deg, #CEFFCF 0%, #9BE6A3 100%);
              color: #2c5530;
              padding: 30px;
              text-align: center;
            }
            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .request-info {
              background-color: #f0fdf0;
              border-left: 4px solid #CEFFCF;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
            }
           .info-row {
             display: flex;
             justify-content: space-between;
             margin-bottom: 12px;
             align-items: center;
           }
           .info-row:last-child {
             margin-bottom: 0;
           }
           .label {
             font-weight: 600;
             color: #495057;
             min-width: 120px;
           }
           .value {
             color: #212529;
             text-align: right;
             flex: 1;
           }
           .status-badge {
             display: inline-block;
             padding: 4px 12px;
             border-radius: 20px;
             font-size: 12px;
             font-weight: 600;
             text-transform: uppercase;
             letter-spacing: 0.5px;
           }
                       .status-pending {
              background-color: #fff3cd;
              color: #856404;
            }
            .status-approved {
              background-color: #CEFFCF;
              color: #2c5530;
            }
            .status-rejected {
              background-color: #f8d7da;
              color: #721c24;
            }
            .action-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background-color: #f0fdf0;
              border-radius: 8px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #CEFFCF 0%, #9BE6A3 100%);
              color: #2c5530;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(206, 255, 207, 0.3);
              font-color: #2c5530;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(206, 255, 207, 0.4);
            }
            .footer {
              background-color: #f0fdf0;
              padding: 20px 30px;
              text-align: center;
              border-top: 1px solid #CEFFCF;
            }
            .footer-text {
              font-size: 12px;
              color: #6c757d;
              margin-bottom: 10px;
            }
            .footer-link {
              color: #2c5530;
              text-decoration: none;
              word-break: break-all;
            }
           .footer-link:hover {
             text-decoration: underline;
           }
           @media only screen and (max-width: 600px) {
             .container {
               margin: 10px;
               border-radius: 4px;
             }
             .header, .content, .footer {
               padding: 20px;
             }
             .info-row {
               flex-direction: column;
               align-items: flex-start;
               text-align: left;
             }
             .label {
               min-width: auto;
               margin-bottom: 4px;
             }
             .value {
               text-align: left;
             }
           }
         </style>
       </head>
       <body>
                   <div class="container">
            <div class="header">
              <img src="https://nna-app-s3.s3.ap-southeast-3.amazonaws.com/kcsi/logo-kcsi" alt="KCSI Logo" class="logo">
              <h1>Approval Request Notification</h1>
            </div>
           
           <div class="content">
             <p>Hello,</p>
             <p>You have received a new approval request that requires your attention. Please review the details below and take appropriate action.</p>
             
             <div class="request-info">
               <div class="info-row">
                 <span class="label">Request Code:</span>
                 <span class="value"><strong>${approvalRequest.code}</strong></span>
               </div>
               <div class="info-row">
                 <span class="label">Subject:</span>
                 <span class="value">${approvalRequest.subject || 'N/A'}</span>
               </div>
               <div class="info-row">
                 <span class="label">Description:</span>
                 <span class="value">${approvalRequest.description || 'N/A'}</span>
               </div>
               <div class="info-row">
                 <span class="label">Status:</span>
                 <span class="value">
                   <span class="status-badge status-${(approvalRequest.status || 'pending').toLowerCase()}">
                     ${approvalRequest.status || 'Pending'}
                   </span>
                 </span>
               </div>
               <div class="info-row">
                 <span class="label">Created By:</span>
                 <span class="value">${approvalRequest.createdBy || 'N/A'}</span>
               </div>
             </div>
             
             <div class="action-section">
               <p style="margin-bottom: 20px; color: #495057;">Please click the button below to review and take action on this request:</p>
               <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-process/${approvalRequest.id}" class="cta-button">
                 Review & Approve Request
               </a>
             </div>
             
             <p style="color: #6c757d; font-size: 14px;">
               <strong>Note:</strong> This request is awaiting your approval. Please respond promptly to ensure timely processing.
             </p>
           </div>
           
           <div class="footer">
             <p class="footer-text">
               If the button above doesn't work, copy and paste this link into your browser:
             </p>
             <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-process/${approvalRequest.id}" class="footer-link">
               ${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-process/${approvalRequest.id}
             </a>
             <p class="footer-text" style="margin-top: 15px;">
               This is an automated notification. Please do not reply to this email.
             </p>
           </div>
         </div>
       </body>
       </html>
     `;

    const defaultWhatsappContent = `Approval Request: ${approvalRequest.code}\nSubject: ${approvalRequest.subject || 'N/A'}\nDescription: ${approvalRequest.description || 'N/A'}\nStatus: ${approvalRequest.status || 'Pending'}\n\nPlease review and approve/reject this request:\n${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-requests/${approvalRequest.id}`;

    for (const approver of approvers) {
        try {
          const unhashedEmail = approver.getUnhashedEmail() ? approver.getUnhashedEmail() : null;
          const unhashedPhone = approver.getUnhashedPhone() ? approver.getUnhashedPhone() : null;

          if (unhashedEmail) {
            const approverEmailContent = emailContent || defaultEmailContent.replace(
              /\/approval-process\/([^"]+)/g,
              `/approval-process/$1?approverId=${approver.id}`
            );
            
            const result = await this.sendApprovalRequestEmail(
              approvalRequestId,
              unhashedEmail,
              subject || defaultSubject,
              approverEmailContent,
              undefined,
              approver.id,
            );
            emailResults.push(result);
          }

          if (unhashedPhone) {
            const approverWhatsappContent = whatsappContent || defaultWhatsappContent.replace(
              /\/approval-process\/([^\s]+)/g,
              `/approval-process/$1?approverId=${approver.id}`
            );
            
            try {
              const result = await this.sendApprovalRequestWhatsApp(
                approvalRequestId,
                unhashedPhone,
                approverWhatsappContent,
                undefined,
                approver.id,
              );
              whatsappResults.push(result);
            } catch (error) {
              if (this.isSessionError(error)) {
                this.logger.warn(`Session error for WhatsApp to ${unhashedPhone}. Attempting template message.`);
                
                try {
                  const templateVariables = [
                    { name: 'approval_request_code', value: approvalRequest.code },
                    { name: 'approver_name', value: approver.email || 'Approver' },
                    { name: 'approval_url', value: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/approval-process/${approvalRequest.id}?approverId=${approver.id}` },
                  ];
                  
                  const templateResult = await this.sendApprovalRequestWhatsAppTemplate(
                    approvalRequestId,
                    unhashedPhone,
                    'approval_request_notification',
                    templateVariables,
                    undefined,
                    approver.id,
                  );
                  whatsappResults.push(templateResult);
                } catch (templateError) {
                  this.logger.error(`Failed to send WhatsApp template message to ${unhashedPhone}:`, templateError);
                }
              } else {
                this.logger.error(`Failed to send WhatsApp message to ${unhashedPhone}:`, error);
              }
            }
          }
        } catch (error) {
          this.logger.error(`Failed to send notification to approver ${approver.id}:`, error);
        }
      }

    return { emailResults, whatsappResults };
  }

  async updateNotificationStatus(
    messageId: string,
    status: NotificationStatus,
    deliveredAt?: Date,
  ): Promise<void> {
    await this.notificationTrackRepository.update(
      { messageId },
      {
        status,
        deliveredAt: deliveredAt || new Date(),
      },
    );
  }

  async checkEmailDeliveryStatus(messageId: string): Promise<NotificationStatus> {
    try {
      const logs = await this.infobipEmailService.getEmailMessageLogs(messageId);
      
      if (logs && logs.results && logs.results.length > 0) {
        const latestLog = logs.results[0];
        const status = this.mapInfobipStatusToNotificationStatus(latestLog.status?.groupId);
        
        await this.updateNotificationStatus(messageId, status, new Date());
        return status;
      }
      
      return NotificationStatus.PENDING;
    } catch (error) {
      this.logger.error(`Failed to check email delivery status for messageId ${messageId}:`, error);
      return NotificationStatus.FAILED;
    }
  }

  async checkWhatsAppDeliveryStatus(messageId: string): Promise<NotificationStatus> {
    try {
      const report = await this.infobipWhatsAppService.getWhatsAppReportById(messageId);
      
      if (report) {
        const status = this.mapWhatsAppStatusToNotificationStatus(report.status);
        
        await this.updateNotificationStatus(messageId, status, new Date());
        return status;
      }
      
      return NotificationStatus.PENDING;
    } catch (error) {
      this.logger.error(`Failed to check WhatsApp delivery status for messageId ${messageId}:`, error);
      return NotificationStatus.FAILED;
    }
  }

  async getNotificationTracksByApprovalRequest(
    approvalRequestId: string,
  ): Promise<NotificationTrack[]> {
    return await this.notificationTrackRepository.find({
      where: { approvalRequestId },
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationTracksByStatus(
    status: NotificationStatus,
  ): Promise<NotificationTrack[]> {
    return await this.notificationTrackRepository.find({
      where: { status },
      relations: ['approvalRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationTrackByMessageId(messageId: string): Promise<NotificationTrack | null> {
    return await this.notificationTrackRepository.findOne({
      where: { messageId },
      relations: ['approvalRequest'],
    });
  }

  async getNotificationTrackById(id: string): Promise<NotificationTrack | null> {
    return await this.notificationTrackRepository.findOne({
      where: { id },
      relations: ['approvalRequest'],
    });
  }

  async retryFailedNotifications(
    notificationTrackId: string,
  ): Promise<NotificationTrack> {
    const notificationTrack = await this.notificationTrackRepository.findOne({
      where: { id: notificationTrackId },
    });

    if (!notificationTrack) {
      throw new Error(`Notification track with ID ${notificationTrackId} not found`);
    }

    if (notificationTrack.status !== NotificationStatus.FAILED) {
      throw new Error(`Notification track is not in failed status`);
    }

    try {
      if (notificationTrack.type === NotificationType.EMAIL) {
        const emailData: SendEmailDto = {
          to: [{ email: notificationTrack.recipient }],
          subject: notificationTrack.subject,
          html: notificationTrack.content,
        };

        const response = await this.infobipEmailService.sendEmail(emailData);
        const status = this.mapInfobipStatusToNotificationStatus(
          response.messages[0].status.groupId,
        );

        await this.notificationTrackRepository.update(notificationTrackId, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
        });
      } else if (notificationTrack.type === NotificationType.WHATSAPP) {
        const whatsappData: WhatsAppTextMessageDto = {
          to: notificationTrack.recipient,
          text: notificationTrack.content,
        };

        const response = await this.infobipWhatsAppService.sendTextMessage(whatsappData);
        const status = this.mapInfobipStatusToNotificationStatus(response.status.groupId);

        await this.notificationTrackRepository.update(notificationTrackId, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
        });
      }

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrackId },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after retry');
      }

      return result;
    } catch (error) {
      await this.notificationTrackRepository.update(notificationTrackId, {
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
        retryCount: (notificationTrack.retryCount || 0) + 1,
      });

      throw error;
    }
  }

  async retryResendByMessageId(messageId: string): Promise<NotificationTrack> {
    const notificationTrack = await this.notificationTrackRepository.findOne({
      where: { messageId },
    });

    if (!notificationTrack) {
      throw new Error(`Notification track with messageId ${messageId} not found`);
    }

    if (notificationTrack.retryCount && notificationTrack.retryCount >= this.maxRetries) {
      throw new Error(`Maximum retry attempts (${this.maxRetries}) exceeded for this notification`);
    }

    try {
      if (notificationTrack.type === NotificationType.EMAIL) {
        const emailData: SendEmailDto = {
          to: [{ email: notificationTrack.recipient }],
          subject: notificationTrack.subject,
          html: notificationTrack.content,
        };

        const response = await this.infobipEmailService.sendEmail(emailData);
        const status = this.mapInfobipStatusToNotificationStatus(
          response.messages[0].status.groupId,
        );

        await this.notificationTrackRepository.update(notificationTrack.id, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
          errorMessage: undefined,
        });

        this.logger.log(`Email resent successfully for messageId ${messageId} to ${notificationTrack.recipient}`);
      } else if (notificationTrack.type === NotificationType.WHATSAPP) {
        const whatsappData: WhatsAppTextMessageDto = {
          to: notificationTrack.recipient,
          text: notificationTrack.content,
        };

        const response = await this.infobipWhatsAppService.sendTextMessage(whatsappData);
        const status = this.mapInfobipStatusToNotificationStatus(response.status.groupId);

        await this.notificationTrackRepository.update(notificationTrack.id, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
          errorMessage: undefined,
        });

        this.logger.log(`WhatsApp message resent successfully for messageId ${messageId} to ${notificationTrack.recipient}`);
      }

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrack.id },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after retry resend');
      }

      return result;
    } catch (error) {
      await this.notificationTrackRepository.update(notificationTrack.id, {
        status: NotificationStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error during retry',
        retryCount: (notificationTrack.retryCount || 0) + 1,
      });

      this.logger.error(`Failed to retry resend notification for messageId ${messageId}:`, error);
      throw error;
    }
  }

  async retryResendByNotificationTrackId(notificationTrackId: string): Promise<NotificationTrack> {
    const notificationTrack = await this.notificationTrackRepository.findOne({
      where: { id: notificationTrackId },
    });

    if (!notificationTrack) {
      throw new Error(`Notification track with ID ${notificationTrackId} not found`);
    }

    if (notificationTrack.retryCount && notificationTrack.retryCount >= this.maxRetries) {
      throw new Error(`Maximum retry attempts (${this.maxRetries}) exceeded for this notification`);
    }

    try {
      if (notificationTrack.type === NotificationType.EMAIL) {
        const emailData: SendEmailDto = {
          to: [{ email: notificationTrack.recipient }],
          subject: notificationTrack.subject,
          html: notificationTrack.content,
        };

        const response = await this.infobipEmailService.sendEmail(emailData);
        const status = this.mapInfobipStatusToNotificationStatus(
          response.messages[0].status.groupId,
        );

        await this.notificationTrackRepository.update(notificationTrack.id, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
          errorMessage: undefined,
        });

        this.logger.log(`Email resent successfully for notification track ID ${notificationTrackId} to ${notificationTrack.recipient}`);
      } else if (notificationTrack.type === NotificationType.WHATSAPP) {
        const whatsappData: WhatsAppTextMessageDto = {
          to: notificationTrack.recipient,
          text: notificationTrack.content,
        };

        const response = await this.infobipWhatsAppService.sendTextMessage(whatsappData);
        const status = this.mapInfobipStatusToNotificationStatus(response.status.groupId);

        await this.notificationTrackRepository.update(notificationTrack.id, {
          status,
          sentAt: new Date(),
          retryCount: (notificationTrack.retryCount || 0) + 1,
          errorMessage: undefined,
        });

        this.logger.log(`WhatsApp message resent successfully for notification track ID ${notificationTrackId} to ${notificationTrack.recipient}`);
      }

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrack.id },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after retry resend');
      }

      return result;
    } catch (error) {
      await this.notificationTrackRepository.update(notificationTrack.id, {
        status: NotificationStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error during retry',
        retryCount: (notificationTrack.retryCount || 0) + 1,
      });

      this.logger.error(`Failed to retry resend notification for notification track ID ${notificationTrackId}:`, error);
      throw error;
    }
  }

  async checkRetryEligibility(messageId: string): Promise<{
    canRetry: boolean;
    reason: string;
    retryCount: number;
    maxRetries: number;
    status: string;
    type: string;
  }> {
    const notificationTrack = await this.notificationTrackRepository.findOne({
      where: { messageId },
    });

    if (!notificationTrack) {
      throw new Error(`Notification track with messageId ${messageId} not found`);
    }

    const currentRetryCount = notificationTrack.retryCount || 0;
    
    let canRetry = false;
    let reason = '';

    if (currentRetryCount >= this.maxRetries) {
      reason = `Maximum retry attempts (${this.maxRetries}) exceeded`;
    } else if (notificationTrack.status === NotificationStatus.DELIVERED) {
      reason = 'Notification already delivered successfully';
    } else if (notificationTrack.status === NotificationStatus.SENT) {
      canRetry = true;
      reason = 'Notification sent but can be retried if needed';
    } else if (notificationTrack.status === NotificationStatus.FAILED || notificationTrack.status === NotificationStatus.REJECTED) {
      canRetry = true;
      reason = 'Notification failed and can be retried';
    } else if (notificationTrack.status === NotificationStatus.PENDING) {
      canRetry = true;
      reason = 'Notification is pending and can be retried';
    } else {
      reason = 'Unknown status, cannot determine retry eligibility';
    }

    return {
      canRetry,
      reason,
      retryCount: currentRetryCount,
      maxRetries: this.maxRetries,
      status: notificationTrack.status,
      type: notificationTrack.type,
    };
  }

  async checkRetryEligibilityByNotificationTrackId(notificationTrackId: string): Promise<{
    canRetry: boolean;
    reason: string;
    retryCount: number;
    maxRetries: number;
    status: string;
    type: string;
  }> {
    const notificationTrack = await this.notificationTrackRepository.findOne({
      where: { id: notificationTrackId },
    });

    if (!notificationTrack) {
      throw new Error(`Notification track with ID ${notificationTrackId} not found`);
    }

    const currentRetryCount = notificationTrack.retryCount || 0;
    
    let canRetry = false;
    let reason = '';

    if (currentRetryCount >= this.maxRetries) {
      reason = `Maximum retry attempts (${this.maxRetries}) exceeded`;
    } else if (notificationTrack.status === NotificationStatus.DELIVERED) {
      reason = 'Notification already delivered successfully';
    } else if (notificationTrack.status === NotificationStatus.SENT) {
      canRetry = true;
      reason = 'Notification sent but can be retried if needed';
    } else if (notificationTrack.status === NotificationStatus.FAILED || notificationTrack.status === NotificationStatus.REJECTED) {
      canRetry = true;
      reason = 'Notification failed and can be retried';
    } else if (notificationTrack.status === NotificationStatus.PENDING) {
      canRetry = true;
      reason = 'Notification is pending and can be retried';
    } else {
      reason = 'Unknown status, cannot determine retry eligibility';
    }

    return {
      canRetry,
      reason,
      retryCount: currentRetryCount,
      maxRetries: this.maxRetries,
      status: notificationTrack.status,
      type: notificationTrack.type,
    };
  }

  private mapInfobipStatusToNotificationStatus(groupId: number): NotificationStatus {
    switch (groupId) {
      case 1:
      case 2:
        return NotificationStatus.SENT;
      case 3:
        return NotificationStatus.DELIVERED;
      case 4:
        return NotificationStatus.FAILED;
      case 5:
        return NotificationStatus.REJECTED;
      default:
        return NotificationStatus.PENDING;
    }
  }

  private mapWhatsAppStatusToNotificationStatus(status: string): NotificationStatus {
    switch (status?.toUpperCase()) {
      case 'SENT':
        return NotificationStatus.SENT;
      case 'DELIVERED':
        return NotificationStatus.DELIVERED;
      case 'READ':
        return NotificationStatus.DELIVERED;
      case 'FAILED':
        return NotificationStatus.FAILED;
      case 'REJECTED':
        return NotificationStatus.REJECTED;
      default:
        return NotificationStatus.PENDING;
    }
  }

  async sendApprovalRequestWhatsAppTemplate(
    approvalRequestId: string,
    recipientPhone: string,
    templateName: string,
    templateVariables: Array<{ name: string; value: string }>,
    metadata?: Record<string, unknown>,
    recipientId?: string,
  ): Promise<NotificationTrack> {
    let notificationTrack: NotificationTrack | undefined;

    try {
      const approvalRequest = await this.approvalRequestRepository.findOne({
        where: { id: approvalRequestId },
      });

      if (!approvalRequest) {
        throw new Error(`Approval request with ID ${approvalRequestId} not found`);
      }

      notificationTrack = this.notificationTrackRepository.create({
        approvalRequestId,
        type: NotificationType.WHATSAPP,
        status: NotificationStatus.PENDING,
        recipient: recipientPhone,
        recipientId,
        content: `Template: ${templateName}`,
        metadata,
        retryCount: 0,
      });

      await this.notificationTrackRepository.save(notificationTrack);

      const templateData = {
        to: recipientPhone,
        templateName,
        language: 'en',
        variables: templateVariables,
      };

      const response = await this.infobipWhatsAppService.sendTemplateMessage(templateData);

      const status = this.mapInfobipStatusToNotificationStatus(response.status.groupId);

      await this.notificationTrackRepository.update(notificationTrack.id, {
        messageId: response.messageId,
        status,
        sentAt: new Date(),
        metadata: metadata as any,
      });

      this.logger.log(`WhatsApp template message sent successfully for approval request ${approvalRequestId} to ${recipientPhone}`);

      const result = await this.notificationTrackRepository.findOne({
        where: { id: notificationTrack.id },
      });

      if (!result) {
        throw new Error('Failed to retrieve notification track after creation');
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp template message for approval request ${approvalRequestId}:`, error);

      if (notificationTrack) {
        const errorMessage = this.formatWhatsAppErrorMessage(error);
        
        await this.notificationTrackRepository.update(notificationTrack.id, {
          status: NotificationStatus.FAILED,
          errorMessage,
          retryCount: (notificationTrack.retryCount || 0) + 1,
        });
      }

      throw error;
    }
  }

  private isSessionError(error: any): boolean {
    if (error?.response?.data?.requestError?.serviceException?.variables) {
      const variables = error.response.data.requestError.serviceException.variables;
      return variables.some((v: any) => v.key === 'code' && v.value === '7010');
    }
    
    if (error?.response?.data?.requestError?.serviceException?.text) {
      const errorText = error.response.data.requestError.serviceException.text.toLowerCase();
      return errorText.includes('session') || errorText.includes('7010') || errorText.includes('ec_no_session');
    }
    
    return false;
  }

  private formatWhatsAppErrorMessage(error: any): string {
    if (this.isSessionError(error)) {
      return 'WhatsApp session not established. The recipient needs to initiate a conversation first or the session has expired. Please use a WhatsApp template message for initial contact.';
    }

    if (error.response?.data?.requestError?.serviceException?.text) {
      return error.response.data.requestError.serviceException.text;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    return error.message || 'Failed to send WhatsApp message - Unknown error occurred';
  }
}
