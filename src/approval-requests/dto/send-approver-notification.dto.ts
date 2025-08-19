import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendApproverNotificationDto {
  @ApiProperty({ required: true })
  @IsString()
  approvalRequestId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsappContent?: string;
}
