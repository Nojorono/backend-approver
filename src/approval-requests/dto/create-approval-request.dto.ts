import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApprovalRequestDto {
  @ApiProperty({ required: true })
  @IsString()
  subject: string;

  @ApiProperty({ required: true })
  @IsArray()
  @IsString({ each: true })
  approverIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
