import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsDateString, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WhatsAppMessageType {
  TEXT = 'text',
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  LOCATION = 'location',
  CONTACT = 'contact',
  STICKER = 'sticker',
  TEMPLATE = 'template',
}

export class WhatsAppRecipientDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;
}

export class WhatsAppTextMessageDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'Hello! How can I help you today?' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'campaign-123' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ example: 'Callback data' })
  @IsOptional()
  @IsString()
  callbackData?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com/whatsapp' })
  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @ApiPropertyOptional({
    example: {
      shortenUrl: true,
      trackClicks: true,
      trackingUrl: 'https://example.com/click-report',
      removeProtocol: true
    }
  })
  @IsOptional()
  urlOptions?: {
    shortenUrl?: boolean;
    trackClicks?: boolean;
    trackingUrl?: string;
    removeProtocol?: boolean;
  };
}

export class WhatsAppMediaMessageDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'document.pdf' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ example: 'Check out this document' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'Callback data' })
  @IsOptional()
  @IsString()
  callbackData?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com/whatsapp' })
  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @ApiPropertyOptional({
    example: {
      shortenUrl: true,
      trackClicks: true,
      trackingUrl: 'https://example.com/click-report',
      removeProtocol: true
    }
  })
  @IsOptional()
  urlOptions?: {
    shortenUrl?: boolean;
    trackClicks?: boolean;
    trackingUrl?: string;
    removeProtocol?: boolean;
  };
}

export class WhatsAppLocationDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 'New York City' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Manhattan, NY' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'Callback data' })
  @IsOptional()
  @IsString()
  callbackData?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com/whatsapp' })
  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @ApiPropertyOptional({
    example: {
      shortenUrl: true,
      trackClicks: true,
      trackingUrl: 'https://example.com/click-report',
      removeProtocol: true
    }
  })
  @IsOptional()
  urlOptions?: {
    shortenUrl?: boolean;
    trackClicks?: boolean;
    trackingUrl?: string;
    removeProtocol?: boolean;
  };
}

export class WhatsAppContactDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Company Name' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'Callback data' })
  @IsOptional()
  @IsString()
  callbackData?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com/whatsapp' })
  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @ApiPropertyOptional({
    example: {
      shortenUrl: true,
      trackClicks: true,
      trackingUrl: 'https://example.com/click-report',
      removeProtocol: true
    }
  })
  @IsOptional()
  urlOptions?: {
    shortenUrl?: boolean;
    trackClicks?: boolean;
    trackingUrl?: string;
    removeProtocol?: boolean;
  };
}

export class WhatsAppTemplateDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'welcome_template' })
  @IsString()
  templateName: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  variables?: Record<string, string>[];

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'Callback data' })
  @IsOptional()
  @IsString()
  callbackData?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com/whatsapp' })
  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @ApiPropertyOptional({
    example: {
      shortenUrl: true,
      trackClicks: true,
      trackingUrl: 'https://example.com/click-report',
      removeProtocol: true
    }
  })
  @IsOptional()
  urlOptions?: {
    shortenUrl?: boolean;
    trackClicks?: boolean;
    trackingUrl?: string;
    removeProtocol?: boolean;
  };
}

export class WhatsAppTemplateInfoDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

export class WhatsAppReportDto {
  @ApiProperty()
  @IsString()
  messageId: string;

  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class WhatsAppReportsQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'DELIVERED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SendWhatsAppMessageDto {
  @ApiProperty({ enum: WhatsAppMessageType })
  @IsEnum(WhatsAppMessageType)
  type: WhatsAppMessageType;

  @ApiProperty()
  @IsString()
  to: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactOrganization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateLanguage?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  templateVariables?: Record<string, string>[];

  @ApiPropertyOptional({ example: 'message-123' })
  @IsOptional()
  @IsString()
  messageId?: string;

  @ApiPropertyOptional({ example: 'campaign-123' })
  @IsOptional()
  @IsString()
  campaignId?: string;
}
