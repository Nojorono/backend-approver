import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailAddressDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class EmailAttachmentDto {
  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  contentType: string;

  @ApiProperty({ example: 'base64-encoded-content' })
  @IsString()
  content: string;
}

export class SendEmailDto {
  @ApiPropertyOptional({
    example: 'noreply@kcsi.id',
    description: 'Optional: Uses registered sender if not provided',
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiProperty({ type: [EmailAddressDto] })
  @IsArray()
  to: EmailAddressDto[];

  @ApiPropertyOptional({ type: [EmailAddressDto] })
  @IsOptional()
  @IsArray()
  cc?: EmailAddressDto[];

  @ApiPropertyOptional({ type: [EmailAddressDto] })
  @IsOptional()
  @IsArray()
  bcc?: EmailAddressDto[];

  @ApiProperty({ example: 'Welcome to our platform!' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({
    example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ example: 'Welcome! Thank you for joining us.' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ type: [EmailAttachmentDto] })
  @IsOptional()
  @IsArray()
  attachments?: EmailAttachmentDto[];

  @ApiPropertyOptional({ example: 'campaign-123' })
  @IsOptional()
  @IsString()
  campaignId?: string;
}

export class ValidateEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class EmailValidationResponseDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  valid: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  suggestion?: string;
}

export class EmailReportDto {
  @ApiProperty()
  @IsString()
  messageId: string;

  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  from: string;

  @ApiProperty()
  @IsString()
  subject: string;

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
}

export class EmailReportsQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

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
