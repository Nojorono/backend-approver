import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  WhatsAppTextMessageDto,
  WhatsAppMediaMessageDto,
  WhatsAppLocationDto,
  WhatsAppContactDto,
  WhatsAppTemplateDto,
  WhatsAppTemplateInfoDto,
  WhatsAppReportDto,
  WhatsAppReportsQueryDto,
  SendWhatsAppMessageDto,
  WhatsAppMessageType
} from '../dto/whatsapp.dto';
import { InfobipAuthService, AuthMethod } from './infobip-auth.service';
import { INFOBIP_ENDPOINTS } from '../../core/config/infobip.config';

export interface WhatsAppResponseDto {
  messageId: string;
  status: {
    groupId: number;
    groupName: string;
    id: number;
    name: string;
    description: string;
  };
  to: string;
}

@Injectable()
export class InfobipWhatsAppService {
  private readonly logger = new Logger(InfobipWhatsAppService.name);

  constructor(
    private readonly authService: InfobipAuthService,
    private readonly configService: ConfigService,
  ) {}

  private formatPhoneNumber(phoneNumber: string, isSender: boolean = false): string {
    if (!phoneNumber) return phoneNumber;
    
    if (isSender) {
      // For sender, use the number as-is (Infobip expects format like 447860099299)
      return phoneNumber.replace(/^\+/, '');
    } else {
      // For recipient, ensure proper international format
      if (!phoneNumber.startsWith('+')) {
        if (phoneNumber.startsWith('0')) {
          // Assuming Indonesia (+62) if starts with 0
          return `+62${phoneNumber.substring(1)}`;
        } else {
          return `+${phoneNumber}`;
        }
      }
      return phoneNumber;
    }
  }

  async sendTextMessage(
    messageData: WhatsAppTextMessageDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    const maxRetries = parseInt(this.configService.get('INFOBIP_RETRIES', '3'));
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Sending WhatsApp text message to ${messageData.to} - Attempt ${attempt}/${maxRetries}`);
        
        // Validate required fields
        if (!messageData.to || !messageData.text) {
          throw new BadRequestException('Missing required fields: to and text are required');
        }

        const client = await this.authService.getAuthenticatedClient(authMethod);
        
        // Format phone numbers
        const senderConfig = this.configService.get('INFOBIP_WHATSAPP_SENDER');
        if (!senderConfig) {
          throw new BadRequestException('INFOBIP_WHATSAPP_SENDER environment variable is not configured. Please set it in your .env file.');
        }
        
        const sender = this.formatPhoneNumber(senderConfig, true);
        console.log('sender', sender);
        const recipient = this.formatPhoneNumber(messageData.to, false);
        
        if (!sender || sender === 'null' || sender === 'undefined') {
          throw new BadRequestException(`Invalid INFOBIP_WHATSAPP_SENDER: "${senderConfig}". Please configure a valid WhatsApp Business number.`);
        }
        
        const payload = {
          from: sender,
          to: recipient,
          messageId: messageData.messageId || `msg-${Date.now()}`,
          content: {
            text: messageData.text,
          },
          callbackData: messageData.callbackData,
          notifyUrl: messageData.notifyUrl,
          urlOptions: messageData.urlOptions,
        };

        console.log('payload', payload);

        const response = await client.post<WhatsAppResponseDto>(
          INFOBIP_ENDPOINTS.WHATSAPP.SEND_TEXT,
          payload
        );

        // Check if the response indicates success
        if (response.data.messageId) {
          this.logger.log(`WhatsApp text message sent successfully. Message ID: ${response.data.messageId}`);
          return response.data;
        } else {
          throw new BadRequestException('Invalid response from Infobip WhatsApp API');
        }

      } catch (error) {
        lastError = error;
        this.logger.error(`Failed to send WhatsApp text message (Attempt ${attempt}/${maxRetries}):`, {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          }
        });

        // Don't retry on validation errors or authentication errors
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const errorMessage = this.formatWhatsAppErrorMessage(lastError);
    this.logger.error('All attempts to send WhatsApp text message failed:', errorMessage);
    throw new BadRequestException(errorMessage);
  }

  private formatWhatsAppErrorMessage(error: any): string {
    if (error.response?.data?.requestError?.serviceException?.text) {
      return error.response.data.requestError.serviceException.text;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Bad request - Invalid WhatsApp data or configuration';
        case 401:
          return 'Unauthorized - Invalid API key or authentication';
        case 403:
          return 'Forbidden - Insufficient permissions or WhatsApp Business not configured in your Infobip account';
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
    
    return error.message || 'Failed to send WhatsApp message - Unknown error occurred';
  }

  async sendMediaMessage(
    messageData: WhatsAppMediaMessageDto, 
    mediaType: 'document' | 'image' | 'video' | 'audio' | 'sticker',
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    try {
      this.logger.log(`Sending WhatsApp ${mediaType} message to ${messageData.to}`);
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      // Format phone numbers
      const sender = this.formatPhoneNumber(this.configService.get('INFOBIP_WHATSAPP_SENDER') || '', true);
      const recipient = this.formatPhoneNumber(messageData.to, false);
      
      const payload = {
        from: sender,
        to: recipient,
        messageId: messageData.messageId || `msg-${Date.now()}`,
        content: {
          [mediaType]: {
            url: messageData.url,
            filename: messageData.filename,
            caption: messageData.caption,
          },
        },
        callbackData: messageData.callbackData,
        notifyUrl: messageData.notifyUrl,
        urlOptions: messageData.urlOptions,
      };

      const endpoint = INFOBIP_ENDPOINTS.WHATSAPP[`SEND_${mediaType.toUpperCase()}` as keyof typeof INFOBIP_ENDPOINTS.WHATSAPP];
      
      const response = await client.post<WhatsAppResponseDto>(endpoint, payload);

      this.logger.log(`WhatsApp ${mediaType} message sent successfully. Message ID: ${response.data.messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp ${mediaType} message:`, error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        `Failed to send WhatsApp ${mediaType} message`
      );
    }
  }

  async sendLocationMessage(
    messageData: WhatsAppLocationDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    try {
      this.logger.log(`Sending WhatsApp location message to ${messageData.to}`);
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      // Format phone numbers
      const sender = this.formatPhoneNumber(this.configService.get('INFOBIP_WHATSAPP_SENDER') || '', true);
      const recipient = this.formatPhoneNumber(messageData.to, false);
      
      const payload = {
        from: sender,
        to: recipient,
        messageId: messageData.messageId || `msg-${Date.now()}`,
        content: {
          location: {
            latitude: messageData.latitude,
            longitude: messageData.longitude,
            name: messageData.name,
            address: messageData.address,
          },
        },
        callbackData: messageData.callbackData,
        notifyUrl: messageData.notifyUrl,
        urlOptions: messageData.urlOptions,
      };

      const response = await client.post<WhatsAppResponseDto>(
        INFOBIP_ENDPOINTS.WHATSAPP.SEND_LOCATION,
        payload
      );

      this.logger.log(`WhatsApp location message sent successfully. Message ID: ${response.data.messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp location message:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to send WhatsApp location message'
      );
    }
  }

  async sendContactMessage(
    messageData: WhatsAppContactDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    try {
      this.logger.log(`Sending WhatsApp contact message to ${messageData.to}`);
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      // Format phone numbers
      const sender = this.formatPhoneNumber(this.configService.get('INFOBIP_WHATSAPP_SENDER') || '', true);
      const recipient = this.formatPhoneNumber(messageData.to, false);
      
      const payload = {
        from: sender,
        to: recipient,
        messageId: messageData.messageId || `msg-${Date.now()}`,
        content: {
          contact: {
            name: messageData.name,
            phoneNumber: messageData.phoneNumber,
            email: messageData.email,
            organization: messageData.organization,
          },
        },
        callbackData: messageData.callbackData,
        notifyUrl: messageData.notifyUrl,
        urlOptions: messageData.urlOptions,
      };

      const response = await client.post<WhatsAppResponseDto>(
        INFOBIP_ENDPOINTS.WHATSAPP.SEND_CONTACT,
        payload
      );

      this.logger.log(`WhatsApp contact message sent successfully. Message ID: ${response.data.messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp contact message:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to send WhatsApp contact message'
      );
    }
  }

  async sendTemplateMessage(
    messageData: WhatsAppTemplateDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    try {
      this.logger.log(`Sending WhatsApp template message to ${messageData.to}`);
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      // Format phone numbers
      const sender = this.formatPhoneNumber(this.configService.get('INFOBIP_WHATSAPP_SENDER') || '', true);
      const recipient = this.formatPhoneNumber(messageData.to, false);
      
      const payload = {
        from: sender,
        to: recipient,
        messageId: messageData.messageId || `msg-${Date.now()}`,
        content: {
          template: {
            name: messageData.templateName,
            language: messageData.language || 'en',
            variables: messageData.variables,
          },
        },
        callbackData: messageData.callbackData,
        notifyUrl: messageData.notifyUrl,
        urlOptions: messageData.urlOptions,
      };

      const response = await client.post<WhatsAppResponseDto>(
        INFOBIP_ENDPOINTS.WHATSAPP.SEND_TEMPLATE,
        payload
      );

      this.logger.log(`WhatsApp template message sent successfully. Message ID: ${response.data.messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp template message:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to send WhatsApp template message'
      );
    }
  }

  async sendMessage(
    messageData: SendWhatsAppMessageDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppResponseDto> {
    switch (messageData.type) {
      case WhatsAppMessageType.TEXT:
        return this.sendTextMessage({
          to: messageData.to,
          text: messageData.text!,
          messageId: messageData.messageId,
          campaignId: messageData.campaignId,
        }, authMethod);

      case WhatsAppMessageType.DOCUMENT:
      case WhatsAppMessageType.IMAGE:
      case WhatsAppMessageType.VIDEO:
      case WhatsAppMessageType.AUDIO:
      case WhatsAppMessageType.STICKER:
        return this.sendMediaMessage({
          to: messageData.to,
          url: messageData.url!,
          filename: messageData.filename,
          caption: messageData.caption,
          messageId: messageData.messageId,
        }, messageData.type, authMethod);

      case WhatsAppMessageType.LOCATION:
        return this.sendLocationMessage({
          to: messageData.to,
          latitude: messageData.latitude!,
          longitude: messageData.longitude!,
          name: messageData.locationName,
          address: messageData.locationAddress,
        }, authMethod);

      case WhatsAppMessageType.CONTACT:
        return this.sendContactMessage({
          to: messageData.to,
          name: messageData.contactName!,
          phoneNumber: messageData.contactPhone!,
          email: messageData.contactEmail,
          organization: messageData.contactOrganization,
        }, authMethod);

      case WhatsAppMessageType.TEMPLATE:
        return this.sendTemplateMessage({
          to: messageData.to,
          templateName: messageData.templateName!,
          language: messageData.templateLanguage,
          variables: messageData.templateVariables,
          messageId: messageData.messageId,
        }, authMethod);

      default:
        throw new BadRequestException(`Unsupported message type: ${messageData.type}`);
    }
  }

  async getTemplates(
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppTemplateInfoDto[]> {
    try {
      this.logger.log('Fetching WhatsApp templates');
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      const response = await client.get<{ templates: WhatsAppTemplateInfoDto[] }>(
        INFOBIP_ENDPOINTS.WHATSAPP.TEMPLATES
      );

      this.logger.log(`Retrieved ${response.data.templates.length} WhatsApp templates`);
      return response.data.templates;
    } catch (error) {
      this.logger.error('Failed to fetch WhatsApp templates:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to fetch WhatsApp templates'
      );
    }
  }

  async getWhatsAppReports(
    query: WhatsAppReportsQueryDto, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<{ results: WhatsAppReportDto[]; totalCount: number }> {
    try {
      this.logger.log('Fetching WhatsApp reports');
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      const params = new URLSearchParams();
      if (query.from) params.append('from', query.from);
      if (query.to) params.append('to', query.to);
      if (query.phoneNumber) params.append('phoneNumber', query.phoneNumber);
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await client.get<{ results: WhatsAppReportDto[]; totalCount: number }>(
        `${INFOBIP_ENDPOINTS.WHATSAPP.REPORTS}?${params.toString()}`
      );

      this.logger.log(`Retrieved ${response.data.results.length} WhatsApp reports`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch WhatsApp reports:', error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to fetch WhatsApp reports'
      );
    }
  }

  async getWhatsAppReportById(
    messageId: string, 
    authMethod: AuthMethod = 'oauth2'
  ): Promise<WhatsAppReportDto> {
    try {
      this.logger.log(`Fetching WhatsApp report for message ID: ${messageId}`);
      
      const client = await this.authService.getAuthenticatedClient(authMethod);
      
      const response = await client.get<WhatsAppReportDto>(
        `${INFOBIP_ENDPOINTS.WHATSAPP.REPORTS}/${messageId}`
      );

      this.logger.log(`Retrieved WhatsApp report for message ID: ${messageId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch WhatsApp report for message ID ${messageId}:`, error);
      throw new BadRequestException(
        error.response?.data?.requestError?.serviceException?.text || 
        'Failed to fetch WhatsApp report'
      );
    }
  }
}
