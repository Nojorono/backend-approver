import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  SendEmailDto,
  ValidateEmailDto,
  EmailValidationResponseDto,
  EmailReportDto,
  EmailReportsQueryDto,
} from '../dto/email.dto';
import { InfobipAuthService, AuthMethod } from './infobip-auth.service';
import { INFOBIP_ENDPOINTS } from '../../core/config/infobip.config';

export interface EmailResponseDto {
  messages: Array<{
    messageId: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
    to: string;
  }>;
}

@Injectable()
export class InfobipEmailService {
  private readonly logger = new Logger(InfobipEmailService.name);

  constructor(
    private readonly authService: InfobipAuthService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(
    emailData: SendEmailDto,
    authMethod: AuthMethod = 'oauth2',
  ): Promise<EmailResponseDto> {
    const maxRetries = parseInt(this.configService.get('INFOBIP_RETRIES', '3'));
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Sending email to ${emailData.to.length} recipient(s) - Attempt ${attempt}/${maxRetries}`,
        );

        // Validate required fields
        if (!emailData.to || emailData.to.length === 0) {
          throw new BadRequestException(
            'Missing required fields: to is required',
          );
        }

        if (!emailData.html && !emailData.text) {
          throw new BadRequestException(
            'Missing required fields: either html or text content is required',
          );
        }

        // Use registered sender if not provided
        const defaultSender = this.configService.get(
          'INFOBIP_EMAIL_SENDER',
          'noreply@kcsi.id',
        );
        const sender = emailData.from || defaultSender;

        // Create FormData for multipart/form-data
        const FormData = require('form-data');
        const formData = new FormData();

        // Add basic email fields
        formData.append('from', sender);
        formData.append('subject', emailData.subject);

        // Handle template vs raw content
        if (emailData.text) formData.append('text', emailData.text);
        if (emailData.html) formData.append('html', emailData.html);

        // Add recipients (simple format that works)
        emailData.to.forEach((recipient, index) => {
          if (!recipient.email) {
            throw new BadRequestException(
              `Missing email address for recipient at index ${index}`,
            );
          }
          formData.append('to', recipient.email);
        });

        // Add CC recipients
        if (emailData.cc) {
          emailData.cc.forEach((recipient, index) => {
            if (!recipient.email) {
              throw new BadRequestException(
                `Missing email address for CC recipient at index ${index}`,
              );
            }
            formData.append('cc', recipient.email);
          });
        }

        // Add BCC recipients
        if (emailData.bcc) {
          emailData.bcc.forEach((recipient, index) => {
            if (!recipient.email) {
              throw new BadRequestException(
                `Missing email address for BCC recipient at index ${index}`,
              );
            }
            formData.append('bcc', recipient.email);
          });
        }

        // Add optional fields
        if (emailData.campaignId)
          formData.append('campaignId', emailData.campaignId);

        // Add attachments (if needed)
        if (emailData.attachments) {
          emailData.attachments.forEach((attachment, index) => {
            formData.append(
              `attachment${index}`,
              Buffer.from(attachment.content, 'base64'),
              {
                filename: attachment.filename,
                contentType: attachment.contentType,
              },
            );
          });
        }

        // Get the FormData headers
        const formDataHeaders = formData.getHeaders();

        // Get authenticated client
        const client =
          await this.authService.getAuthenticatedClient(authMethod);

        // Create a new axios instance for this request to avoid header conflicts
        const emailClient = axios.create({
          baseURL: this.configService.get('INFOBIP_BASE_URL'),
          timeout: parseInt(this.configService.get('INFOBIP_TIMEOUT', '30000')),
        });

        // Add authentication header from the authenticated client
        const authHeader = client.defaults.headers.Authorization;
        if (!authHeader) {
          throw new BadRequestException('Authentication failed');
        }
        emailClient.defaults.headers.Authorization = authHeader;

        const response = await emailClient.post<EmailResponseDto>(
          INFOBIP_ENDPOINTS.EMAIL.SEND,
          formData,
          {
            headers: {
              ...formDataHeaders,
            },
          },
        );

        // Check if the response indicates success
        if (response.data.messages && response.data.messages.length > 0) {
          const messageStatus = response.data.messages[0].status;
          if (messageStatus.groupId === 1 || messageStatus.groupId === 2) {
            this.logger.log(
              `Email sent successfully. Message ID: ${response.data.messages[0]?.messageId}, Status: ${messageStatus.name}`,
            );
            return response.data;
          } else {
            throw new BadRequestException(
              `Email delivery failed: ${messageStatus.description}`,
            );
          }
        } else {
          throw new BadRequestException('Invalid response from Infobip API');
        }
      } catch (error) {
        lastError = error;
        this.logger.error(
          `Failed to send email (Attempt ${attempt}/${maxRetries}):`,
          {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
            },
          },
        );

        // Don't retry on validation errors or authentication errors
        if (
          error.response?.status === 400 ||
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const errorMessage = this.formatErrorMessage(lastError);
    this.logger.error('All attempts to send email failed:', errorMessage);
    throw new BadRequestException(errorMessage);
  }

  private formatErrorMessage(error: any): string {
    if (error.response?.data?.requestError?.serviceException?.text) {
      return error.response.data.requestError.serviceException.text;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Bad request - Invalid email data or configuration';
        case 401:
          return 'Unauthorized - Invalid API key or authentication';
        case 403:
          return 'Forbidden - Insufficient permissions';
        case 429:
          return 'Rate limit exceeded - Too many requests';
        case 500:
          return 'Internal server error - Infobip service unavailable';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable - Please try again later';
        default:
          return `HTTP ${error.response.status} - ${error.response.statusText}`;
      }
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout - Service is taking too long to respond';
    }

    if (error.code === 'ENOTFOUND') {
      return 'Network error - Cannot reach Infobip service';
    }

    return error.message || 'Failed to send email - Unknown error occurred';
  }

  async validateEmail(
    emailData: ValidateEmailDto,
    authMethod: AuthMethod = 'oauth2',
  ): Promise<EmailValidationResponseDto> {
    try {
      this.logger.log(`Validating email: ${emailData.email}`);

      const client = await this.authService.getAuthenticatedClient(authMethod);

      const response = await client.post<EmailValidationResponseDto>(
        INFOBIP_ENDPOINTS.EMAIL.VALIDATE,
        { email: emailData.email },
      );

      this.logger.log(`Email validation completed for: ${emailData.email}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to validate email:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text ||
          'Failed to validate email',
      );
    }
  }

  async getEmailReports(
    query: EmailReportsQueryDto,
    authMethod: AuthMethod = 'oauth2',
  ): Promise<{ results: EmailReportDto[]; totalCount: number }> {
    try {
      this.logger.log('Fetching email reports');

      const client = await this.authService.getAuthenticatedClient(authMethod);

      const params = new URLSearchParams();
      if (query.from) params.append('from', query.from);
      if (query.to) params.append('to', query.to);
      if (query.email) params.append('email', query.email);
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await client.get<{
        results: EmailReportDto[];
        totalCount: number;
      }>(`${INFOBIP_ENDPOINTS.EMAIL.REPORTS}?${params.toString()}`);

      this.logger.log(
        `Retrieved ${response.data.results.length} email reports`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch email reports:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text ||
          'Failed to fetch email reports',
      );
    }
  }

  async getEmailReportById(
    messageId: string,
    authMethod: AuthMethod = 'oauth2',
  ): Promise<EmailReportDto> {
    try {
      this.logger.log(`Fetching email report for message ID: ${messageId}`);

      const client = await this.authService.getAuthenticatedClient(authMethod);

      const response = await client.get<EmailReportDto>(
        `${INFOBIP_ENDPOINTS.EMAIL.REPORTS}/${messageId}`,
      );

      this.logger.log(`Retrieved email report for message ID: ${messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch email report for message ID ${messageId}:`,
        error,
      );
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text ||
          'Failed to fetch email report',
      );
    }
  }

  async getEmailTemplates(authMethod: AuthMethod = 'oauth2'): Promise<any> {
    try {
      this.logger.log('Fetching available email templates');

      const client = await this.authService.getAuthenticatedClient(authMethod);

      const response = await client.get('/email/2/templates');

      this.logger.log(
        `Retrieved ${response.data?.length || 0} email templates`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch email templates:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text ||
          'Failed to fetch email templates',
      );
    }
  }

  async sendBulkEmails(
    emails: SendEmailDto[],
    authMethod: AuthMethod = 'oauth2',
  ): Promise<EmailResponseDto[]> {
    try {
      this.logger.log(`Sending ${emails.length} bulk emails`);

      const client = await this.authService.getAuthenticatedClient(authMethod);
      const results: EmailResponseDto[] = [];

      for (const emailData of emails) {
        try {
          const result = await this.sendEmail(emailData, authMethod);
          results.push(result);
        } catch (error) {
          this.logger.error(
            `Failed to send email to ${emailData.to[0]?.email}:`,
            error,
          );
          results.push({
            messages: [
              {
                messageId: '',
                status: {
                  groupId: 5,
                  groupName: 'REJECTED',
                  id: 500,
                  name: 'INTERNAL_ERROR',
                  description: 'Failed to send email',
                },
                to: emailData.to[0]?.email || '',
              },
            ],
          });
        }
      }

      this.logger.log(
        `Bulk email sending completed. ${results.length} emails processed`,
      );
      return results;
    } catch (error) {
      this.logger.error('Failed to send bulk emails:', error);
      throw new BadRequestException('Failed to send bulk emails');
    }
  }
}
