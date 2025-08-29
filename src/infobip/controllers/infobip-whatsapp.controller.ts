import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InfobipWhatsAppService } from '../services/infobip-whatsapp.service';
import {
  InfobipAuthService,
  AuthMethod,
} from '../services/infobip-auth.service';
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
  WhatsAppMessageType,
} from '../dto/whatsapp.dto';
import { ApiResponseDto } from '../../core/application/dtos/api.response';

@ApiTags('Infobip WhatsApp')
@Controller('infobip/whatsapp')
@ApiBearerAuth('JWT-auth')
export class InfobipWhatsAppController {
  constructor(
    private readonly whatsappService: InfobipWhatsAppService,
    private readonly authService: InfobipAuthService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp message via Infobip' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(
    @Body() messageData: SendWhatsAppMessageDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.sendMessage(
      messageData,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp message sent successfully',
      result,
    );
  }

  @Post('send/text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp text message' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp text message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTextMessage(
    @Body() messageData: WhatsAppTextMessageDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.sendTextMessage(
      messageData,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp text message sent successfully',
      result,
    );
  }

  @Post('send/media')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Send WhatsApp media message (document, image, video, audio, sticker)',
  })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp media message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMediaMessage(
    @Body()
    messageData: WhatsAppMediaMessageDto & {
      mediaType: 'document' | 'image' | 'video' | 'audio' | 'sticker';
    },
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const { mediaType, ...data } = messageData;
    const result = await this.whatsappService.sendMediaMessage(
      data,
      mediaType,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp media message sent successfully',
      result,
    );
  }

  @Post('send/location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp location message' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp location message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendLocationMessage(
    @Body() messageData: WhatsAppLocationDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.sendLocationMessage(
      messageData,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp location message sent successfully',
      result,
    );
  }

  @Post('send/contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp contact message' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp contact message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendContactMessage(
    @Body() messageData: WhatsAppContactDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.sendContactMessage(
      messageData,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp contact message sent successfully',
      result,
    );
  }

  @Post('send/template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp template message' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp template message sent successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTemplateMessage(
    @Body() messageData: WhatsAppTemplateDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.sendTemplateMessage(
      messageData,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp template message sent successfully',
      result,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get WhatsApp templates' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp templates retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTemplates(
    @Request() req: any,
  ): Promise<ApiResponseDto<WhatsAppTemplateInfoDto[]>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.getTemplates(authMethod);
    return new ApiResponseDto(
      true,
      'WhatsApp templates retrieved successfully',
      result,
    );
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get WhatsApp reports' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp reports retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'phoneNumber', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getWhatsAppReports(
    @Query() query: WhatsAppReportsQueryDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<any>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.getWhatsAppReports(
      query,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp reports retrieved successfully',
      result,
    );
  }

  @Get('reports/:messageId')
  @ApiOperation({ summary: 'Get WhatsApp report by message ID' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp report retrieved successfully',
    type: ApiResponseDto<WhatsAppReportDto>,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getWhatsAppReportById(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ): Promise<ApiResponseDto<WhatsAppReportDto>> {
    // Use OAuth2 as primary authentication method
    const authMethod = 'oauth2';
    const result = await this.whatsappService.getWhatsAppReportById(
      messageId,
      authMethod,
    );
    return new ApiResponseDto(
      true,
      'WhatsApp report retrieved successfully',
      result,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'WhatsApp delivery status webhook' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async webhook(
    @Body() webhookData: any,
    @Headers() headers: any,
  ): Promise<void> {
    await this.whatsappService.processWebhook(webhookData, headers);
  }

  @Post('webhook/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test WhatsApp webhook with sample data' })
  @ApiResponse({
    status: 200,
    description: 'Test webhook processed successfully',
  })
  async testWebhook(): Promise<{ message: string; webhookUrl: string }> {
    const sampleWebhookData = {
      results: [
        {
          messageId: 'msg-1756486653310',
          from: '447860099299',
          to: '+1234567890',
          status: {
            groupId: 4,
            groupName: 'UNDELIVERABLE',
            id: 7010,
            name: 'EC_NO_SESSION',
            description: 'No session (code 7010)',
          },
          sentAt: '2024-01-29T10:30:00.000Z',
          doneAt: '2024-01-29T10:30:01.000Z',
          messageCount: 1,
          price: {
            pricePerMessage: 0.01,
            currency: 'USD',
          },
          error: {
            groupId: 4,
            groupName: 'HANDSET_ERRORS',
            id: 7010,
            name: 'EC_NO_SESSION',
            description: 'No session (code 7010)',
            permanent: false,
          },
        },
      ],
    };

    await this.whatsappService.processWebhook(sampleWebhookData, {});
    
    return {
      message: 'Test webhook processed successfully',
      webhookUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/infobip/whatsapp/webhook`,
    };
  }

  @Post('template/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test WhatsApp template message' })
  @ApiResponse({
    status: 200,
    description: 'Template message test completed',
  })
  async testTemplateMessage(): Promise<{ message: string; success: boolean }> {
    try {
      const templateData = {
        to: '+1234567890',
        templateName: 'approval_request_notification',
        language: 'en',
        variables: [
          { name: 'approval_request_code', value: 'AR-TEST-123' },
          { name: 'approver_name', value: 'Test User' },
          { name: 'approval_url', value: 'https://example.com/approval/123' },
        ],
      };

      const response = await this.whatsappService.sendTemplateMessage(templateData);
      
      return {
        message: `Template message sent successfully. Message ID: ${response.messageId}`,
        success: true,
      };
    } catch (error) {
      return {
        message: `Template message failed: ${error.message}`,
        success: false,
      };
    }
  }
}
