import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApprovalProcessStatus } from '../../core/domain/entities/approval-process.entity';

export class CreateApprovalProcessDto {
  @ApiProperty({ description: 'Approval Request ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  approvalRequestId: string;

  @ApiProperty({ description: 'Approver User ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  approverId: string;

  @ApiProperty({ enum: ApprovalProcessStatus })
  @IsEnum(ApprovalProcessStatus)
  status: ApprovalProcessStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reasonRejected?: string;
}


