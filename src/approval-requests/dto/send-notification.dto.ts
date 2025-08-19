import { IsString, IsOptional, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EmailRecipientDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  subject: string;

  @ApiProperty({ required: true })
  @IsString()
  content: string;
}

export class WhatsAppRecipientDto {
  @ApiProperty({ required: true })
  @IsString()
  phone: string;

  @ApiProperty({ required: true })
  @IsString()
  message: string;
}

export class SendNotificationDto {
  @ApiProperty({ required: true })
  @IsString()
  approvalRequestId: string;

  @ApiProperty({ required: false, type: [EmailRecipientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailRecipientDto)
  emailRecipients?: EmailRecipientDto[];

  @ApiProperty({ required: false, type: [WhatsAppRecipientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppRecipientDto)
  whatsappRecipients?: WhatsAppRecipientDto[];
}

export class SendSingleEmailDto {
  @ApiProperty({ required: true })
  @IsString()
  approvalRequestId: string;

  @ApiProperty({ required: true })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ required: true })
  @IsString()
  subject: string;

  @ApiProperty({ required: true })
  @IsString()
  content: string;
}

export class SendSingleWhatsAppDto {
  @ApiProperty({ required: true })
  @IsString()
  approvalRequestId: string;

  @ApiProperty({ required: true })
  @IsString()
  recipientPhone: string;

  @ApiProperty({ required: true })
  @IsString()
  message: string;
}
