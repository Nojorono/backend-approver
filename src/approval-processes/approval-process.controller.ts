import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApprovalProcessService } from './approval-process.service';
import { CreateApprovalProcessDto } from './dto/create-approval-process.dto';
import { ApprovalProcess } from '../core/domain/entities/approval-process.entity';

@ApiTags('Approval Processes')
@Controller('approval-process')
@ApiBearerAuth('JWT-auth')
export class ApprovalProcessController {
  constructor(private readonly service: ApprovalProcessService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Approval Process entry' })
  @ApiResponse({
    status: 201,
    description: 'The Approval Process has been successfully created.',
    type: ApprovalProcess,
  })
  create(@Body() dto: CreateApprovalProcessDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Approval Processes' })
  @ApiResponse({ status: 200, description: 'Return all Approval Processes.', type: [ApprovalProcess] })
  findAll() {
    return this.service.findAll();
  }

  @Get('by-approver/:approverId')
  @ApiOperation({ summary: 'Get all Approval Processes by approverId' })
  @ApiResponse({ status: 200, description: 'Return all Approval Processes by approverId.', type: [ApprovalProcess] })
  findByApproverId(@Param('approverId') approverId: string) {
    return this.service.findByApproverId(approverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an Approval Process by id' })
  @ApiResponse({ status: 200, description: 'Return the Approval Process.', type: ApprovalProcess })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an Approval Process' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Process has been successfully updated.',
    type: ApprovalProcess,
  })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  update(@Param('id') id: string, @Body() dto: CreateApprovalProcessDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an Approval Process' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Process has been successfully soft deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('with-deleted/:id')
  @ApiOperation({ summary: 'Get an Approval Process by id including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return the Approval Process including soft deleted.', type: ApprovalProcess })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  findWithDeleted(@Param('id') id: string) {
    return this.service.findWithDeleted(id);
  }

  @Get('all/with-deleted')
  @ApiOperation({ summary: 'Get all Approval Processes including soft deleted' })
  @ApiResponse({ status: 200, description: 'Return all Approval Processes including soft deleted.', type: [ApprovalProcess] })
  findAllWithDeleted() {
    return this.service.findAllWithDeleted();
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore a soft deleted Approval Process' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Process has been successfully restored.',
  })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }

  @Delete('hard-delete/:id')
  @ApiOperation({ summary: 'Hard delete an Approval Process (permanent)' })
  @ApiResponse({
    status: 200,
    description: 'The Approval Process has been permanently deleted.',
  })
  @ApiResponse({ status: 404, description: 'Approval Process not found.' })
  hardDelete(@Param('id') id: string) {
    return this.service.hardDelete(id);
  }
}


