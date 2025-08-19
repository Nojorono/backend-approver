import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApprovalRequestService } from './approval-request.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { ApprovalRequest } from '../core/domain/entities/approval-request.entity';

@ApiTags('Approval Requests')
@Controller('approval-requests')
@ApiBearerAuth('JWT-auth')
export class ApprovalRequestController {
  constructor(private readonly approvalRequestService: ApprovalRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Approval Request' })
  @ApiResponse({
    status: 201,
    description: 'The Approval Request has been successfully created.',
    type: ApprovalRequest,
  })
  create(@Body() createApprovalRequestDto: CreateApprovalRequestDto) {
    return this.approvalRequestService.create(createApprovalRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Approval Requests' })
  @ApiResponse({ status: 200, description: 'Return all Approval Requests.', type: [ApprovalRequest] })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.approvalRequestService.findByStatus(status);
    }
    return this.approvalRequestService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get an Approval Request by code' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findByCode(@Param('code') code: string) {
    return this.approvalRequestService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an Approval Request by id' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findOne(@Param('id') id: string) {
    return this.approvalRequestService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully updated.',
    type: ApprovalRequest,
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  update(@Param('id') id: string, @Body() updateApprovalRequestDto: UpdateApprovalRequestDto) {
    return this.approvalRequestService.update(id, updateApprovalRequestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully soft deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  remove(@Param('id') id: string) {
    return this.approvalRequestService.remove(id);
  }

  @Get('with-deleted/:id')
  @ApiOperation({ summary: 'Get an Approval Request by id including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return the Approval Request including soft deleted.', type: ApprovalRequest })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  findWithDeleted(@Param('id') id: string) {
    return this.approvalRequestService.findWithDeleted(id);
  }

  @Get('all/with-deleted')
  @ApiOperation({ summary: 'Get all Approval Requests including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return all Approval Requests including soft deleted.', type: [ApprovalRequest] })
  findAllWithDeleted() {
    return this.approvalRequestService.findAllWithDeleted();
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore a soft deleted Approval Request' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been successfully restored.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  restore(@Param('id') id: string) {
    return this.approvalRequestService.restore(id);
  }

  @Delete('hard-delete/:id')
  @ApiOperation({ summary: 'Hard delete an Approval Request (permanent)' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Request has been permanently deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Request not found.' })
  hardDelete(@Param('id') id: string) {
    return this.approvalRequestService.hardDelete(id);
  }
}
